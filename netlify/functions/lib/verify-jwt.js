const https = require('https');

function verifyJwt(token) {
  return new Promise(function(resolve) {
    if (!token || typeof token !== 'string') { resolve(null); return; }
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) { resolve(null); return; }
    const url = new URL('/auth/v1/user', supabaseUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'apikey': serviceKey,
      },
    };
    const req = https.request(options, function(res) {
      var data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        try {
          const parsed = JSON.parse(data);
          resolve((parsed && parsed.id) ? { id: parsed.id, email: parsed.email || '' } : null);
        } catch (e) { resolve(null); }
      });
    });
    req.on('error', function() { resolve(null); });
    req.end();
  });
}

module.exports = { verifyJwt };
