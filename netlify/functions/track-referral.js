const { createClient } = require('@supabase/supabase-js');
const { verifyJwt } = require('./lib/verify-jwt');

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://bloomday.app').split(',').map(s => s.trim());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const origin = event.headers['origin'] || '';

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify JWT — new user must be authenticated
  const authHeader = event.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '');
  let user;
  try {
    user = await verifyJwt(token);
    if (!user) throw new Error('invalid token');
  } catch {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad JSON' }; }

  const { ref_code, new_user_id } = body;
  if (!ref_code || !new_user_id) {
    return { statusCode: 400, body: 'Missing ref_code or new_user_id' };
  }

  // Assert caller is the new user (verifyJwt returns { id, email })
  if (user.id !== new_user_id) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  // Find referrer by code
  const { data: referrer, error: findErr } = await supabase
    .from('stats')
    .select('user_id, refs_count')
    .eq('code', ref_code)
    .single();

  if (findErr || !referrer) {
    return { statusCode: 404, body: 'Referral code not found' };
  }

  // Prevent self-referral
  if (referrer.user_id === new_user_id) {
    return { statusCode: 400, body: 'Self-referral not allowed' };
  }

  // Insert referral — UNIQUE constraint prevents duplicates atomically
  const { error: insertErr } = await supabase.from('referrals').insert({
    referrer_id: referrer.user_id,
    referred_id: new_user_id,
  });

  if (insertErr) {
    // Unique violation = already tracked
    if (insertErr.code === '23505') {
      return { statusCode: 200, body: JSON.stringify({ already_tracked: true }) };
    }
    return { statusCode: 500, body: insertErr.message };
  }

  // Increment refs_count only after successful insert
  const { error: updateErr } = await supabase
    .from('stats')
    .update({ refs_count: (referrer.refs_count || 0) + 1 })
    .eq('user_id', referrer.user_id);

  if (updateErr) {
    return { statusCode: 500, body: updateErr.message };
  }

  const corsHeader = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': corsHeader },
    body: JSON.stringify({ success: true }),
  };
};
