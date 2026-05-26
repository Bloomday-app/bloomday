const https = require('https');

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const SYSTEM_PROMPT = "Tu es Bloom, l'assistant de Bloomday. Tu aides les visiteurs à comprendre Bloomday et les utilisateurs à rédiger des messages, trouver des idées cadeaux et utiliser l'application. Sois chaleureux, concis, et utilise un émoji de temps en temps. Ne parle que de Bloomday et des sujets liés (anniversaires, cadeaux, messages, célébrations).";

function err(status, msg) {
  return { statusCode: status, headers: CORS, body: JSON.stringify({ error: msg }) };
}

function groqRequest(messages) {
  return new Promise(function(resolve, reject) {
    var apiKey = process.env.GROQ_API_KEY;
    var payload = JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }].concat(messages),
      max_tokens: 500,
      temperature: 0.7
    });
    var options = {
      hostname: 'api.groq.com',
      port: 443,
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    var req = https.request(options, function(res) {
      var data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        try {
          var parsed = JSON.parse(data);
          if (!parsed.choices) console.error('Groq no choices:', JSON.stringify(parsed).substring(0, 300));
          var text = (parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content) || '';
          resolve(text);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { ...CORS, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }
  if (event.httpMethod !== 'POST') return err(405, 'Method not allowed');

  var body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return err(400, 'Invalid JSON'); }

  var messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) return err(400, 'Missing messages');
  if (messages.length > 20) return err(400, 'Too many messages');

  var last = messages[messages.length - 1];
  if (!last || typeof last.content !== 'string' || last.content.length > 500) return err(400, 'Invalid message');

  var apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return err(503, 'API key not configured — set GROQ_API_KEY in Netlify env vars');

  try {
    var reply = await groqRequest(messages);
    if (!reply) return err(502, 'Empty response from Groq');
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ reply: reply }) };
  } catch (e) {
    console.error('Groq error:', e && e.message);
    return err(500, 'Groq error: ' + (e && e.message || 'unknown'));
  }
};
