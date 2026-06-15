const { createClient } = require('@supabase/supabase-js');
const { verifyJwt } = require('./lib/verify-jwt');
const webpush = require('web-push');

if (process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contact@mybloomday.app',
    'BFILQwBNmFyg3v3Far-dHOTm2VhgGWf6hLQKJryHcwKwJLo-8cqBii138Xds0-1M7PtabUs6LDaPTyuOcA8a01U',
    process.env.VAPID_PRIVATE_KEY
  );
}

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
    const title = typeof body.title === 'string' ? body.title.slice(0, 80) : '';
    const message = typeof body.message === 'string' ? body.message.slice(0, 500) : '';
    const type = ['announce', 'critical'].includes(body.type) ? body.type : 'announce';
    const targetType = ['all', 'free', 'premium', 'user'].includes(body.target_type) ? body.target_type : 'all';
    let targetUid = null;
    if (targetType === 'user' && body.target_email) {
      const { data: { users }, error: ue } = await supabase.auth.admin.listUsers();
      const found = (users || []).find(u => u.email === body.target_email);
      if (!found) return err(404, 'User not found');
      targetUid = found.id;
    }

    if (!message) return err(400, 'Missing message');

    const { data: notif, error } = await supabase
      .from('admin_notifications')
      .insert({ title, message, type, target_type: targetType, target_uid: targetUid, active: true })
      .select('id')
      .single();
    if (error) return err(500, error.message);

    // Push web synchrone avec timeout de sécurité
    let pushTotal = 0, pushSent = 0, pushFailed = 0;
    if (process.env.VAPID_PRIVATE_KEY && (targetType === 'all' || targetType === 'user')) {
      try {
        let subsQuery = supabase.from('push_subscriptions').select('endpoint, p256dh, auth, user_id');
        if (targetType === 'user' && targetUid) {
          subsQuery = subsQuery.eq('user_id', targetUid);
        }
        const { data: subs, error: subsErr } = await subsQuery;
        if (subsErr) console.warn('Push subscriptions query error:', subsErr.message);
        pushTotal = (subs || []).length;
        console.log(`Push: ${pushTotal} subscription(s) found for target=${targetType}`);
        if (pushTotal > 0) {
          const payload = JSON.stringify({ title: 'Bloomday', body: title ? title + '\n' + message : message });
          const withTimeout = (p) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))]);
          const results = await Promise.allSettled((subs || []).map(sub =>
            withTimeout(webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload
            ))
          ));
          results.forEach((r, i) => {
            if (r.status === 'fulfilled') { pushSent++; }
            else { pushFailed++; console.warn(`Push[${i}] failed:`, r.reason && r.reason.message); }
          });
          console.log(`Push result: sent=${pushSent} failed=${pushFailed} total=${pushTotal}`);
        }
      } catch (pushErr) {
        console.warn('Push sending error:', pushErr.message);
      }
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, pushTotal, pushSent, pushFailed }) };
  }

  return err(400, 'Unknown action');
};
