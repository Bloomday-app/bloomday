// netlify/functions/track-referral.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad JSON' }; }

  const { ref_code, new_user_id } = body;
  if (!ref_code || !new_user_id) {
    return { statusCode: 400, body: 'Missing ref_code or new_user_id' };
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

  // Check if already tracked
  const { data: alreadyTracked } = await supabase
    .from('referrals')
    .select('id')
    .eq('referrer_id', referrer.user_id)
    .eq('referred_id', new_user_id)
    .maybeSingle();

  if (alreadyTracked) {
    return { statusCode: 200, body: JSON.stringify({ already_tracked: true }) };
  }

  // Insert referral record
  await supabase.from('referrals').insert({
    referrer_id: referrer.user_id,
    referred_id: new_user_id,
    created_at: new Date().toISOString()
  });

  // Increment referrer's refs_count
  await supabase
    .from('stats')
    .update({ refs_count: (referrer.refs_count || 0) + 1 })
    .eq('user_id', referrer.user_id);

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
