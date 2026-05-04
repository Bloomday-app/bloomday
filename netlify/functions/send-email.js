const https = require('https');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

const ALLOWED_ORIGINS = [
  'https://rococo-chimera-459249.netlify.app',
  'https://bloomday-day.netlify.app',
  'https://bloomday.app',
  'https://mybloomday.app',
];

function err(status, msg) {
  return { statusCode: status, headers: CORS, body: JSON.stringify({ error: msg }) };
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const VALID_TYPES = ['welcome', 'subscription', 'renewal_reminder', 'anniversary'];

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') return err(405, 'Method Not Allowed');

  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return err(403, 'Forbidden');

  let type, data;
  try {
    ({ type, data } = JSON.parse(event.body || '{}'));
  } catch (e) {
    return err(400, 'Invalid JSON');
  }

  if (!VALID_TYPES.includes(type)) return err(400, 'Invalid email type');
  if (!data || !data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return err(400, 'Invalid recipient email');
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return err(500, 'Email service not configured');

  const tpl = buildTemplate(type, data);

  try {
    await sendViaBrevo(apiKey, data.email, tpl.subject, tpl.html, tpl.text);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
  } catch (e) {
    console.error('[send-email] Brevo error:', e.message);
    return err(502, 'Failed to send email');
  }
};

function buildTemplate(type, d) {
  const firstName = esc((d.name || '').split(' ')[0]) || 'vous';

  const templates = {
    welcome: {
      subject: `Bienvenue sur Bloomday, ${firstName} ! 🌸`,
      text: `Bonjour ${firstName},\n\nVotre compte Bloomday est créé !\n• 7 jours d'essai offerts sur le plan Bloom\n• Ajoutez vos premiers membres et générez votre premier message\n\nBienvenue dans la communauté 🌸\nL'équipe Bloomday\nmybloomday.app`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#e85d9a">Bienvenue sur Bloomday, ${esc(firstName)} ! 🌸</h2>
        <p>Votre compte est créé. Voici ce qui vous attend :</p>
        <ul>
          <li>7 jours d'essai gratuits sur le plan Bloom</li>
          <li>Ajoutez vos premiers membres</li>
          <li>Générez votre premier message IA</li>
        </ul>
        <a href="https://mybloomday.app" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#e85d9a;color:#fff;border-radius:8px;text-decoration:none">Ouvrir Bloomday</a>
        <p style="margin-top:32px;color:#888;font-size:13px">L'équipe Bloomday · mybloomday.app</p>
      </div>`
    },
    subscription: {
      subject: `Confirmation — Plan ${d.plan || 'Bloom'} activé ✓`,
      text: `Bonjour,\n\nVotre plan Bloomday ${d.plan || 'Bloom'} est actif.\n• 7 jours d'essai gratuits\n• Premier prélèvement dans 7 jours\n• Annulable à tout moment\n\nMerci de nous faire confiance 🌸\nmybloomday.app`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#e85d9a">Plan ${esc(d.plan || 'Bloom')} activé ✓</h2>
        <p>Votre abonnement Bloomday est maintenant actif.</p>
        <ul>
          <li>7 jours d'essai gratuits</li>
          <li>Premier prélèvement dans 7 jours</li>
          <li>Annulable à tout moment</li>
        </ul>
        <a href="https://mybloomday.app" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#e85d9a;color:#fff;border-radius:8px;text-decoration:none">Accéder à mon compte</a>
        <p style="margin-top:32px;color:#888;font-size:13px">L'équipe Bloomday · mybloomday.app</p>
      </div>`
    },
    renewal_reminder: {
      subject: `Votre abonnement Bloomday expire dans 3 jours ⏳`,
      text: `Bonjour,\n\nVotre abonnement Bloomday ${d.plan || 'Bloom'} expire dans 3 jours.\n\nCode fidélité -10% : MERCI10\n\n→ Renouveler sur mybloomday.app\n\nL'équipe Bloomday`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#e85d9a">Votre abonnement expire dans 3 jours ⏳</h2>
        <p>Votre plan <strong>${esc(d.plan || 'Bloom')}</strong> arrive à expiration.</p>
        <p>Continuez à célébrer vos proches sans interruption.</p>
        <p style="background:#fff3f8;padding:12px;border-radius:8px">Code fidélité <strong>-10%</strong> : <code>MERCI10</code></p>
        <a href="https://mybloomday.app" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#e85d9a;color:#fff;border-radius:8px;text-decoration:none">Renouveler mon abonnement</a>
        <p style="margin-top:32px;color:#888;font-size:13px">L'équipe Bloomday · mybloomday.app</p>
      </div>`
    },
    anniversary: {
      subject: `Ça fait 1 an ensemble 🎉`,
      text: `Bonjour ${firstName},\n\nAujourd'hui, ça fait exactement 1 an que vous utilisez Bloomday !\n\nMerci d'être là. Pour vous : -20% sur le plan supérieur avec le code BLOOM1AN.\n\nL'équipe Bloomday 🌸`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#e85d9a">Ça fait 1 an ensemble, ${esc(firstName)} 🎉</h2>
        <p>Aujourd'hui, ça fait exactement <strong>1 an</strong> que vous utilisez Bloomday.</p>
        <p>Merci d'être là. En cadeau :</p>
        <p style="background:#fff3f8;padding:12px;border-radius:8px"><strong>-20%</strong> sur le plan supérieur : <code>BLOOM1AN</code></p>
        <a href="https://mybloomday.app" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#e85d9a;color:#fff;border-radius:8px;text-decoration:none">Découvrir les plans</a>
        <p style="margin-top:32px;color:#888;font-size:13px">L'équipe Bloomday · mybloomday.app</p>
      </div>`
    }
  };

  return templates[type];
}

function sendViaBrevo(apiKey, toEmail, subject, htmlContent, textContent) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      sender: { name: 'Bloomday', email: 'noreply@mybloomday.app' },
      to: [{ email: toEmail }],
      subject,
      htmlContent,
      textContent
    });

    const req = https.request({
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(raw)); } catch (e) { resolve({}); }
        } else {
          reject(new Error(`Brevo ${res.statusCode}: ${raw}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
