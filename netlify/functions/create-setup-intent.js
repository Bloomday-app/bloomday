const https = require('https');

const ALLOWED_ORIGINS = [
  'https://rococo-chimera-459249.netlify.app',
  'https://bloomday-day.netlify.app',
  'https://bloomday.app',
  'https://mybloomday.app',
];

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const origin = event.headers.origin || event.headers.Origin || '';
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe not configured' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch(e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const email = (body.email || '').substring(0, 254);
  const planId = (body.plan || 'bloom').substring(0, 20);
  const userId = (body.userId || '').substring(0, 36);

  // Créer un Customer Stripe
  const customer = await stripePost('/v1/customers', secretKey, {
    email: email || undefined,
    metadata: { plan: planId, source: 'bloomday_trial' },
  });
  if (customer.error) {
    return { statusCode: 502, body: JSON.stringify({ error: customer.error.message }) };
  }

  // Store stripe_customer_id in Supabase profiles if userId provided
  if (userId) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const sbAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      await sbAdmin.from('profiles').upsert({
        id: userId,
        plan: planId,
        stripe_customer_id: customer.id,
        plan_activated_at: new Date().toISOString()
      });
    } catch (e) {}
  }

  // Créer un SetupIntent attaché au customer
  const intent = await stripePost('/v1/setup_intents', secretKey, {
    customer: customer.id,
    usage: 'off_session',
    metadata: { plan: planId },
  });
  if (intent.error) {
    return { statusCode: 502, body: JSON.stringify({ error: intent.error.message }) };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
    },
    body: JSON.stringify({
      clientSecret: intent.client_secret,
      customerId: customer.id,
    }),
  };
};

function stripePost(path, secretKey, params) {
  return new Promise((resolve) => {
    const body = Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => {
        if (typeof v === 'object') {
          return Object.entries(v).map(([mk, mv]) => `${encodeURIComponent(k+'['+mk+']')}=${encodeURIComponent(mv)}`).join('&');
        }
        return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
      })
      .join('&');

    const options = {
      hostname: 'api.stripe.com',
      path: path,
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'Stripe-Version': '2024-06-20',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({ error: { message: 'Invalid Stripe response' } }); }
      });
    });
    req.on('error', (e) => resolve({ error: { message: e.message } }));
    req.write(body);
    req.end();
  });
}
