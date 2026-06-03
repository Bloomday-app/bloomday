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

const VALID_TYPES = ['welcome', 'subscription', 'renewal_reminder', 'anniversary', 'survey_invite'];

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

const APP_URL = 'https://mybloomday.app';
const LOGO_URL = 'https://mybloomday.app/img/logo.png';

function header() {
  return `<div style="background:#5b2d8e;padding:28px 32px;text-align:center;border-radius:12px 12px 0 0">
    <img src="${LOGO_URL}" alt="Bloomday" width="64" height="64" style="border-radius:14px;display:block;margin:0 auto 12px">
    <span style="color:#fff;font-family:Georgia,serif;font-size:22px;font-weight:bold;letter-spacing:1px">Bloomday</span>
  </div>`;
}

function footer() {
  return `<div style="padding:20px 32px;background:#f9f4ff;border-radius:0 0 12px 12px;text-align:center">
    <p style="margin:0;color:#888;font-size:12px">L'équipe Bloomday · <a href="${APP_URL}" style="color:#5b2d8e;text-decoration:none">${APP_URL.replace('https://','')}</a></p>
  </div>`;
}

function btn(label, url) {
  return `<div style="text-align:center;margin:28px 0">
    <a href="${url}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#e85d9a,#5b2d8e);color:#fff;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;letter-spacing:0.3px">${label}</a>
  </div>`;
}

