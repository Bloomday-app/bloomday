# Wave 3 — Plan d'implémentation Bloomday

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter 6 fonctionnalités à mybloomday.app : OG fix, hero banner illustrée, footer légal, panel admin fondateur, chatbot Gemini Flash, suggestions fleurs affiliées.

**Architecture:** Vanilla JS ES6+ sans bundler. Les nouvelles Netlify Functions (chat, admin) suivent le pattern de `netlify/functions/generate-message.js`. Toutes les strings passent par `t('clé')` avec 7 langues. `esc()` obligatoire pour tout contenu user dans `innerHTML`.

**Tech Stack:** HTML5, CSS custom, Vanilla JS ES6+, Supabase (auth + data), Netlify Functions (Node.js), Google Gemini Flash API.

---

## Fichiers touchés

| Fichier | Action | Chantier |
|---------|--------|----------|
| `index.html` | Modifier — meta OG, hero DOM, footer DOM, admin DOM, chat DOM, fleurs DOM | 1,2,3,4,5,6 |
| `css/app.css` | Modifier — hero split, footer, modales légales, admin, chat widget | 1,2,3,4,5,6 |
| `js/i18n.js` | Modifier — ajouter clés 7 langues | 2,3,4,5,6 |
| `js/render.js` | Modifier — bouton fleurs dans upcoming cards | 5 |
| `js/features.js` | Modifier — showFlowerIdeas(), showLegal(), initChat() | 2,4,5 |
| `js/core.js` | Modifier — showSec() étendu admin, rAdmin(), checkAdminNotifications() | 3 |
| `js/auth.js` | Modifier — checkAdmin() au login | 3 |
| `netlify/functions/chat.js` | Créer — proxy Gemini Flash | 4 |
| `netlify/functions/admin.js` | Créer — API admin Supabase service_role | 3 |
| `netlify.toml` | Modifier — CSP connect-src + img-src | tout |
| `img/og-cover.png` | Régénérer — avec vrai logo | 1 |
| `img/og-generate.html` | Créer — template HTML pour générer l'OG | 1 |
| `img/hero-photo.jpg` | Créer — photo Unsplash téléchargée | 2 |

---

## Tâche 1 — OG : corriger les meta tags

**Fichiers :**
- Modifier : `index.html` lignes 14-22

- [ ] **Étape 1.1 : Corriger les URLs dans index.html**

Remplacer dans `index.html` :

```html
<!-- Avant -->
<meta property="og:image" content="https://bloomday-day.netlify.app/img/og-cover.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://bloomday-day.netlify.app">
<meta name="twitter:image" content="https://bloomday-day.netlify.app/img/og-cover.png">

<!-- Après -->
<meta property="og:image" content="https://mybloomday.app/img/og-cover.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://mybloomday.app">
<meta name="twitter:image" content="https://mybloomday.app/img/og-cover.png">
```

- [ ] **Étape 1.2 : Créer le template HTML pour l'OG image**

