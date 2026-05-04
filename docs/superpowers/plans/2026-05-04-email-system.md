# Email System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the no-op `sendEmail()` stub with a real Brevo transactional email integration that sends welcome, subscription confirmation, renewal reminder, and anniversary emails.

**Architecture:** A new Netlify Function `send-email.js` receives `{ type, data }` from the frontend, builds an HTML email, and posts it to Brevo's transactional API. The existing `sendEmail()` function in `render.js` is updated to call this endpoint asynchronously. All existing call sites remain unchanged.

**Tech Stack:** Node.js (Netlify Functions), Brevo Transactional Email API v3, vanilla JS frontend, no additional npm packages needed.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `netlify/functions/send-email.js` | CREATE | Brevo API call, HTML template builder, input validation |
| `js/render.js` | MODIFY line ~340 | Replace stub `sendEmail()` with async fetch to `/.netlify/functions/send-email` |

Call sites in `js/features.js:392` and `js/features.js:452` and `js/render.js:356,367` are **not modified** — they already pass the right arguments.

---

## Task 1: Create `netlify/functions/send-email.js`

**Files:**
- Create: `netlify/functions/send-email.js`

- [ ] **Step 1: Create the file with CORS helper and input validation**

```js
const https = require('https');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

function err(status, msg) {
  return { statusCode: status, headers: CORS, body: JSON.stringify({ error: msg }) };
}

const VALID_TYPES = ['welcome', 'subscription', 'renewal_reminder', 'anniversary'];

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') return err(405, 'Method Not Allowed');

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
```

- [ ] **Step 2: Add `buildTemplate()` with all 4 email types**

```js
function buildTemplate(type, d) {
  const firstName = (d.name || '').split(' ')[0] || 'vous';

  const templates = {
    welcome: {
      subject: `Bienvenue sur Bloomday, ${firstName} ! 🌸`,
      text: `Bonjour ${firstName},\n\nVotre compte Bloomday est créé !\n• 7 jours d'essai offerts sur le plan Bloom\n• Ajoutez vos premiers membres et générez votre premier message\n\nBienvenue dans la communauté 🌸\nL'équipe Bloomday\nmybloomday.app`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#e85d9a">Bienvenue sur Bloomday, ${firstName} ! 🌸</h2>
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
        <h2 style="color:#e85d9a">Plan ${d.plan || 'Bloom'} activé ✓</h2>
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
        <p>Votre plan <strong>${d.plan || 'Bloom'}</strong> arrive à expiration.</p>
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
        <h2 style="color:#e85d9a">Ça fait 1 an ensemble, ${firstName} 🎉</h2>
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
```

- [ ] **Step 3: Add `sendViaBrevo()` helper**

```js
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
          resolve(JSON.parse(raw));
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
```

- [ ] **Step 4: Test the function locally with netlify dev**

In terminal:
```bash
cd /Users/dadou/Documents/bloomday
netlify dev
```

In a second terminal, send a test request:
```bash
curl -X POST http://localhost:8888/.netlify/functions/send-email \
  -H "Content-Type: application/json" \
  -d '{"type":"welcome","data":{"email":"YOUR_EMAIL@gmail.com","name":"Test User","plan":"Bloom"}}'
```

Expected response: `{"success":true}`
Expected: email received in inbox within 1-2 minutes.

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/send-email.js
git commit -m "feat: add send-email Netlify function via Brevo API"
```

---

## Task 2: Update `sendEmail()` in `render.js`

**Files:**
- Modify: `js/render.js` ~line 340

- [ ] **Step 1: Replace the stub with an async fetch call**

Find this code in `js/render.js` (around line 340):
```js
function sendEmail(type, data){
  var tpl = EMAIL_TEMPLATES[type];
  if(!tpl) return;
  var email = tpl(data);
  showToast(t('emailSentTo')+' '+data.email, 'success');
}
```

Replace with:
```js
function sendEmail(type, data){
  if(!data||!data.email) return;
  fetch('/.netlify/functions/send-email', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({type, data})
  }).catch(function(){});
}
```

Note: The toast notification is removed — email sending is now silent and non-blocking. The `EMAIL_TEMPLATES` object in `render.js` is kept as-is (it still defines subjects/text used for display elsewhere if needed).

- [ ] **Step 2: Verify call sites are still compatible**

Check these 4 call sites pass `data.email`:
- `js/render.js:356` → `{email:currentUser.email, plan:...}` ✓
- `js/render.js:367` → `{email:currentUser.email, name:..., plan:...}` ✓
- `js/features.js:392` → `{name:name, email:email}` ✓
- `js/features.js:452` → `{email:email, plan:pn.name}` ✓

No changes needed at call sites.

- [ ] **Step 3: Test manually in browser**

1. Run `netlify dev`
2. Open `http://localhost:8888`
3. Create a new account with a real email address
4. Expected: welcome email arrives in inbox within 2 minutes

- [ ] **Step 4: Commit**

```bash
git add js/render.js
git commit -m "feat: wire sendEmail() to Brevo Netlify function"
```

---

## Task 3: Deploy and verify in production

- [ ] **Step 1: Push to main and wait for Netlify deploy**

```bash
git push origin main
```

Watch deploy at `app.netlify.com` — should complete in ~1 minute.

- [ ] **Step 2: Verify BREVO_API_KEY is set in production**

In Netlify dashboard: Site configuration → Environment variables → confirm `BREVO_API_KEY` is present.

- [ ] **Step 3: Smoke test in production**

Create a test account on the live site with a real email.
Expected: welcome email arrives within 2 minutes from `noreply@mybloomday.app`.

- [ ] **Step 4: Check Brevo dashboard for delivery confirmation**

In Brevo → **Emails transactionnels** → verify the send appears with status "Délivré".

---

## Self-Review

**Spec coverage:**
- ✅ Netlify Function `send-email.js` with `{ type, to, data }` interface — covered in Task 1
- ✅ 4 email types (welcome, subscription, renewal_reminder, anniversary) — covered in Task 1 Step 2
- ✅ Sender `noreply@mybloomday.app` — in `sendViaBrevo()` Task 1 Step 3
- ✅ Frontend `sendEmail()` replaced — Task 2
- ✅ Existing call sites unchanged — Task 2 Step 2
- ✅ `BREVO_API_KEY` from env var — Task 1 Step 1, Task 3 Step 2
- ✅ Silent fail (non-blocking) — Task 2 Step 1 `.catch(function(){})`

**No placeholders:** All code is complete and concrete.

**Type consistency:** `sendEmail(type, data)` signature is consistent across definition (render.js) and all 4 call sites. `data.email` used as recipient throughout.
