# UX Layout 3 colonnes, Reset Mot de Passe, Email Supabase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger 4 problèmes UX : layout 3 colonnes desktop avec nav 140px, sélecteur langue dans la sidebar, formulaire de réinitialisation mot de passe fonctionnel, et email reset branded dans la DA Bloomday.

**Architecture:** Modifications dans `css/app.css` (sidebar 140px, lang-sel repositionné), `index.html` (boutons nav avec labels, modale reset, sidebar lang), `js/auth.js` (handler PASSWORD_RECOVERY + doResetPassword), `js/i18n.js` (6 nouvelles clés x 7 langues), `js/render.js` (renderSideCalendar), et `netlify/functions/send-email.js` (fix URLs). Le template email Supabase est fourni sous forme de HTML à copier-coller.

**Tech Stack:** Vanilla JS ES6+, CSS custom, HTML5, Supabase Auth, Brevo (email transactionnel)

---

## Task 1 : Fix URLs Brevo dans send-email.js

**Files:**
- Modify: `netlify/functions/send-email.js:60-61`

- [ ] **Step 1 : Corriger APP_URL et LOGO_URL**

Dans `netlify/functions/send-email.js`, remplacer les lignes 60-61 :

```js
const APP_URL = 'https://mybloomday.app';
const LOGO_URL = 'https://mybloomday.app/img/logo.png';
```

- [ ] **Step 2 : Vérifier syntaxe**

```bash
node --check netlify/functions/send-email.js
```