Créer `img/og-generate.html` :

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#FFF8F0;font-family:'DM Sans',sans-serif;display:flex;align-items:center;padding:0 80px;gap:60px;overflow:hidden;position:relative}
img.logo{width:160px;height:160px;border-radius:32px;flex-shrink:0}
.content{flex:1}
.brand{font-size:64px;font-weight:800;color:#2D1B14;line-height:1}
.tag{font-size:32px;color:#8B6F60;margin-top:12px}
.badges{display:flex;gap:12px;margin-top:28px;flex-wrap:wrap}
.badge{background:#F5EFE6;border-radius:24px;padding:10px 20px;font-size:22px;color:#2D1B14;font-weight:600}
.url{position:absolute;bottom:28px;left:80px;font-size:18px;color:#C8B8A2}
</style>
</head>
<body>
<img class="logo" src="logo.png" alt="Bloomday">
<div class="content">
  <div class="brand">Bloomday</div>
  <div class="tag">Le jour où tu fleuris 🌸</div>
  <div class="badges">
    <div class="badge">✨ Messages IA</div>
    <div class="badge">🎁 Idées cadeaux</div>
    <div class="badge">🌍 Fêtes du monde</div>
  </div>
</div>
<div class="url">mybloomday.app</div>
</body>
</html>
```

- [ ] **Étape 1.3 : Générer og-cover.png via Playwright**

Ouvrir `img/og-generate.html` dans le navigateur via Playwright MCP, prendre un screenshot à 1200×630, sauvegarder dans `img/og-cover.png` :

```
browser_navigate → file:///Users/dadou/Documents/bloomday/img/og-generate.html
browser_resize → width: 1200, height: 630
browser_take_screenshot → chemin img/og-cover.png
```

- [ ] **Étape 1.4 : Vérifier et commiter**

```bash
node --check js/i18n.js
git add index.html img/og-cover.png img/og-generate.html
git commit -m "fix(og): URLs corrigées vers mybloomday.app + og-cover régénéré avec vrai logo"
```

---

## Tâche 2 — Hero banner illustrée

**Fichiers :**
- Modifier : `index.html` section `#land .hero` (lignes ~121-151)
- Modifier : `css/app.css`
- Modifier : `js/i18n.js` — clé `heroPhotoAlt`
- Créer : `img/hero-photo.jpg`

- [ ] **Étape 2.1 : Télécharger la photo Unsplash**

Aller sur `https://unsplash.com/s/photos/woman-smiling-phone` (licence gratuite Unsplash License).
Choisir une photo de femme souriante tenant son téléphone, ambiance chaleureuse.
Télécharger la version large et sauvegarder dans `img/hero-photo.jpg`.

- [ ] **Étape 2.2 : Remplacer le DOM du hero dans index.html**

Localiser la section `<div class="hero">` (ligne ~121) et remplacer jusqu'à la balise fermante du hero (avant `<div id="pricing-table-container"`).

Remplacer par :

```html
<div class="hero">
  <div class="hi2">
    <div class="bl" style="display:flex;width:100%;justify-content:space-between!important;padding:0 24px">
      <div style="display:flex;align-items:center;gap:10px">
        <svg class="bico" width="32" height="32"><use href="#bi"/></svg>
        <div><div class="bwm" style="font-size:24px;color:#2D1B14">Bloomday</div><span class="btag" style="color:#8B6F60" data-i18n="heroTagline">Le jour où tu fleuris</span></div>
      </div>
      <button class="btn sm" onclick="showAuth('login')" data-i18n="btnLogin">Connexion</button>
    </div>
  </div>

  <div class="hero-split">
    <div class="hero-text">
      <h1><span data-i18n="heroTitle1">Célébrez chaque personne</span><br><span data-i18n="heroTitle2">qui compte pour vous</span></h1>
      <p data-i18n="heroSub2">Messages IA personnalisés, idées cadeaux, fêtes du monde entier.</p>
      <div class="hbdg" data-i18n="heroCta">🌸 7 jours gratuits · Sans carte bancaire</div>
      <button class="btn P" style="margin-top:16px;padding:14px 28px;font-size:16px" onclick="goLand()" data-i18n="landCta">🌸 Créer mon Bloomday gratuit</button>
    </div>
    <div class="hero-visual">
      <img src="img/hero-photo.jpg" class="hero-photo" alt="" data-i18n-alt="heroPhotoAlt">
      <div class="hero-phone-mockup">
        <div class="hpm-bar">
          <div class="hpm-avatar">M</div>
          <div class="hpm-name">Marie</div>
          <div class="hpm-status">●</div>
        </div>
        <div class="hpm-bubble">🌸 Joyeux anniversaire Marie ! Que cette journée soit aussi lumineuse que ton sourire.</div>
        <div class="hpm-time">09:42 ✓✓</div>
        <div class="hpm-reaction">🥹 ❤️</div>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Étape 2.3 : Ajouter le CSS du hero dans css/app.css**

```css
/* ── HERO SPLIT ── */
.hero-split{display:flex;flex-direction:column}
.hero-text{padding:28px 20px 20px;display:flex;flex-direction:column;gap:10px}
.hero-text h1{font-family:var(--ff-title);font-size:28px;font-weight:800;color:#2D1B14;line-height:1.2}
.hero-text p{font-size:14px;color:#8B6F60;line-height:1.5}
.hero-visual{position:relative;width:100%;overflow:hidden}
.hero-photo{width:100%;height:240px;object-fit:cover;object-position:top;display:block}
.hero-phone-mockup{position:absolute;bottom:12px;right:12px;background:white;border-radius:14px;padding:10px 12px;width:180px;box-shadow:0 8px 24px rgba(0,0,0,.2);font-size:11px}
.hpm-bar{display:flex;align-items:center;gap:6px;margin-bottom:6px;border-bottom:1px solid #f0f0f0;padding-bottom:6px}
.hpm-avatar{background:#25D366;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
.hpm-name{font-weight:700;color:#1a1a1a;font-size:11px;flex:1}
.hpm-status{color:#25D366;font-size:8px}
.hpm-bubble{background:#DCF8C6;border-radius:8px 8px 2px 8px;padding:7px 9px;color:#1a1a1a;line-height:1.4;font-size:10px}
.hpm-time{font-size:8px;color:#999;text-align:right;margin-top:3px}
.hpm-reaction{font-size:14px;margin-top:4px}

@media(min-width:768px){
  .hero-split{flex-direction:row;align-items:stretch;min-height:420px}
  .hero-text{flex:1;padding:48px 40px;justify-content:center}
  .hero-text h1{font-size:40px}
  .hero-visual{flex:1;min-height:420px}
  .hero-photo{height:100%}
  .hero-phone-mockup{bottom:24px;right:24px;width:220px;font-size:12px;padding:14px 16px}
}
```

- [ ] **Étape 2.4 : Ajouter heroPhotoAlt dans js/i18n.js (7 langues)**

```javascript
// fr
heroPhotoAlt:'Quelqu\'un envoie un message Bloomday avec le sourire',
// en
heroPhotoAlt:'Someone smiling while sending a Bloomday message',
// es
heroPhotoAlt:'Alguien sonriendo mientras envía un mensaje Bloomday',
// ar
heroPhotoAlt:'شخص يبتسم أثناء إرسال رسالة Bloomday',
// hi
heroPhotoAlt:'कोई मुस्कुराते हुए Bloomday संदेश भेज रहा है',
// zh
heroPhotoAlt:'有人微笑着发送Bloomday消息',
// pt
heroPhotoAlt:'Alguém sorrindo enquanto envia uma mensagem Bloomday',
```

Appliquer l'attribut alt via JS dans `js/helpers.js` ou `js/i18n.js` — chercher la fonction qui applique `data-i18n` et étendre pour `data-i18n-alt` :

```javascript
document.querySelectorAll('[data-i18n-alt]').forEach(function(el){
  el.alt = t(el.getAttribute('data-i18n-alt'));
});
```

- [ ] **Étape 2.5 : Vérifier et commiter**

```bash
node --check js/i18n.js
git add index.html css/app.css js/i18n.js img/hero-photo.jpg
git commit -m "feat(hero): bannière split desktop / stack mobile avec photo Unsplash"
```

---

## Tâche 3 — Footer légal avec modales

**Fichiers :**
- Modifier : `index.html`
- Modifier : `css/app.css`
- Modifier : `js/i18n.js`
- Modifier : `js/features.js`

- [ ] **Étape 3.1 : Ajouter le footer DOM dans index.html**

Juste avant la balise `</div>` qui ferme `#land`, ajouter :

```html
<!-- ═══════ FOOTER LÉGAL ═══════ -->
<div id="footer-legal">
  <div class="footer-links">
    <span onclick="showLegal('faq')" data-i18n="footerFaq">FAQ</span>
    <span onclick="showLegal('cgu')" data-i18n="footerCgu">Conditions d'utilisation</span>
    <span onclick="showLegal('rgpd')" data-i18n="footerRgpd">Politique de confidentialité</span>
    <span onclick="showLegal('about')" data-i18n="footerAbout">À propos</span>
  </div>
  <div class="footer-copy" data-i18n="footerCopy">© 2026 Bloomday · mybloomday.app</div>
</div>

<!-- ═══════ MODAL LÉGAL ═══════ -->
<div id="modal-legal" style="display:none" onclick="if(event.target===this)closeLegal()">
  <div id="modal-legal-inner">
    <button class="modal-close-btn" onclick="closeLegal()">✕</button>
    <div id="modal-legal-content"></div>
  </div>
</div>
```

- [ ] **Étape 3.2 : CSS footer + modal dans css/app.css**

```css
/* ── FOOTER LÉGAL ── */
#footer-legal{background:linear-gradient(135deg,#1A0533,#2D1B69);padding:24px 20px 32px;text-align:center}
.footer-links{display:flex;flex-wrap:wrap;justify-content:center;gap:12px 24px;margin-bottom:12px}
.footer-links span{color:rgba(255,255,255,.55);font-size:13px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;transition:color .2s}
.footer-links span:hover{color:rgba(255,255,255,.9)}
.footer-copy{color:rgba(255,255,255,.25);font-size:11px}

/* ── MODAL LÉGAL ── */
#modal-legal{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9000;display:flex;align-items:flex-end;justify-content:center}
@media(min-width:768px){#modal-legal{align-items:center}}
#modal-legal-inner{background:white;border-radius:20px 20px 0 0;width:100%;max-width:640px;max-height:85vh;overflow-y:auto;padding:24px 20px 40px;position:relative;animation:slideUp .3s ease}
@media(min-width:768px){#modal-legal-inner{border-radius:20px;max-height:80vh}}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.modal-close-btn{position:sticky;top:0;float:right;background:none;border:none;font-size:20px;color:#888;cursor:pointer;line-height:1;padding:4px 8px;margin-bottom:8px}
#modal-legal-content h2{font-family:var(--ff-title);font-size:22px;font-weight:800;color:#2D1B14;margin-bottom:16px}
#modal-legal-content h3{font-size:15px;font-weight:700;color:#2D1B14;margin:16px 0 6px}
#modal-legal-content p,#modal-legal-content li{font-size:13px;color:#555;line-height:1.7;margin-bottom:8px}
#modal-legal-content ul{padding-left:18px}
```

- [ ] **Étape 3.3 : showLegal() dans js/features.js**

Le contenu LEGAL_CONTENT est du HTML statique et hardcodé (pas de données utilisateur), donc innerHTML est sécurisé ici.

```javascript
// ── FOOTER LÉGAL ──
var LEGAL_CONTENT = {
  faq: '<h2>FAQ</h2>'
    +'<h3>Comment ajouter un contact ?</h3><p>Depuis l\'onglet "Ajouter", renseignez le prénom, la date d\'anniversaire et la relation. Bloomday génère ensuite un message personnalisé.</p>'
    +'<h3>Bloomday envoie les messages lui-même ?</h3><p>Non. Bloomday génère le message, vous le copiez et l\'envoyez via WhatsApp, SMS ou email. Vous gardez le contrôle.</p>'
    +'<h3>Comment annuler mon abonnement ?</h3><p>Depuis votre profil → "Gérer mon abonnement". L\'annulation prend effet à la fin de la période en cours.</p>'
    +'<h3>Mes données sont-elles sécurisées ?</h3><p>Oui. Vos données sont stockées sur Supabase (infrastructure européenne), chiffrées en transit et au repos.</p>',

  cgu: '<h2>Conditions d\'utilisation</h2>'
    +'<p>Dernière mise à jour : mai 2026</p>'
    +'<h3>1. Objet</h3><p>Bloomday est une application de rappel d\'anniversaires et de génération de messages personnalisés. En utilisant Bloomday, vous acceptez les présentes conditions.</p>'
    +'<h3>2. Compte utilisateur</h3><p>Vous êtes responsable de la confidentialité de vos identifiants.</p>'
    +'<h3>3. Usage acceptable</h3><p>Bloomday est destiné à un usage personnel. L\'utilisation à des fins commerciales non autorisées ou de spam est interdite.</p>'
    +'<h3>4. Propriété intellectuelle</h3><p>Les messages générés par l\'IA vous appartiennent une fois envoyés.</p>'
    +'<h3>5. Modification des conditions</h3><p>Bloomday se réserve le droit de modifier ces conditions. Notification par email en cas de changement majeur.</p>',

  rgpd: '<h2>Politique de confidentialité</h2>'
    +'<p>Dernière mise à jour : mai 2026</p>'
    +'<h3>Données collectées</h3><ul><li>Email et nom lors de l\'inscription</li><li>Contacts ajoutés manuellement par vous</li><li>Logs d\'utilisation anonymisés</li></ul>'
    +'<h3>Utilisation</h3><p>Vos données servent uniquement à faire fonctionner Bloomday : rappels, génération de messages, gestion de compte.</p>'
    +'<h3>Partage</h3><p>Aucune donnée n\'est vendue ou partagée avec des tiers à des fins publicitaires.</p>'
    +'<h3>Hébergement</h3><p>Supabase (infrastructure AWS eu-west, Europe). Chiffrement TLS en transit.</p>'
    +'<h3>Vos droits RGPD</h3><ul><li>Accès : support@mybloomday.app</li><li>Suppression : profil → "Supprimer mon compte"</li><li>Portabilité : export sur demande</li></ul>',

  about: '<h2>À propos de Bloomday</h2>'
    +'<p>Bloomday est né d\'une conviction simple : les personnes qui comptent méritent d\'être célébrées, et pas seulement quand on s\'en souvient par hasard.</p>'
    +'<h3>La mission</h3><p>Aider chacun à ne plus jamais rater un moment important pour les gens qu\'il aime, avec des messages authentiques et personnalisés.</p>'
    +'<h3>Contact</h3><p>📧 support@mybloomday.app</p>'
};

function showLegal(type){
  var m=document.getElementById('modal-legal');
  var c=document.getElementById('modal-legal-content');
  if(!m||!c)return;
  c.innerHTML=LEGAL_CONTENT[type]||'';
  m.style.display='flex';
  document.body.style.overflow='hidden';
}

function closeLegal(){
  var m=document.getElementById('modal-legal');
  if(m)m.style.display='none';
  document.body.style.overflow='';
}
```

- [ ] **Étape 3.4 : Clés i18n footer dans js/i18n.js (7 langues)**

```javascript
// fr
footerFaq:'FAQ', footerCgu:'Conditions d\'utilisation',
footerRgpd:'Politique de confidentialité', footerAbout:'À propos',
footerCopy:'© 2026 Bloomday · mybloomday.app',
// en
footerFaq:'FAQ', footerCgu:'Terms of Use',
footerRgpd:'Privacy Policy', footerAbout:'About',
footerCopy:'© 2026 Bloomday · mybloomday.app',
// es
footerFaq:'Preguntas frecuentes', footerCgu:'Términos de uso',
footerRgpd:'Política de privacidad', footerAbout:'Acerca de',
footerCopy:'© 2026 Bloomday · mybloomday.app',
// ar
footerFaq:'الأسئلة الشائعة', footerCgu:'شروط الاستخدام',
footerRgpd:'سياسة الخصوصية', footerAbout:'حول التطبيق',
footerCopy:'© 2026 Bloomday · mybloomday.app',
// hi
footerFaq:'सामान्य प्रश्न', footerCgu:'उपयोग की शर्तें',
footerRgpd:'गोपनीयता नीति', footerAbout:'हमारे बारे में',
footerCopy:'© 2026 Bloomday · mybloomday.app',
// zh
footerFaq:'常见问题', footerCgu:'使用条款',
footerRgpd:'隐私政策', footerAbout:'关于我们',
footerCopy:'© 2026 Bloomday · mybloomday.app',
// pt
footerFaq:'Perguntas frequentes', footerCgu:'Termos de uso',
footerRgpd:'Política de privacidade', footerAbout:'Sobre nós',
footerCopy:'© 2026 Bloomday · mybloomday.app',
```

- [ ] **Étape 3.5 : Vérifier et commiter**

```bash
node --check js/features.js
node --check js/i18n.js
git add index.html css/app.css js/features.js js/i18n.js
git commit -m "feat(footer): liens légaux FAQ/CGU/RGPD/À propos avec modales animées"
```

---

## Tâche 4 — Panel admin : Netlify Function

**Fichiers :**
- Créer : `netlify/functions/admin.js`

- [ ] **Étape 4.1 : Créer netlify/functions/admin.js**

```javascript
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

  const auth = event.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return err(401, 'No token');

  let payload;
  try { payload = await verifyJwt(token); } catch (e) { return err(401, 'Invalid token'); }
  if (payload.email !== ADMIN_EMAIL) return err(403, 'Forbidden');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return err(400, 'Invalid JSON'); }
  const { action } = body;

  if (action === 'stats') {
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const ago30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', ago30);
    const { count: premiumUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).not('plan', 'in', '("free","")');
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ totalUsers: totalUsers || 0, activeUsers: activeUsers || 0, premiumUsers: premiumUsers || 0 }) };
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
    if (!uid || typeof uid !== 'string') return err(400, 'Missing uid');
    const { data: contacts } = await supabase.from('bdg16_members').select('name,day,month,year,type').eq('user_id', uid);
    const { data: profile } = await supabase.from('profiles').select('email,plan,created_at').eq('id', uid).single();
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
```

- [ ] **Étape 4.2 : Créer la table admin_notifications dans Supabase**

Dans Supabase Dashboard → SQL Editor :

```sql
CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active notifications"
  ON admin_notifications FOR SELECT
  TO authenticated
  USING (active = true);
```

- [ ] **Étape 4.3 : Ajouter SUPABASE_SERVICE_ROLE_KEY dans Netlify**

Netlify Dashboard → Site settings → Environment variables → ajouter :
- `SUPABASE_SERVICE_ROLE_KEY` → valeur depuis Supabase Dashboard → Settings → API → "service_role" secret key

- [ ] **Étape 4.4 : Vérifier et commiter**

```bash
node --check netlify/functions/admin.js
git add netlify/functions/admin.js
git commit -m "feat(admin): Netlify Function admin — stats, users, user_detail, notify"
```

---

## Tâche 5 — Panel admin : UI

**Fichiers :**
- Modifier : `js/auth.js`
- Modifier : `js/core.js`
- Modifier : `index.html`
- Modifier : `css/app.css`
- Modifier : `js/i18n.js`

- [ ] **Étape 5.1 : Ajouter checkAdmin dans js/auth.js**

Chercher l'endroit où `window.currentUser` est défini après la connexion (dans le callback `onAuthStateChange` ou équivalent). Juste après, ajouter :

```javascript
window.ADMIN_EMAIL = 'zekingfinance@gmail.com';

function checkAdmin(user) {
  window.isAdmin = !!(user && user.email === window.ADMIN_EMAIL);
  var btn = document.getElementById('nav-admin-btn');
  if (btn) btn.style.display = window.isAdmin ? 'block' : 'none';
}
```

Appeler `checkAdmin(user)` à chaque changement d'état auth (login, logout, init).

- [ ] **Étape 5.2 : Étendre showSec dans js/core.js**

Modifier `showSec` pour inclure `'admin'` :

```javascript
function showSec(name,idx){
  ['home','members','add','events','cal','more','admin'].forEach(s=>{
    const e=document.getElementById('s-'+s);
    if(e)e.style.display=s===name?'block':'none';
  });
  document.querySelectorAll('.nb').forEach((b,i)=>{b.classList.toggle('on',i===idx);});
  for(var di=0;di<5;di++){var sb=document.getElementById('dsb'+di);if(sb)sb.classList.toggle('on',di===idx);}
  const ms=document.getElementById('mscroll');if(ms)ms.scrollTo(0,0);
  if(name==='home')rHome();
  if(name==='events')rEvents();
  if(name==='cal')rCal();
  if(name==='more')rMore();
  if(name==='members')rMembers();
  if(name==='admin')rAdmin();
  if(typeof renderDesktopRightPanel==='function')renderDesktopRightPanel(name);
}
```

- [ ] **Étape 5.3 : Ajouter rAdmin et les fonctions admin dans js/core.js**

Toutes les données utilisateur venant de Supabase sont échappées via `esc()` avant insertion dans le DOM.

```javascript
async function rAdmin(){
  if(!window.isAdmin)return;
  var sess=(await window._supabase.auth.getSession()).data.session;
  if(!sess)return;
  var token=sess.access_token;

  var r=await fetch('/.netlify/functions/admin',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body:JSON.stringify({action:'stats'})
  });
  var s=await r.json();
  var conv=s.totalUsers>0?Math.round((s.premiumUsers/s.totalUsers)*100)+'%':'0%';
  document.getElementById('stat-total').textContent=s.totalUsers||0;
  document.getElementById('stat-active').textContent=s.activeUsers||0;
  document.getElementById('stat-premium').textContent=s.premiumUsers||0;
  document.getElementById('stat-conv').textContent=conv;

  adminLoadUsers(token,0,'');
}

async function adminLoadUsers(token,page,search){
  var r=await fetch('/.netlify/functions/admin',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body:JSON.stringify({action:'users',page:page,search:search})
  });
  var d=await r.json();
  var el=document.getElementById('admin-user-list');
  if(!el)return;
  if(!d.users||!d.users.length){
    el.textContent=search?t('adminNoResults'):'';
    return;
  }
  // Construction DOM sans innerHTML avec données user — utiliser esc()
  el.innerHTML='';
  d.users.forEach(function(u){
    var div=document.createElement('div');
    div.className='card';
    div.style.cssText='padding:10px 14px;cursor:pointer;margin-bottom:6px';
    div.onclick=function(){adminShowUser(u.id,token);};
    var name=document.createElement('div');
    name.style.cssText='font-size:13px;font-weight:600;color:var(--b1d)';
    name.textContent=u.email;
    var info=document.createElement('div');
    info.style.cssText='font-size:11px;color:var(--txt2);margin-top:2px';
    info.textContent='Plan : '+(u.plan||'free')+' · Inscrit le '+new Date(u.created_at).toLocaleDateString('fr-FR');
    div.appendChild(name);
    div.appendChild(info);
    el.appendChild(div);
  });
}

async function adminSearchUsers(){
  var q=document.getElementById('admin-search').value;
  var sess=(await window._supabase.auth.getSession()).data.session;
  if(sess)adminLoadUsers(sess.access_token,0,q);
}

async function adminShowUser(uid,token){
  var r=await fetch('/.netlify/functions/admin',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body:JSON.stringify({action:'user_detail',uid:uid})
  });
  var d=await r.json();
  var el=document.getElementById('admin-user-detail');
  if(!el)return;
  el.style.display='block';
  // Construire le DOM avec textContent — aucun innerHTML avec données user
  el.innerHTML='';
  var card=document.createElement('div');
  card.className='card';
  card.style.cssText='padding:14px;margin-top:10px';

  var emailEl=document.createElement('div');
  emailEl.style.cssText='font-size:14px;font-weight:700;margin-bottom:8px';
  emailEl.textContent=d.profile.email||'';
  card.appendChild(emailEl);

  var planEl=document.createElement('div');
  planEl.style.cssText='font-size:12px;color:var(--txt2);margin-bottom:10px';
  planEl.textContent='Plan : '+(d.profile.plan||'free')+' · Inscrit : '+new Date(d.profile.created_at).toLocaleDateString('fr-FR');
  card.appendChild(planEl);

  var ctTitle=document.createElement('div');
  ctTitle.style.cssText='font-size:13px;font-weight:600;margin-bottom:6px';
  ctTitle.textContent='Contacts ('+d.contacts.length+')';
  card.appendChild(ctTitle);

  (d.contacts||[]).forEach(function(c){
    var row=document.createElement('div');
    row.style.cssText='font-size:12px;color:var(--txt2);padding:3px 0;border-bottom:1px solid #f0f0f0';
    row.textContent=c.name+' — '+c.day+'/'+c.month+(c.year?'/'+c.year:'');
    card.appendChild(row);
  });

  var closeBtn=document.createElement('button');
  closeBtn.className='btn sm';
  closeBtn.style.marginTop='10px';
  closeBtn.textContent='Fermer';
  closeBtn.onclick=function(){el.style.display='none';};
  card.appendChild(closeBtn);
  el.appendChild(card);
}

async function adminSendNotif(){
  var msg=document.getElementById('admin-notif-text').value.trim();
  if(!msg)return;
  var sess=(await window._supabase.auth.getSession()).data.session;
  if(!sess)return;
  var r=await fetch('/.netlify/functions/admin',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+sess.access_token},
    body:JSON.stringify({action:'notify',message:msg})
  });
  var d=await r.json();
  if(d.ok){
    document.getElementById('admin-notif-text').value='';
    alert(t('adminNotifSent'));
  }
}

async function checkAdminNotifications(){
  if(!window.currentUser)return;
  try{
    var r=await window._supabase.from('admin_notifications').select('message').eq('active',true).order('created_at',{ascending:false}).limit(1);
    if(r.data&&r.data.length>0){
      var b=document.getElementById('offline-banner');
      if(b){
        b.textContent=r.data[0].message;
        b.style.display='block';
      }
    }
  }catch(e){}
}
```

- [ ] **Étape 5.4 : Ajouter la section DOM admin dans index.html**

Après la dernière section `<div id="s-more"...>...</div>`, ajouter :

```html
<!-- ═══════ SECTION ADMIN ═══════ -->
<div id="s-admin" style="display:none">
  <div class="wrap">
    <div class="sh" style="margin-bottom:16px" data-i18n="adminTitle">Panel Admin</div>

    <div id="admin-stats" class="admin-grid">
      <div class="admin-stat"><div class="admin-stat-val" id="stat-total">—</div><div class="admin-stat-lbl" data-i18n="adminStatTotal">Utilisateurs</div></div>
      <div class="admin-stat"><div class="admin-stat-val" id="stat-active">—</div><div class="admin-stat-lbl" data-i18n="adminStatActive">Actifs 30j</div></div>
      <div class="admin-stat"><div class="admin-stat-val" id="stat-premium">—</div><div class="admin-stat-lbl" data-i18n="adminStatPremium">Premium</div></div>
      <div class="admin-stat"><div class="admin-stat-val" id="stat-conv">—</div><div class="admin-stat-lbl" data-i18n="adminStatConv">Conversion</div></div>
    </div>

    <div class="sh" style="margin-top:20px;margin-bottom:8px" data-i18n="adminUsers">Utilisateurs</div>
    <input type="search" id="admin-search" placeholder="Rechercher par email…" oninput="adminSearchUsers()" class="inp" style="margin-bottom:10px;width:100%">
    <div id="admin-user-list"></div>
    <div id="admin-user-detail" style="display:none"></div>

    <div class="sh" style="margin-top:20px;margin-bottom:8px" data-i18n="adminNotifTitle">Notification globale</div>
    <textarea id="admin-notif-text" class="inp" rows="3" style="width:100%;margin-bottom:8px" placeholder="Message à envoyer à tous…"></textarea>
    <button class="btn P fw" onclick="adminSendNotif()" data-i18n="adminNotifBtn">Envoyer à tous</button>

    <div class="sh" style="margin-top:20px;margin-bottom:8px" data-i18n="adminBrowseTitle">Naviguer dans l'app</div>
    <button class="btn fw" onclick="showSec('home',0)" data-i18n="adminBrowseBtn">Voir l'app comme un utilisateur →</button>
  </div>
</div>
```

- [ ] **Étape 5.5 : Ajouter bouton Admin dans la sidebar desktop**

Chercher la sidebar desktop (éléments avec `id="dsb0"` etc.) et ajouter avant la balise fermante de la sidebar :

```html
<div id="nav-admin-btn" style="display:none;margin-top:auto">
  <button class="dsb" onclick="showSec('admin',99)" style="background:rgba(212,168,67,.15);border:1px solid rgba(212,168,67,.3)">
    <svg viewBox="0 0 22 22" fill="none" width="20" height="20"><rect x="3" y="3" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.4"/><path d="M7 11h8M11 7v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
    <span class="nbl" data-i18n="navAdmin">Admin</span>
  </button>
</div>
```

- [ ] **Étape 5.6 : CSS admin dans css/app.css**

```css
/* ── ADMIN PANEL ── */
.admin-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px}
.admin-stat{background:white;border:1px solid #f0e8ff;border-radius:12px;padding:14px;text-align:center}
.admin-stat-val{font-size:28px;font-weight:800;color:#5B2D8E}
.admin-stat-lbl{font-size:11px;color:var(--txt2);margin-top:4px}
```

- [ ] **Étape 5.7 : Clés i18n admin dans js/i18n.js (7 langues)**

```javascript
// fr
adminTitle:'Panel Admin', adminStatTotal:'Utilisateurs', adminStatActive:'Actifs 30j',
adminStatPremium:'Premium', adminStatConv:'Conversion', adminUsers:'Utilisateurs',
adminNotifTitle:'Notification globale', adminNotifBtn:'Envoyer à tous',
adminBrowseTitle:'Naviguer dans l\'app', adminBrowseBtn:'Voir l\'app comme un utilisateur →',
navAdmin:'Admin', adminNotifSent:'Notification envoyée !', adminNoResults:'Aucun résultat',
// en
adminTitle:'Admin Panel', adminStatTotal:'Users', adminStatActive:'Active 30d',
adminStatPremium:'Premium', adminStatConv:'Conversion', adminUsers:'Users',
adminNotifTitle:'Broadcast notification', adminNotifBtn:'Send to all',
adminBrowseTitle:'Browse app', adminBrowseBtn:'View app as user →',
navAdmin:'Admin', adminNotifSent:'Notification sent!', adminNoResults:'No results',
// es/ar/hi/zh/pt : même pattern traduit
```

- [ ] **Étape 5.8 : Vérifier et commiter**

```bash
node --check js/core.js
node --check js/auth.js
node --check js/i18n.js
git add index.html css/app.css js/core.js js/auth.js js/i18n.js
git commit -m "feat(admin): panel fondateur avec stats, users, notifications, navigation app"
```

---

## Tâche 6 — Chatbot IA : Netlify Function

**Fichiers :**
- Créer : `netlify/functions/chat.js`

- [ ] **Étape 6.1 : Créer netlify/functions/chat.js**

```javascript
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

  try {
    var reply = await geminiRequest(messages);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ reply: reply }) };
  } catch (e) {
    return err(500, 'Gemini error');
  }
};
```

- [ ] **Étape 6.2 : Ajouter GEMINI_API_KEY dans Netlify**

Netlify Dashboard → Site settings → Environment variables :
- `GEMINI_API_KEY` → obtenir sur https://aistudio.google.com/app/apikey (gratuit, compte Google requis)

- [ ] **Étape 6.3 : Vérifier et commiter**

```bash
node --check netlify/functions/chat.js
git add netlify/functions/chat.js
git commit -m "feat(chat): Netlify Function proxy Gemini Flash avec persona Bloom"
```

---

## Tâche 7 — Chatbot IA : UI

**Fichiers :**
- Modifier : `index.html`
- Modifier : `css/app.css`
- Modifier : `js/i18n.js`
- Modifier : `js/features.js`

- [ ] **Étape 7.1 : Ajouter le widget chat dans index.html**

Juste avant `</body>` :

```html
<!-- ═══════ CHATBOT BLOOM ═══════ -->
<button id="chat-fab" onclick="toggleChat()" aria-label="Chat Bloom">💬</button>
<div id="chat-panel" style="display:none">
  <div class="chat-header">
    <div style="display:flex;align-items:center;gap:8px">
      <div style="font-size:20px">🌸</div>
      <div>
        <div style="font-size:14px;font-weight:700;color:#2D1B14">Bloom</div>
        <div style="font-size:11px;color:#8B6F60" data-i18n="chatSubtitle">Assistant Bloomday</div>
      </div>
    </div>
    <button onclick="toggleChat()" style="background:none;border:none;font-size:20px;color:#888;cursor:pointer">✕</button>
  </div>
  <div id="chat-messages" class="chat-messages"></div>
  <div id="chat-quota-bar" class="chat-quota-bar"></div>
  <div class="chat-input-row">
    <input type="text" id="chat-input" placeholder="Pose ta question…" data-i18n-placeholder="chatPlaceholder" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat();}">
    <button onclick="sendChat()" data-i18n="chatSend">Envoyer</button>
  </div>
</div>
```

- [ ] **Étape 7.2 : CSS chat dans css/app.css**

```css
/* ── CHATBOT ── */
#chat-fab{position:fixed;bottom:80px;right:16px;z-index:8000;background:linear-gradient(135deg,#5B2D8E,#9B4FC0);color:white;border:none;border-radius:50%;width:52px;height:52px;font-size:24px;cursor:pointer;box-shadow:0 4px 16px rgba(91,45,142,.4);transition:transform .2s}
#chat-fab:hover{transform:scale(1.08)}
#chat-panel{position:fixed;bottom:144px;right:16px;z-index:8001;width:340px;max-width:calc(100vw - 32px);background:white;border-radius:20px;box-shadow:0 8px 32px rgba(0,0,0,.18);display:flex;flex-direction:column;max-height:500px}
@media(max-width:480px){#chat-panel{bottom:0;right:0;width:100vw;max-width:100vw;border-radius:20px 20px 0 0;max-height:85vh}}
.chat-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #f0f0f0;flex-shrink:0}
.chat-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;min-height:120px}
.chat-bubble{max-width:85%;padding:9px 12px;border-radius:14px;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
.chat-bubble.bot{background:#F5F0FF;color:#2D1B14;align-self:flex-start;border-radius:4px 14px 14px 14px}
.chat-bubble.user{background:linear-gradient(135deg,#5B2D8E,#9B4FC0);color:white;align-self:flex-end;border-radius:14px 14px 4px 14px}
.chat-bubble.typing{color:#aaa;font-style:italic}
.chat-quota-bar{font-size:10px;color:#aaa;text-align:center;padding:4px 14px;border-top:1px solid #faf5ff;flex-shrink:0}
.chat-input-row{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #f0f0f0;flex-shrink:0}
.chat-input-row input{flex:1;border:1px solid #e8deff;border-radius:10px;padding:8px 12px;font-size:13px;outline:none}
.chat-input-row button{background:linear-gradient(135deg,#5B2D8E,#9B4FC0);color:white;border:none;border-radius:10px;padding:8px 14px;font-size:13px;cursor:pointer;flex-shrink:0}
```

- [ ] **Étape 7.3 : Logique chat dans js/features.js**

Les bulles de chat utilisent `textContent` pour les messages utilisateur et la réponse IA — aucun innerHTML avec données inconnues.

```javascript
// ── CHATBOT BLOOM ──
var _chatHistory = [];
var _chatOpen = false;
var _chatInitialized = false;

function toggleChat() {
  _chatOpen = !_chatOpen;
  var panel = document.getElementById('chat-panel');
  if (!panel) return;
  panel.style.display = _chatOpen ? 'flex' : 'none';
  if (_chatOpen) {
    if (!_chatInitialized) {
      _chatInitialized = true;
      var msgs = document.getElementById('chat-messages');
      if (msgs) {
        var welcome = document.createElement('div');
        welcome.className = 'chat-bubble bot';
        welcome.textContent = t('chatWelcome');
        msgs.appendChild(welcome);
      }
    }
    _updateChatQuotaBar();
    var inp = document.getElementById('chat-input');
    if (inp) inp.focus();
  }
}

function _getChatQuota() {
  if (!window.currentUser) {
    var used = parseInt(localStorage.getItem('bloom_chat_session') || '0', 10);
    return { used: used, max: 3, type: 'visitor' };
  }
  var monthKey = new Date().toISOString().slice(0, 7);
  var storageKey = 'bloom_chat_' + window.currentUser.id + '_' + monthKey;
  var used = parseInt(localStorage.getItem(storageKey) || '0', 10);
  var plan = (window.profile && window.profile.plan) || 'free';
  var unlimited = ['premium', 'bloom', 'pro', 'enterprise'].indexOf(plan) >= 0;
  return { used: used, max: unlimited ? Infinity : 10, type: 'user', storageKey: storageKey };
}

function _incrementChatQuota(quota) {
  if (quota.type === 'visitor') {
    localStorage.setItem('bloom_chat_session', String(quota.used + 1));
  } else if (quota.storageKey) {
    localStorage.setItem(quota.storageKey, String(quota.used + 1));
  }
}

function _updateChatQuotaBar() {
  var bar = document.getElementById('chat-quota-bar');
  if (!bar) return;
  var q = _getChatQuota();
  bar.textContent = q.max === Infinity ? '' : (q.used + '/' + q.max + ' ' + t('chatMsgUsed'));
}

function _addBubble(text, role) {
  var msgs = document.getElementById('chat-messages');
  if (!msgs) return null;
  var el = document.createElement('div');
  el.className = 'chat-bubble ' + role;
  el.textContent = text;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
  return el;
}

async function sendChat() {
  var inp = document.getElementById('chat-input');
  if (!inp) return;
  var text = inp.value.trim();
  if (!text) return;

  var quota = _getChatQuota();
  if (quota.used >= quota.max) {
    _addBubble(quota.type === 'visitor' ? t('chatQuotaVisitor') : t('chatQuotaFree'), 'bot');
    return;
  }

  inp.value = '';
  _addBubble(text, 'user');
  var typingEl = _addBubble('…', 'bot typing');

  _chatHistory.push({ role: 'user', content: text });

  try {
    var r = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: _chatHistory })
    });
    var d = await r.json();
    var reply = d.reply || t('chatError');
    _chatHistory.push({ role: 'assistant', content: reply });
    if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
    _addBubble(reply, 'bot');
    _incrementChatQuota(quota);
    _updateChatQuotaBar();
  } catch (e) {
    if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
    _addBubble(t('chatError'), 'bot');
  }
}
```

- [ ] **Étape 7.4 : Clés i18n chat dans js/i18n.js (7 langues)**

```javascript
// fr
chatSubtitle:'Assistant Bloomday',
chatWelcome:'Bonjour ! Je suis Bloom 🌸 Comment puis-je t\'aider avec Bloomday ?',
chatPlaceholder:'Pose ta question…', chatSend:'Envoyer',
chatMsgUsed:'messages utilisés',
chatQuotaVisitor:'Tu as utilisé tes 3 messages gratuits. Crée un compte pour continuer !',
chatQuotaFree:'Limite de 10 messages atteinte ce mois-ci. Passe en Premium pour un accès illimité 🌸',
chatError:'Désolé, une erreur s\'est produite. Réessaie dans un instant.',
// en
chatSubtitle:'Bloomday Assistant',
chatWelcome:'Hello! I\'m Bloom 🌸 How can I help you with Bloomday?',
chatPlaceholder:'Ask a question…', chatSend:'Send', chatMsgUsed:'messages used',
chatQuotaVisitor:'You\'ve used your 3 free messages. Create an account to continue!',
chatQuotaFree:'10-message limit reached this month. Upgrade to Premium for unlimited access 🌸',
chatError:'Sorry, an error occurred. Please try again.',
// es
chatSubtitle:'Asistente Bloomday',
chatWelcome:'¡Hola! Soy Bloom 🌸 ¿En qué puedo ayudarte con Bloomday?',
chatPlaceholder:'Haz tu pregunta…', chatSend:'Enviar', chatMsgUsed:'mensajes usados',
chatQuotaVisitor:'Has usado tus 3 mensajes gratuitos. ¡Crea una cuenta para continuar!',
chatQuotaFree:'Límite de 10 mensajes alcanzado este mes. ¡Actualiza a Premium!',
chatError:'Lo siento, ocurrió un error. Inténtalo de nuevo.',
// ar
chatSubtitle:'مساعد Bloomday',
chatWelcome:'مرحباً! أنا Bloom 🌸 كيف يمكنني مساعدتك في Bloomday؟',
chatPlaceholder:'اطرح سؤالك…', chatSend:'إرسال', chatMsgUsed:'رسائل مستخدمة',
chatQuotaVisitor:'لقد استخدمت رسائلك المجانية الـ3. أنشئ حساباً للمتابعة!',
chatQuotaFree:'تم الوصول إلى حد الـ10 رسائل هذا الشهر. انتقل إلى Premium!',
chatError:'عذراً، حدث خطأ. أعد المحاولة.',
// hi
chatSubtitle:'Bloomday सहायक',
chatWelcome:'नमस्ते! मैं Bloom हूं 🌸 Bloomday में आपकी कैसे मदद कर सकता हूं?',
chatPlaceholder:'अपना सवाल पूछें…', chatSend:'भेजें', chatMsgUsed:'संदेश उपयोग किए',
chatQuotaVisitor:'आपने अपने 3 मुफ्त संदेश उपयोग किए। जारी रखने के लिए खाता बनाएं!',
chatQuotaFree:'इस महीने 10 संदेशों की सीमा पार हो गई। Premium में अपग्रेड करें!',
chatError:'क्षमा करें, त्रुटि हुई। पुनः प्रयास करें।',
// zh
chatSubtitle:'Bloomday助手',
chatWelcome:'你好！我是Bloom 🌸 我能为你提供什么Bloomday帮助？',
chatPlaceholder:'提问…', chatSend:'发送', chatMsgUsed:'条消息已使用',
chatQuotaVisitor:'您已使用完3条免费消息。请创建帐户继续！',
chatQuotaFree:'本月已达到10条消息限制。升级到Premium！',
chatError:'抱歉，发生了错误。请重试。',
// pt
chatSubtitle:'Assistente Bloomday',
chatWelcome:'Olá! Sou o Bloom 🌸 Como posso ajudá-lo com o Bloomday?',
chatPlaceholder:'Faça sua pergunta…', chatSend:'Enviar', chatMsgUsed:'mensagens usadas',
chatQuotaVisitor:'Você usou suas 3 mensagens gratuitas. Crie uma conta para continuar!',
chatQuotaFree:'Limite de 10 mensagens atingido este mês. Atualize para Premium!',
chatError:'Desculpe, ocorreu um erro. Tente novamente.',
```

- [ ] **Étape 7.5 : Vérifier et commiter**

```bash
node --check js/features.js
node --check js/i18n.js
git add index.html css/app.css js/features.js js/i18n.js
git commit -m "feat(chat): widget Bloom — Gemini Flash, quotas visitor/free/premium, textContent sécurisé"
```

---

## Tâche 8 — Suggestions fleurs affiliées

**Fichiers :**
- Modifier : `index.html`
- Modifier : `css/app.css`
- Modifier : `js/features.js`
- Modifier : `js/render.js`
- Modifier : `js/i18n.js`

- [ ] **Étape 8.1 : Ajouter le modal fleurs dans index.html**

Avant `</body>`, après les modals existants :

```html
<!-- ═══════ MODAL FLEURS ═══════ -->
<div id="modal-flowers" style="display:none" onclick="if(event.target===this)closeFlowers()">
  <div id="modal-flowers-inner">
    <button class="modal-close-btn" onclick="closeFlowers()">✕</button>
    <h2 id="modal-flowers-title" data-i18n="flowerModalTitle">Idées cadeaux</h2>
    <p style="font-size:13px;color:#8B6F60;margin-bottom:16px" data-i18n="flowerModalSub">Sélectionnez un bouquet à offrir</p>
    <div id="modal-flowers-list"></div>
    <p style="font-size:10px;color:#bbb;margin-top:12px;text-align:center" data-i18n="flowerAffiliateNotice">Liens partenaires — Bloomday peut percevoir une commission</p>
  </div>
</div>
```

- [ ] **Étape 8.2 : CSS modal fleurs dans css/app.css**

```css
/* ── MODAL FLEURS ── */
#modal-flowers{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9000;display:flex;align-items:flex-end;justify-content:center}
@media(min-width:768px){#modal-flowers{align-items:center}}
#modal-flowers-inner{background:white;border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:24px 20px 40px;position:relative;animation:slideUp .3s ease;max-height:85vh;overflow-y:auto}
@media(min-width:768px){#modal-flowers-inner{border-radius:20px;max-height:80vh}}
.flower-card{display:flex;align-items:center;gap:14px;padding:12px 14px;border:1px solid #f0e8ff;border-radius:14px;margin-bottom:10px}
.flower-emoji{font-size:36px;flex-shrink:0}
.flower-info{flex:1}
.flower-name{font-size:14px;font-weight:700;color:#2D1B14}
.flower-price{font-size:12px;color:#8B6F60;margin-top:2px}
.flower-link{background:linear-gradient(135deg,#D4A843,#FF8C7A);color:white;border:none;border-radius:10px;padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer;text-decoration:none;white-space:nowrap;flex-shrink:0}
```

- [ ] **Étape 8.3 : showFlowerIdeas dans js/features.js**

Construire les flower cards avec le DOM API (pas innerHTML pour les données variables).

```javascript
// ── SUGGESTIONS FLEURS AFFILIÉES ──
var FLOWER_SUGGESTIONS = {
  birthday: [
    { emoji: '🌹', name: 'Roses rouges', price: '~29€', url: '#' },
    { emoji: '💐', name: 'Bouquet mixte printanier', price: '~35€', url: '#' },
    { emoji: '🌻', name: 'Tournesols du jardin', price: '~24€', url: '#' }
  ],
  wedding: [
    { emoji: '🌸', name: 'Pivoines roses', price: '~45€', url: '#' },
    { emoji: '🤍', name: 'Bouquet blanc élégant', price: '~55€', url: '#' },
    { emoji: '🪷', name: 'Orchidées de luxe', price: '~65€', url: '#' }
  ],
  default: [
    { emoji: '💐', name: 'Bouquet de saison', price: '~30€', url: '#' },
    { emoji: '🌿', name: 'Plante verte zen', price: '~25€', url: '#' },
    { emoji: '🌷', name: 'Tulipes colorées', price: '~22€', url: '#' }
  ]
};

function showFlowerIdeas(name, eventType) {
  var m = document.getElementById('modal-flowers');
  var list = document.getElementById('modal-flowers-list');
  var title = document.getElementById('modal-flowers-title');
  if (!m || !list) return;

  // Titre via textContent (données utilisateur)
  if (title) title.textContent = t('flowerModalTitle') + (name ? ' — ' + name : '');

  var suggestions = FLOWER_SUGGESTIONS[eventType] || FLOWER_SUGGESTIONS.default;
  list.innerHTML = '';
  suggestions.forEach(function(f) {
    var card = document.createElement('div');
    card.className = 'flower-card';

    var emojiEl = document.createElement('div');
    emojiEl.className = 'flower-emoji';
    emojiEl.textContent = f.emoji;

    var info = document.createElement('div');
    info.className = 'flower-info';
    var nameEl = document.createElement('div');
    nameEl.className = 'flower-name';
    nameEl.textContent = f.name;
    var priceEl = document.createElement('div');
    priceEl.className = 'flower-price';
    priceEl.textContent = f.price;
    info.appendChild(nameEl);
    info.appendChild(priceEl);

    var link = document.createElement('a');
    link.className = 'flower-link';
    link.href = f.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = t('flowerSeeBtn');

    card.appendChild(emojiEl);
    card.appendChild(info);
    card.appendChild(link);
    list.appendChild(card);
  });

  m.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeFlowers() {
  var m = document.getElementById('modal-flowers');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
}
```

- [ ] **Étape 8.4 : Bouton "Idées cadeaux" dans js/render.js**

Repérer dans `rHome()` la section "7 jours" (upcoming birthdays). Après la ligne qui génère le bouton `prepareBtn`, ajouter le bouton fleurs :

```javascript
// Après la ligne contenant 'prepareBtn' dans la boucle upcoming.forEach
h += '<button class="btn sm O" style="margin-left:6px" onclick="showFlowerIdeas(\''+esc(p.name)+'\',\''+p.type+'\')" data-i18n="flowerIdeasBtn">'+t('flowerIdeasBtn')+'</button>';
```

- [ ] **Étape 8.5 : Clés i18n fleurs dans js/i18n.js (7 langues)**

```javascript
// fr
flowerIdeasBtn:'Idées cadeaux', flowerModalTitle:'Idées cadeaux',
flowerModalSub:'Sélectionnez un bouquet à offrir', flowerSeeBtn:'Voir →',
flowerAffiliateNotice:'Liens partenaires — Bloomday peut percevoir une commission',
// en
flowerIdeasBtn:'Gift ideas', flowerModalTitle:'Gift ideas',
flowerModalSub:'Select a bouquet to offer', flowerSeeBtn:'See →',
flowerAffiliateNotice:'Partner links — Bloomday may earn a commission',
// es
flowerIdeasBtn:'Ideas de regalo', flowerModalTitle:'Ideas de regalo',
flowerModalSub:'Selecciona un ramo para regalar', flowerSeeBtn:'Ver →',
flowerAffiliateNotice:'Enlaces de socio — Bloomday puede recibir comisión',
// ar
flowerIdeasBtn:'أفكار هدايا', flowerModalTitle:'أفكار هدايا',
flowerModalSub:'اختر باقة زهور للإهداء', flowerSeeBtn:'عرض ←',
flowerAffiliateNotice:'روابط شراكة — قد تحصل Bloomday على عمولة',
// hi
flowerIdeasBtn:'उपहार विचार', flowerModalTitle:'उपहार विचार',
flowerModalSub:'भेंट करने के लिए एक गुलदस्ता चुनें', flowerSeeBtn:'देखें →',
flowerAffiliateNotice:'पार्टनर लिंक — Bloomday को कमीशन मिल सकती है',
// zh
flowerIdeasBtn:'礼物创意', flowerModalTitle:'礼物创意',
flowerModalSub:'选择一束花作为礼物', flowerSeeBtn:'查看 →',
flowerAffiliateNotice:'合作伙伴链接 — Bloomday可能获得佣金',
// pt
flowerIdeasBtn:'Ideias de presente', flowerModalTitle:'Ideias de presente',
flowerModalSub:'Selecione um buquê para oferecer', flowerSeeBtn:'Ver →',
flowerAffiliateNotice:'Links parceiros — Bloomday pode receber comissão',
```

- [ ] **Étape 8.6 : Vérifier et commiter**

```bash
node --check js/features.js
node --check js/render.js
node --check js/i18n.js
git add index.html css/app.css js/features.js js/render.js js/i18n.js
git commit -m "feat(flowers): suggestions bouquets affiliés depuis fiche événement, DOM API sécurisé"
```

---

## Tâche 9 — CSP : autoriser mybloomday.app

**Fichiers :**
- Modifier : `netlify.toml`

- [ ] **Étape 9.1 : Mettre à jour Content-Security-Policy dans netlify.toml**

Modifier la valeur `Content-Security-Policy` :

```toml
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://mybloomday.app https://bloomday-day.netlify.app https://bloomday.app https://api.stripe.com https://*.supabase.co; img-src 'self' data: blob:; frame-src https://js.stripe.com; object-src 'none'; frame-ancestors 'none';"
```

Note : `img/hero-photo.jpg` est stocké localement → pas besoin d'ajouter Unsplash dans `img-src`.

- [ ] **Étape 9.2 : Commiter**

```bash
git add netlify.toml
git commit -m "fix(csp): autoriser mybloomday.app dans connect-src"
```

---

## Tâche 10 — Déploiement final

- [ ] **Étape 10.1 : Vérification complète avant push**

```bash
node --check js/i18n.js && echo "i18n OK"
node --check js/features.js && echo "features OK"
node --check js/render.js && echo "render OK"
node --check js/core.js && echo "core OK"
node --check js/auth.js && echo "auth OK"
node --check netlify/functions/chat.js && echo "chat fn OK"
node --check netlify/functions/admin.js && echo "admin fn OK"
```

Tous doivent afficher OK. Si l'un échoue, corriger avant de continuer.

- [ ] **Étape 10.2 : Push vers production**

```bash
git push origin main
```

Déploiement automatique Netlify (~2 minutes).

- [ ] **Étape 10.3 : Checklist de vérification en production**

```
[ ] Partager https://mybloomday.app sur WhatsApp → aperçu OG avec vrai logo
[ ] Landing page desktop ≥768px → hero split 50/50 avec photo + mockup WhatsApp
[ ] Landing page mobile → photo en haut, texte + CTA en bas
[ ] Footer visible → cliquer chaque lien (FAQ, CGU, RGPD, À propos) → modale s'ouvre et se ferme
[ ] Bouton 💬 → chatbot s'ouvre → envoyer un message → Bloom répond
[ ] Se connecter avec zekingfinance@gmail.com → onglet Admin visible dans sidebar
[ ] Panel Admin → stats affichées, liste users, notification broadcastée
[ ] Login → accueil → contact avec anniversaire dans 7j → bouton "Idées cadeaux" → modal bouquets
```

---

## Rappel post-déploiement

⚠️ **À faire manuellement — liens affiliés fleurs :**
- S'inscrire au programme affilié Interflora : https://www.interflora.fr/affilies
- S'inscrire au programme affilié 1001Fleurs (chercher "programme affilié 1001fleurs")
- Une fois les liens de tracking obtenus, mettre à jour les `url` dans `FLOWER_SUGGESTIONS` dans `js/features.js` et redéployer avec `git push origin main`
