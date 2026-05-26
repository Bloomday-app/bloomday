const https = require('https');

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const SYSTEM_PROMPT = "Tu es Bloom, l'assistant de Bloomday. Tu aides les visiteurs à comprendre Bloomday et les utilisateurs à rédiger des messages, trouver des idées cadeaux et utiliser l'application. Sois chaleureux, concis, et utilise un émoji de temps en temps. Ne parle que de Bloomday et des sujets liés (anniversaires, cadeaux, messages, célébrations).";

function err(status, msg) {
  return { statusCode: status, headers: CORS, body: JSON.stringify({ error: msg }) };
}

function geminiRequest(messages) {
  return new Promise(function(resolve, reject) {
    var apiKey = process.env.GEMINI_API_KEY;
    var path = '/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;
    var payload = JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: messages.map(function(m) {
        return { role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] };
      })
    });
    var options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443, path: path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    };
    var req = https.request(options, function(res) {
      var data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        try {
          var parsed = JSON.parse(data);
          if (!parsed.candidates) console.error('Gemini no candidates:', JSON.stringify(parsed).substring(0, 300));
          var text = (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts && parsed.candidates[0].content.parts[0] && parsed.candidates[0].content.parts[0].text) || '';
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

  var apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return err(503, 'API key not configured — set GEMINI_API_KEY in Netlify env vars');

  try {
    var reply = await geminiRequest(messages);
    if (!reply) return err(502, 'Empty response from Gemini');
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ reply: reply }) };
  } catch (e) {
    console.error('Gemini error:', e && e.message);
    return err(500, 'Gemini error: ' + (e && e.message || 'unknown'));
  }
};
