const { createClient } = require('@supabase/supabase-js');
const { verifyJwt } = require('./lib/verify-jwt');

const ADMIN_EMAIL = 'zekingfinance@gmail.com';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

function err(status, msg) {
  return { statusCode: status, headers: CORS, body: JSON.stringify({ error: msg }) };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { ...CORS, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }, body: '' };
  }
  if (event.httpMethod !== 'POST') return err(405, 'Method not allowed');

  const auth = event.headers.authorization || event.headers.Authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return err(401, 'No token');

  const payload = await verifyJwt(token);
  if (!payload) return err(401, 'Invalid token');
  if (payload.email !== ADMIN_EMAIL) return err(403, 'Forbidden');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return err(400, 'Invalid JSON'); }
  const { action } = body;

  if (action === 'stats') {
    try {
      const { count: totalUsers, error: e1 } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (e1) return err(500, e1.message);
      const ago30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: activeUsers, error: e2 } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', ago30);
      if (e2) return err(500, e2.message);
      const { count: premiumUsers, error: e3 } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).not('plan', 'in', '("free","")');
      if (e3) return err(500, e3.message);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ totalUsers: totalUsers || 0, activeUsers: activeUsers || 0, premiumUsers: premiumUsers || 0 }) };
    } catch (e) { return err(500, 'Stats query failed'); }
  }

  if (action === 'users') {
    const page = Math.max(0, parseInt(body.page, 10) || 0);
    const search = typeof body.search === 'string' ? body.search.slice(0, 100) : '';
    let q = supabase.from('profiles').select('id,email,created_at,plan,updated_at').order('created_at', { ascending: false }).range(page * 20, page * 20 + 19);
    if (search) q = q.ilike('email', '%' + search + '%');
    const { data, error } = await q;
    if (error) return err(500, error.message);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ users: data || [] }) };
  }

  if (action === 'user_detail') {
    const uid = body.uid;
    if (!uid || typeof uid !== 'string' || uid.length > 36) return err(400, 'Missing uid');
    const { data: contacts, error: ce } = await supabase.from('bdg16_members').select('name,day,month,year,type').eq('user_id', uid);
    if (ce) return err(500, ce.message);
    const { data: profile, error: pe } = await supabase.from('profiles').select('email,plan,created_at').eq('id', uid).single();
    if (pe && pe.code !== 'PGRST116') return err(500, pe.message);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ profile: profile || {}, contacts: contacts || [] }) };
  }

  if (action === 'notify') {
    const message = typeof body.message === 'string' ? body.message.slice(0, 500) : '';
    if (!message) return err(400, 'Missing message');
    const { error } = await supabase.from('admin_notifications').insert({ message, active: true });
    if (error) return err(500, error.message);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
  }

  return err(400, 'Unknown action');
};