function wrap(content) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(91,45,142,0.10)">
    ${header()}
    <div style="padding:32px;background:#fff">${content}</div>
    ${footer()}
  </div>`;
}

function buildTemplate(type, d) {
  const firstName = esc((d.name || '').split(' ')[0]) || 'vous';

  const templates = {
    welcome: {
      subject: `🌸 Bienvenue dans la famille Bloomday, ${firstName} !`,
      text: `Bonjour ${firstName} !\n\nWaouh, vous êtes là ! Bienvenue dans Bloomday 🌸\n\nVotre compte est créé et 7 jours d'essai gratuits vous attendent.\n\nCe que vous pouvez faire dès maintenant :\n• Ajoutez vos proches et leurs dates importantes\n• Générez des messages personnalisés avec l'IA\n• Ne ratez plus jamais un anniversaire !\n\nOn est tellement contents de vous avoir parmi nous.\n\nÀ tout de suite sur Bloomday 🎉\nL'équipe Bloomday`,
      html: wrap(`
        <h2 style="margin:0 0 8px;color:#5b2d8e;font-size:22px">Waouh, vous êtes là, ${esc(firstName)} ! 🎉</h2>
        <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 20px">Bienvenue dans <strong>Bloomday</strong> — l'appli qui vous aide à ne jamais rater un moment important pour les gens que vous aimez. On est <em>vraiment</em> contents de vous avoir ici !</p>
        <div style="background:#f9f4ff;border-radius:10px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 10px;font-weight:bold;color:#5b2d8e">Vos 7 jours d'essai gratuits commencent maintenant ✨</p>
          <p style="margin:4px 0;color:#555;font-size:14px">✅ Ajoutez vos proches et leurs dates importantes</p>
          <p style="margin:4px 0;color:#555;font-size:14px">✅ Générez des messages touchants avec l'IA</p>
          <p style="margin:4px 0;color:#555;font-size:14px">✅ Ne ratez plus jamais un anniversaire 🎂</p>
        </div>
        ${btn('Découvrir Bloomday maintenant 🌸', APP_URL)}
        <p style="text-align:center;color:#888;font-size:13px;margin-top:8px">Prêt·e à faire sourire vos proches ?</p>
      `)
    },
    subscription: {
      subject: `🎊 Plan ${d.plan || 'Bloom'} activé — Merci de nous faire confiance !`,
      text: `Bonjour ${firstName} !\n\nVotre plan Bloomday ${d.plan || 'Bloom'} est maintenant actif.\n• 7 jours d'essai gratuits\n• Premier prélèvement dans 7 jours\n• Annulable à tout moment\n\nMerci infiniment de nous faire confiance 🌸\nL'équipe Bloomday`,
      html: wrap(`
        <h2 style="margin:0 0 8px;color:#5b2d8e;font-size:22px">C'est officiel, ${esc(firstName)} ! 🎊</h2>
        <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 20px">Votre plan <strong>${esc(d.plan || 'Bloom')}</strong> est actif. Merci infiniment de nous faire confiance — on va tout faire pour que vous ne soyez jamais déçu·e !</p>
        <div style="background:#f9f4ff;border-radius:10px;padding:20px;margin-bottom:24px">
          <p style="margin:4px 0;color:#555;font-size:14px">🎁 7 jours d'essai gratuits</p>
          <p style="margin:4px 0;color:#555;font-size:14px">📅 Premier prélèvement dans 7 jours</p>
          <p style="margin:4px 0;color:#555;font-size:14px">❌ Annulable à tout moment</p>
        </div>
        ${btn('Accéder à mon compte', APP_URL)}
      `)
    },
    renewal_reminder: {
      subject: `⏳ Plus que 3 jours — Ne perdez pas votre accès Bloomday`,
      text: `Bonjour ${firstName},\n\nVotre abonnement Bloomday ${d.plan || 'Bloom'} expire dans 3 jours.\n\nPour continuer à célébrer vos proches sans interruption, renouvelez dès maintenant.\n\nCode fidélité -10% : MERCI10\n\n→ ${APP_URL}\n\nL'équipe Bloomday`,
      html: wrap(`
        <h2 style="margin:0 0 8px;color:#5b2d8e;font-size:22px">Plus que 3 jours, ${esc(firstName)} ⏳</h2>
        <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 20px">Votre plan <strong>${esc(d.plan || 'Bloom')}</strong> arrive à expiration dans 3 jours. Tous vos proches, vos rappels, vos messages… continuez à les chérir sans interruption !</p>
        <div style="background:#fff3f8;border-radius:10px;padding:20px;margin-bottom:24px;border-left:4px solid #e85d9a">
          <p style="margin:0 0 6px;font-weight:bold;color:#e85d9a">Cadeau fidélité 🎁</p>
          <p style="margin:0;color:#555;font-size:14px"><strong>-10%</strong> sur votre renouvellement avec le code <code style="background:#f0e0ff;padding:2px 6px;border-radius:4px">MERCI10</code></p>
        </div>
        ${btn('Renouveler mon abonnement', APP_URL)}
      `)
    },
    anniversary: {
      subject: `🎂 1 an ensemble — Vous êtes incroyable, ${firstName} !`,
      text: `Bonjour ${firstName} !\n\nAujourd'hui ça fait exactement 1 an que vous utilisez Bloomday. UN AN ! 🎉\n\nMerci du fond du cœur d'être là depuis le début.\n\nPour fêter ça : -20% sur le plan supérieur avec le code BLOOM1AN.\n\nL'équipe Bloomday 🌸`,
      html: wrap(`
        <h2 style="margin:0 0 8px;color:#5b2d8e;font-size:22px">1 an ensemble, ${esc(firstName)} ! 🎂🎉</h2>
        <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 16px">Aujourd'hui ça fait exactement <strong>un an</strong> que vous utilisez Bloomday. <em>Un an !</em> On voulait juste vous dire que vous comptez énormément pour nous 💜</p>
        <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 20px">Grâce à vous et à toute notre communauté, Bloomday continue de grandir. Merci du fond du cœur d'être là depuis le début.</p>
        <div style="background:#f9f4ff;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center">
          <p style="margin:0 0 6px;font-weight:bold;color:#5b2d8e;font-size:16px">Cadeau anniversaire 🎁</p>
          <p style="margin:0;color:#555;font-size:14px"><strong>-20%</strong> sur le plan supérieur avec le code</p>
          <p style="margin:8px 0 0;font-size:20px;font-weight:bold;color:#e85d9a;letter-spacing:2px">BLOOM1AN</p>
        </div>
        ${btn('Découvrir les plans', APP_URL)}
      `)
    },
    survey_invite: {
      subject: `${esc(d.managerName || '')} t'invite à compléter ton profil — ${esc(d.teamName || '')}`,
      text: `${d.customMessage || `Bonjour ${d.firstName} ! ${d.managerName} t'invite à compléter ton profil pour l'équipe ${d.teamName}.`}\n\nCompléter mon profil : ${d.link}`,
      html: wrap(`
        <h2 style="margin:0 0 8px;color:#5b2d8e;font-size:22px">Bonjour ${esc(d.firstName || '')} ! 👋</h2>
        <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 16px">${esc(d.customMessage || `${d.managerName} t'invite à compléter ton profil pour l'équipe ${d.teamName}.`)}</p>
        <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 20px">Ça prend 2 minutes et permettra de ne jamais rater vos moments importants 🎂</p>
        ${btn('Compléter mon profil →', esc(d.link || ''))}
        <p style="text-align:center;color:#aaa;font-size:12px;margin-top:8px">Ou copie ce lien : ${esc(d.link || '')}</p>
      `)
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