Résultat attendu : aucune sortie (pas d'erreur).

- [ ] **Step 3 : Commit**

```bash
git add netlify/functions/send-email.js
git commit -m "fix(email): corriger APP_URL et LOGO_URL vers mybloomday.app"
```

---

## Task 2 : Clés i18n pour le formulaire de reset mot de passe

**Files:**
- Modify: `js/i18n.js`

Ajouter 6 clés après `resetPasswordSent` dans chacune des 7 langues.

- [ ] **Step 1 : Ajouter les clés en français (après ligne 642)**

Chercher `resetPasswordSent:'Email envoye ! Verifiez votre boite mail.',` et ajouter juste après :

```js
    resetPassTitle:'Nouveau mot de passe',
    resetPassLabel:'Choisissez votre nouveau mot de passe (8 caracteres min.)',
    resetPassConfirm:'Confirmer le mot de passe',
    resetPassBtn:'Enregistrer le nouveau mot de passe',
    passwordUpdated:'Mot de passe mis a jour !',
    errPassMismatch:'Les mots de passe ne correspondent pas.',
```

- [ ] **Step 2 : Ajouter les clés en anglais**

Chercher `resetPasswordSent:'Email sent! Check your inbox.',` et ajouter juste après :

```js
    resetPassTitle:'New password',
    resetPassLabel:'Choose your new password (8 characters min.)',
    resetPassConfirm:'Confirm password',
    resetPassBtn:'Save new password',
    passwordUpdated:'Password updated!',
    errPassMismatch:'Passwords do not match.',
```

- [ ] **Step 3 : Ajouter les clés en espagnol**

Chercher `resetPasswordSent:'Email enviado. Revisa tu bandeja.',` et ajouter juste après :

```js
    resetPassTitle:'Nueva contrasena',
    resetPassLabel:'Elige tu nueva contrasena (8 caracteres min.)',
    resetPassConfirm:'Confirmar contrasena',
    resetPassBtn:'Guardar nueva contrasena',
    passwordUpdated:'Contrasena actualizada!',
    errPassMismatch:'Las contrasenas no coinciden.',
```

- [ ] **Step 4 : Ajouter les clés en arabe**

Chercher `resetPasswordSent:'تم الإرسال! تحقق من بريدك.',` et ajouter juste après :

```js
    resetPassTitle:'كلمة مرور جديدة',
    resetPassLabel:'اختر كلمة مرور جديدة (8 أحرف على الأقل)',
    resetPassConfirm:'تأكيد كلمة المرور',
    resetPassBtn:'حفظ كلمة المرور الجديدة',
    passwordUpdated:'تم تحديث كلمة المرور!',
    errPassMismatch:'كلمتا المرور غير متطابقتين.',
```

- [ ] **Step 5 : Ajouter les clés en hindi**

Chercher `resetPasswordSent:'ईमेल भेजा! इनबॉक्स देखें।',` et ajouter juste après :

```js
    resetPassTitle:'नया पासवर्ड',
    resetPassLabel:'नया पासवर्ड चुनें (8 अक्षर न्यूनतम)',
    resetPassConfirm:'पासवर्ड की पुष्टि करें',
    resetPassBtn:'नया पासवर्ड सहेजें',
    passwordUpdated:'पासवर्ड अपडेट हो गया!',
    errPassMismatch:'पासवर्ड मेल नहीं खाते।',
```

- [ ] **Step 6 : Ajouter les clés en chinois**

Chercher `resetPasswordSent:'邮件已发送！请查收。',` et ajouter juste après :

```js
    resetPassTitle:'新密码',
    resetPassLabel:'选择您的新密码（至少8个字符）',
    resetPassConfirm:'确认密码',
    resetPassBtn:'保存新密码',
    passwordUpdated:'密码已更新！',
    errPassMismatch:'两次输入的密码不匹配。',
```

- [ ] **Step 7 : Ajouter les clés en portugais**

Chercher `resetPasswordSent:` dans le bloc `pt:` et ajouter juste après :

```js
    resetPassTitle:'Nova senha',
    resetPassLabel:'Escolha sua nova senha (8 caracteres min.)',
    resetPassConfirm:'Confirmar senha',
    resetPassBtn:'Salvar nova senha',
    passwordUpdated:'Senha atualizada!',
    errPassMismatch:'As senhas nao correspondem.',
```

- [ ] **Step 8 : Vérifier syntaxe**

```bash
node --check js/i18n.js
```

Résultat attendu : aucune sortie.

- [ ] **Step 9 : Commit**

```bash
git add js/i18n.js
git commit -m "feat(i18n): clés resetPass et passwordUpdated en 7 langues"
```

---

## Task 3 : Modale reset mot de passe + handler PASSWORD_RECOVERY

**Files:**
- Modify: `index.html` (ajouter modale #m-reset-pass après #m-auth)
- Modify: `js/auth.js` (handler + fonction showPasswordResetForm + doResetPassword)

- [ ] **Step 1 : Ajouter la modale dans index.html**

Après le bloc fermant `</div></div>` de `#m-auth` (chercher `<!-- Modale Paiement -->`), insérer avant ce commentaire :

```html
<!-- Modale Reset Mot de Passe -->
<div id="m-reset-pass" class="ov">
<div class="mbox2">
  <div class="mt" data-i18n="resetPassTitle">Nouveau mot de passe</div>
  <label data-i18n="resetPassLabel">Choisissez votre nouveau mot de passe (8 caracteres min.)</label>
  <input type="password" id="reset-pass-new" placeholder="..........">
  <label style="margin-top:10px" data-i18n="resetPassConfirm">Confirmer le mot de passe</label>
  <input type="password" id="reset-pass-confirm" placeholder="..........">
  <button class="btn P fw" id="reset-pass-btn" style="margin-top:14px" onclick="doResetPassword()" data-i18n="resetPassBtn">Enregistrer le nouveau mot de passe</button>
</div>
</div>
```

- [ ] **Step 2 : Ajouter le handler PASSWORD_RECOVERY dans js/auth.js**

Dans la fonction `onAuthStateChange`, après le bloc `} else if (event === 'SIGNED_OUT') {` et sa `}` fermante (ligne ~90), ajouter :

```js
    } else if (event === 'PASSWORD_RECOVERY') {
      showPasswordResetForm();
    }
```

- [ ] **Step 3 : Ajouter showPasswordResetForm et doResetPassword dans js/auth.js**

Après la fonction `doForgotPassword` (chercher sa `}` fermante), ajouter :

```js
function showPasswordResetForm() {
  var n = document.getElementById('reset-pass-new');
  var c = document.getElementById('reset-pass-confirm');
  if (n) n.value = '';
  if (c) c.value = '';
  closeOv('m-auth');
  openOv('m-reset-pass');
}

async function doResetPassword() {
  var newPass = (document.getElementById('reset-pass-new') || {}).value || '';
  var confirm = (document.getElementById('reset-pass-confirm') || {}).value || '';
  if (newPass.length < 8) { showToast(t('errPassShort'), 'error'); return; }
  if (newPass !== confirm) { showToast(t('errPassMismatch'), 'error'); return; }
  var btn = document.getElementById('reset-pass-btn');
  if (btn) { btn.disabled = true; btn.textContent = '...'; }
  var result = await supabase.auth.updateUser({ password: newPass });
  if (btn) { btn.disabled = false; btn.textContent = t('resetPassBtn'); }
  if (result.error) {
    showToast(result.error.message || t('errorGeneric'), 'error');
  } else {
    closeOv('m-reset-pass');
    showToast(t('passwordUpdated'), 'success');
  }
}
```

- [ ] **Step 4 : Vérifier syntaxe**

```bash
node --check js/auth.js
```

- [ ] **Step 5 : Tester manuellement la modale**

Ouvrir `https://mybloomday.app` dans le navigateur. Dans la console JS, exécuter :
```js
showPasswordResetForm()
```
La modale `#m-reset-pass` doit s'ouvrir avec les deux champs et le bouton.

- [ ] **Step 6 : Commit**

```bash
git add index.html js/auth.js
git commit -m "feat(auth): formulaire et handler PASSWORD_RECOVERY pour reset mot de passe"
```

---

## Task 4 : Template email reset pour Supabase Dashboard

**Files:**
- Aucun fichier à modifier — template à copier-coller manuellement dans le dashboard Supabase

- [ ] **Step 1 : Copier le template HTML ci-dessous dans Supabase**

Aller sur [supabase.com](https://supabase.com) > ton projet > **Authentication** > **Email Templates** > **Reset Password**.

Dans le champ **Body**, effacer le contenu et coller ce HTML :

```
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(91,45,142,0.10)">
  <div style="background:#5b2d8e;padding:28px 32px;text-align:center;border-radius:12px 12px 0 0">
    <img src="https://mybloomday.app/img/logo.png" alt="Bloomday" width="64" height="64" style="border-radius:14px;display:block;margin:0 auto 12px">
    <span style="color:#fff;font-family:Georgia,serif;font-size:22px;font-weight:bold;letter-spacing:1px">Bloomday</span>
  </div>
  <div style="padding:32px;background:#fff">
    <h2 style="margin:0 0 8px;color:#5b2d8e;font-size:22px">Reinitialisez votre mot de passe</h2>
    <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 20px">Vous avez demande a reinitialiser votre mot de passe <strong>Bloomday</strong>. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe securise.</p>
    <div style="background:#f9f4ff;border-radius:10px;padding:20px;margin-bottom:24px">
      <p style="margin:4px 0;color:#555;font-size:14px">Ce lien est personnel et securise</p>
      <p style="margin:4px 0;color:#555;font-size:14px">Il expire dans 24 heures</p>
      <p style="margin:4px 0;color:#555;font-size:14px">Si vous n etes pas a l origine de cette demande, ignorez cet email</p>
    </div>
    <div style="text-align:center;margin:28px 0">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#e85d9a,#5b2d8e);color:#fff;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;letter-spacing:0.3px">Choisir un nouveau mot de passe</a>
    </div>
    <p style="text-align:center;color:#888;font-size:13px;margin-top:8px">Votre compte Bloomday reste securise</p>
  </div>
  <div style="padding:20px 32px;background:#f9f4ff;border-radius:0 0 12px 12px;text-align:center">
    <p style="margin:0;color:#888;font-size:12px">L equipe Bloomday - mybloomday.app</p>
  </div>
</div>
```

Dans le champ **Subject**, mettre :
```
Reinitialisation de votre mot de passe Bloomday
```

Cliquer **Save**.

- [ ] **Step 2 : Tester**

Sur mybloomday.app, cliquer "Mot de passe oublié ?", entrer un email valide, et vérifier que l'email reçu a le fond violet, le logo Bloomday et le bouton gradient.

---

## Task 5 : Layout sidebar 140px + panneau droit calendrier + langue repositionnée

**Files:**
- Modify: `css/app.css`
- Modify: `index.html`
- Modify: `js/render.js`
- Modify: `js/core.js`

### 5a — CSS sidebar 140px

- [ ] **Step 1 : Modifier la largeur et l'alignement de .desktop-sidebar**

Dans `css/app.css`, remplacer :

```css
.desktop-sidebar{display:none;flex-direction:column;align-items:center;width:64px;flex-shrink:0;background:var(--txt);min-height:100vh;padding:12px 0;position:sticky;top:0;height:100vh;z-index:200}
```

par :

```css
.desktop-sidebar{display:none;flex-direction:column;align-items:flex-start;width:140px;flex-shrink:0;background:var(--txt);min-height:100vh;padding:12px 0;position:sticky;top:0;height:100vh;z-index:200}
```

- [ ] **Step 2 : Modifier .dsb-logo**

Remplacer :

```css
.dsb-logo{margin-bottom:20px;padding:8px}
```

par :

```css
.dsb-logo{margin-bottom:20px;padding:8px 16px;display:flex;align-items:center;gap:8px}
```

- [ ] **Step 3 : Modifier .dsb-nav**

Remplacer :

```css
.dsb-nav{display:flex;flex-direction:column;gap:4px;flex:1;width:100%;padding:0 8px}
```

par :

```css
.dsb-nav{display:flex;flex-direction:column;gap:2px;flex:1;width:100%;padding:0 8px}
```

- [ ] **Step 4 : Modifier .dsb-btn**

Remplacer :

```css
.dsb-btn{width:100%;aspect-ratio:1;border:none;background:transparent;border-radius:10px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.35);cursor:pointer;transition:all .18s}
```

par :

```css
.dsb-btn{width:100%;border:none;background:transparent;border-radius:10px;display:flex;align-items:center;gap:8px;padding:9px 10px;color:rgba(255,255,255,.35);cursor:pointer;transition:all .18s;font-size:12px;font-weight:600;letter-spacing:.01em}
```

- [ ] **Step 5 : Remplacer les règles .lang-sel et .lang-dd existantes**

Remplacer ce bloc :

```css
.lang-sel{position:fixed;top:12px;right:12px;z-index:300;background:var(--card);
  border:1px solid var(--brd);border-radius:20px;padding:5px 12px;font-size:13px;
  display:flex;align-items:center;gap:6px;box-shadow:var(--sh);cursor:pointer}
.lang-dd{position:fixed;top:48px;right:12px;z-index:301;background:var(--card);
  border:1px solid var(--brd);border-radius:14px;padding:6px;
  box-shadow:0 8px 24px rgba(0,0,0,.12);display:none;flex-direction:column;gap:2px;min-width:140px}
.lang-dd.open{display:flex}
```

par :

```css
.lang-sel{display:flex;align-items:center;gap:6px;padding:9px 10px;cursor:pointer;font-size:12px;font-weight:600;color:rgba(255,255,255,.5);position:relative;width:100%;box-sizing:border-box}
.lang-sel:hover{color:rgba(255,255,255,.8)}
.lang-dd{position:absolute;bottom:100%;left:0;z-index:400;background:var(--card);border:1px solid var(--brd);border-radius:14px;padding:6px;box-shadow:0 -8px 24px rgba(0,0,0,.12);display:none;flex-direction:column;gap:2px;min-width:140px}
.lang-dd.open{display:flex}
```

### 5b — HTML sidebar avec labels et lang-sel intégré

- [ ] **Step 6 : Remplacer le bloc .desktop-sidebar dans index.html**

Remplacer tout le bloc `<div class="desktop-sidebar" id="desktop-sidebar">` ... `</div>` (lignes ~196-221) par :

```html
<div class="desktop-sidebar" id="desktop-sidebar">
  <div class="dsb-logo">
    <div class="dsb-logo-wrap"><svg width="22" height="22"><use href="#bi"/></svg></div>
    <span style="color:white;font-size:13px;font-weight:700;letter-spacing:.01em">Bloomday</span>
  </div>
  <nav class="dsb-nav">
    <button class="dsb-btn on" id="dsb0" onclick="showSec('home',0)" title="Accueil">
      <svg viewBox="0 0 22 22" fill="none" width="18" height="18"><rect x="3" y="10" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M1 11L11 3l10 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      <span data-i18n="navHome">Accueil</span>
    </button>
    <button class="dsb-btn" id="dsb1" onclick="showSec('members',1)" title="Membres">
      <svg viewBox="0 0 22 22" fill="none" width="18" height="18"><circle cx="8" cy="7" r="3.5" stroke="currentColor" stroke-width="1.4"/><path d="M2 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      <span data-i18n="navMembers">Membres</span>
    </button>
    <button class="dsb-btn" id="dsb2" onclick="showSec('add',2)" title="Ajouter">
      <svg viewBox="0 0 22 22" fill="none" width="18" height="18"><circle cx="11" cy="11" r="8.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 7v8M7 11h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      <span data-i18n="navAdd">Ajouter</span>
    </button>
    <button class="dsb-btn" id="dsb3" onclick="showSec('events',3)" title="Fetes">
      <svg viewBox="0 0 22 22" fill="none" width="18" height="18"><path d="M11 3C7.686 3 5 5.686 5 9c0 5 6 10 6 10s6-5 6-10c0-3.314-2.686-6-6-6z" stroke="currentColor" stroke-width="1.4"/><circle cx="11" cy="9" r="2" stroke="currentColor" stroke-width="1.4"/></svg>
      <span data-i18n="navEvents">Fetes</span>
    </button>
    <button class="dsb-btn" id="dsb4" onclick="showSec('more',4)" title="Profil">
      <svg viewBox="0 0 22 22" fill="none" width="18" height="18"><circle cx="11" cy="8" r="4" stroke="currentColor" stroke-width="1.4"/><path d="M3 19c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      <span data-i18n="navProfile">Profil</span>
    </button>
  </nav>
  <div id="nav-admin-btn" style="display:none;padding:0 8px">
    <button class="dsb-btn" onclick="showSec('admin',99)" style="background:rgba(212,168,67,.15);border:1px solid rgba(212,168,67,.3)" title="Admin">
      <svg viewBox="0 0 22 22" fill="none" width="18" height="18"><rect x="3" y="3" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.4"/><path d="M7 11h8M11 7v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      <span>Admin</span>
    </button>
  </div>
  <div style="padding:0 8px;margin-bottom:8px;position:relative">
    <div class="lang-sel" id="lang-sel" onclick="toggleLangDd()">
      <span>🌍</span><span id="lang-cur">FR</span><span>▾</span>
    </div>
    <div class="lang-dd" id="lang-dd">
      <div class="lang-opt on" data-lang="fr" onclick="pickLang('fr')">FR Francais</div>
      <div class="lang-opt" data-lang="en" onclick="pickLang('en')">EN English</div>
      <div class="lang-opt" data-lang="es" onclick="pickLang('es')">ES Espanol</div>
      <div class="lang-opt" data-lang="ar" onclick="pickLang('ar')">AR</div>
      <div class="lang-opt" data-lang="hi" onclick="pickLang('hi')">HI</div>
      <div class="lang-opt" data-lang="zh" onclick="pickLang('zh')">ZH</div>
      <div class="lang-opt" data-lang="pt" onclick="pickLang('pt')">PT Portugues</div>
    </div>
  </div>
</div>
```

- [ ] **Step 7 : Supprimer l'ancien bloc lang-sel hors sidebar**

Dans `index.html`, supprimer les lignes du sélecteur de langue en dehors de la sidebar (chercher `<div class="lang-sel" id="lang-sel" onclick="toggleLangDd()">` vers ligne 389, ainsi que le `<div class="lang-dd" id="lang-dd">` qui suit, jusqu'à leur `</div>` fermant inclus).

### 5c — Panneau droit : mini-calendrier

- [ ] **Step 8 : Ajouter renderSideCalendar dans js/render.js**

Après la fonction `rCal()` (après sa `}` fermante, ligne ~542), ajouter la fonction suivante. Elle suit le meme pattern que rCal() : construction d'une chaine HTML avec esc() pour tout contenu utilisateur, puis assignation à el.textContent ou via DOM safe :

```js
function renderSideCalendar() {
  var el = document.getElementById('desktop-right-panel');
  if (!el) return;
  var m = mems();
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  var parts = [];

  var title = document.createElement('div');
  title.style.cssText = 'font-size:13px;font-weight:700;color:var(--txt);margin-bottom:12px';
  title.textContent = MN[month] + ' ' + year;
  parts.push(title);

  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:3px;font-size:11px;text-align:center';
  ['L','M','M','J','V','S','D'].forEach(function(d){
    var hd = document.createElement('div');
    hd.style.cssText = 'color:var(--txt2);padding:2px;font-size:10px';
    hd.textContent = d;
    grid.appendChild(hd);
  });
  for (var i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement('div'));
  }
  for (var day = 1; day <= daysInMonth; day++) {
    var isToday = day === now.getDate();
    var hasBday = m.some(function(p){ return p.day === day && p.month === (month + 1); });
    var cell = document.createElement('div');
    cell.textContent = String(day);
    cell.style.cssText = 'padding:5px 2px;border-radius:6px;';
    if (isToday) cell.style.cssText += 'background:var(--b1);color:white;font-weight:700;';
    else if (hasBday) cell.style.cssText += 'background:var(--b2l);color:var(--b2d);font-weight:700;';
    grid.appendChild(cell);
  }
  parts.push(grid);

  var upcoming = m.filter(function(p){
    var dl = daysTill(p.day, p.month);
    return dl >= 0 && dl <= 30;
  }).sort(function(a,b){ return daysTill(a.day,a.month) - daysTill(b.day,b.month); }).slice(0,5);

  if (upcoming.length) {
    var upTitle = document.createElement('div');
    upTitle.style.cssText = 'font-size:12px;font-weight:700;color:var(--txt);margin:16px 0 8px';
    upTitle.textContent = t('upcomingBdays');
    parts.push(upTitle);
    upcoming.forEach(function(p){
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--brd)';
      var dateEl = document.createElement('div');
      dateEl.style.cssText = 'min-width:28px;font-size:11px;font-weight:700;color:var(--b1d)';
      dateEl.textContent = p.day + '/' + p.month;
      var nameEl = document.createElement('div');
      nameEl.style.cssText = 'flex:1;font-size:12px;font-weight:600';
      nameEl.textContent = tIco(p.type) + ' ' + p.name;
      var dlEl = document.createElement('div');
      var dl = daysTill(p.day, p.month);
      dlEl.style.cssText = 'font-size:10px;color:var(--txt2)';
      dlEl.textContent = dl === 0 ? t('calendarToday') : 'J-' + dl;
      row.appendChild(dateEl);
      row.appendChild(nameEl);
      row.appendChild(dlEl);
      parts.push(row);
    });
  }

  while (el.firstChild) el.removeChild(el.firstChild);
  parts.forEach(function(p){ el.appendChild(p); });
}
```

- [ ] **Step 9 : Appeler renderSideCalendar depuis refresh() dans js/core.js**

Dans `js/core.js`, trouver la fonction `refresh()` et ajouter à la fin (avant la `}` fermante) :

```js
  renderSideCalendar();
```

- [ ] **Step 10 : Vérifier syntaxe**

```bash
node --check js/render.js
node --check js/core.js
```

Résultat attendu : aucune sortie.

- [ ] **Step 11 : Vérifier visuellement**

Ouvrir `https://mybloomday.app` sur un écran large (> 768px, par exemple en simulant desktop dans les DevTools). Vérifier :
- Sidebar 140px avec icône + label pour chaque bouton
- Sélecteur langue en bas de la sidebar, dropdown vers le haut
- Panneau droit avec mini-calendrier du mois en cours et prochains anniversaires
- Sur mobile : sidebar masquée, barre du bas inchangée

- [ ] **Step 12 : Commit**

```bash
git add index.html css/app.css js/render.js js/core.js
git commit -m "feat(layout): sidebar 140px avec labels, panneau calendrier droit, lang-sel repositionne"
```
