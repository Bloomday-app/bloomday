const { verifyJwt } = require('./lib/verify-jwt');
const { createClient } = require('@supabase/supabase-js');

const ALLOWED_ORIGINS = [
  'https://rococo-chimera-459249.netlify.app',
  'https://bloomday-day.netlify.app',
  'https://bloomday.app',
  'https://mybloomday.app',
];

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization,Content-Type' },
      body: '',
    };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const origin = event.headers.origin || event.headers.Origin || '';
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  const token = (event.headers.authorization || '').replace('Bearer ', '');
  const user = await verifyJwt(token);
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Non autorisé' }) };
  }

  const sbAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Supprime toutes les données utilisateur
  await sbAdmin.from('members').delete().eq('user_id', user.id);
  await sbAdmin.from('groups').delete().eq('user_id', user.id);
  await sbAdmin.from('stats').delete().eq('user_id', user.id);
  await sbAdmin.from('profiles').delete().eq('id', user.id);

  // Supprime le compte auth
  const { error } = await sbAdmin.auth.admin.deleteUser(user.id);
  if (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin || '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin || '*' },
    body: JSON.stringify({ success: true }),
  };
};
