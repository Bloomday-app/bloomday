# Team-Form Redesign Layout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesigner la page Team-Form avec un layout deux colonnes (formulaire fixe gauche, liste membres droite) sur le dashboard et l'étape 2 de création, et ajouter un avatar utilisateur avec menu déroulant dans la topbar.

**Architecture:** CSS Grid deux colonnes avec `position: sticky` sur la colonne gauche, body classes (`tf-dashboard-active`, `tf-step2-active`) pour activer le max-width élargi, avatar topbar piloté par `TF.user` (session Supabase) avec fallback sur les initiales du manager.

**Tech Stack:** Vanilla JS ES6+, CSS inline dans `team-form.html`, Supabase auth pour la photo de profil.

---

## Fichiers modifiés

| Fichier | Rôle |
|---------|------|
| `js/team-form-i18n.js` | Ajout clés `openBloomday`, `profileMenu` |
| `team-form.html` | CSS deux colonnes + avatar, restructuration HTML dashboard |
| `js/team-form.js` | `tfSetBodyClass`, `tfInitials`, `tfRenderTopbarAvatar`, refactor `tfRenderDashboard`, `tfRenderAddMemberForm`, `tfRenderStep2`, `tfSubmitAddMember` |

---

## Task 1 : Clés i18n

**Files:**
- Modify: `js/team-form-i18n.js:44-60` (bloc `fr`) et `:98-110` (bloc `en`)

- [ ] **Step 1 : Ajouter les clés dans le bloc `fr`**

Dans `js/team-form-i18n.js`, trouver la ligne `tfDeleteSuccess: 'Équipe supprimée'` (dernière clé du bloc `fr`, ligne ~60) et ajouter après :

```js
    openBloomday: 'Ouvrir Bloomday',
    profileMenu: 'Mon compte',
```

Le bloc `fr` doit se terminer par :
```js
    tfDeleteSuccess: 'Équipe supprimée',
    openBloomday: 'Ouvrir Bloomday',
    profileMenu: 'Mon compte',
  },
```

- [ ] **Step 2 : Ajouter les clés dans le bloc `en`**

Dans le bloc `en`, trouver la dernière clé (ligne ~115, chercher `tfDeleteSuccess: 'Team deleted'`) et ajouter après :

```js
    openBloomday: 'Open Bloomday',
    profileMenu: 'My account',
```

- [ ] **Step 3 : Vérifier la syntaxe**

```bash
node --check js/team-form-i18n.js
```

Résultat attendu : aucune sortie (pas d'erreur).

- [ ] **Step 4 : Commit**

```bash
git add js/team-form-i18n.js
git commit -m "feat(team-form): add i18n keys openBloomday and profileMenu"
```

---

## Task 2 : CSS — Avatar topbar + layout deux colonnes

**Files:**
- Modify: `team-form.html` — bloc `<style>` (lignes 12-69)

- [ ] **Step 1 : Ajouter la règle `position: relative` sur `.tf-topbar-right`**

Dans le bloc `<style>`, trouver la règle `.tf-topbar-right{width:80px}` et la remplacer par :

```css
.tf-topbar-right{width:80px;position:relative;display:flex;justify-content:flex-end;align-items:center}
```

- [ ] **Step 2 : Ajouter les classes CSS avatar**

À la fin du bloc `<style>`, juste avant `</style>`, ajouter :

```css
    /* ── AVATAR TOPBAR ── */
    .tf-avatar-btn{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;background:var(--grad);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:0;font-family:inherit;flex-shrink:0}
    .tf-avatar-btn img{width:100%;height:100%;object-fit:cover}
    .tf-avatar-menu{position:absolute;right:0;top:40px;background:var(--bg2);border:1px solid var(--brd);border-radius:var(--rad);box-shadow:var(--sh);padding:12px 14px;min-width:200px;z-index:200}
    .tf-avatar-menu-name{font-weight:700;font-size:14px;margin-bottom:2px;color:var(--txt)}
    .tf-avatar-menu-email{font-size:12px;color:var(--txt2);margin-bottom:12px;word-break:break-all}
    .tf-avatar-menu-link{display:block;text-align:center;padding:8px 12px;background:var(--grad);color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700}
    /* ── LAYOUT DEUX COLONNES ── */
    .tf-two-col{display:grid;grid-template-columns:40% 60%;gap:24px;align-items:start}
    .tf-col-left{position:sticky;top:68px}
    body.tf-dashboard-active .tf-wrap,body.tf-step2-active .tf-wrap{max-width:1200px}
    @media(max-width:767px){.tf-two-col{display:block}.tf-col-left{position:static}}
```

- [ ] **Step 3 : Vérifier que le HTML est valide (pas d'erreur de balises)**

Ouvrir `team-form.html` dans un navigateur (via un serveur local ou en fichier direct), ouvrir la console DevTools — aucune erreur CSS attendue.

- [ ] **Step 4 : Commit**

```bash
git add team-form.html
git commit -m "style(team-form): add two-column layout CSS and avatar topbar styles"
```

---

## Task 3 : HTML — Restructurer `#tf-view-dashboard`

**Files:**
- Modify: `team-form.html:96-105` (bloc `<!-- Mode: Dashboard -->`)

- [ ] **Step 1 : Remplacer le contenu de `#tf-view-dashboard`**

Dans `team-form.html`, trouver le bloc :
```html
    <!-- Mode: Dashboard -->
    <div id="tf-view-dashboard">
      <div class="tf-card">
        <h1 id="tf-dash-title"></h1>
        <div class="progress-bar"><div class="progress-fill" id="tf-progress-fill" style="width:0%"></div></div>
        <p id="tf-progress-text" style="font-size:13px;color:var(--txt2);margin-bottom:16px"></p>
        <div id="tf-dash-actions"></div>
      </div>
      <div id="tf-member-cards"></div>
      <div id="tf-add-member-inline" style="display:none"></div>
    </div>
```

Le remplacer par :
```html
    <!-- Mode: Dashboard -->
    <div id="tf-view-dashboard" class="tf-two-col">
      <div id="tf-dash-left" class="tf-col-left">
        <div class="tf-card">
          <h1 id="tf-dash-title"></h1>
          <div class="progress-bar"><div class="progress-fill" id="tf-progress-fill" style="width:0%"></div></div>
          <p id="tf-progress-text" style="font-size:13px;color:var(--txt2);margin-bottom:16px"></p>
          <div id="tf-dash-actions"></div>
        </div>
        <div class="tf-card" id="tf-dash-form-card" style="border:1.5px dashed var(--brd2)"></div>
      </div>
      <div id="tf-dash-right">
        <div id="tf-member-cards"></div>
      </div>
    </div>
```

- [ ] **Step 2 : Vérifier syntaxe et rendu visuel**

```bash
node --check js/team-form.js
```

Ouvrir `team-form.html?admin=<token>` dans un navigateur (desktop ≥ 768px) : la page doit afficher deux colonnes (même si vides pour l'instant). Sur mobile (< 768px) : une seule colonne.

- [ ] **Step 3 : Commit**

```bash
git add team-form.html
git commit -m "refactor(team-form): restructure dashboard HTML into two-column grid"
```

---

## Task 4 : JS — Session utilisateur + `tfRenderTopbarAvatar()`

**Files:**
- Modify: `js/team-form.js`

- [ ] **Step 1 : Ajouter `TF.user = null` dans l'objet global TF**

Trouver la déclaration de `var TF = {` (ligne ~9) et ajouter `user: null,` après `submitting: false` :

```js
var TF = {
  survey: null,
  members: [],
  mode: null,
  adminToken: null,
  memberToken: null,
  pendingMembers: [],
  pendingTeamName: '',
  pendingManagerName: '',
  pendingInviteMsg: '',
  relationLabels: [],
  currentMember: null,
  selectedGender: '',
  pollInterval: null,
  submitting: false,
  user: null
};
```

- [ ] **Step 2 : Stocker l'utilisateur lors du boot**

Dans `DOMContentLoaded` (ligne ~66), trouver la ligne :
```js
  var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user && sessRes.data.session.user.id;
```

Ajouter juste après :
```js
  TF.user = (sessRes.data && sessRes.data.session && sessRes.data.session.user) || null;
```

- [ ] **Step 3 : Ajouter la fonction `tfSetBodyClass()`**

Après la fonction `tfToast()` (ligne ~140), ajouter :

```js
function tfSetBodyClass(cls) {
  document.body.classList.remove('tf-dashboard-active', 'tf-step2-active');
  if (cls) document.body.classList.add(cls);
}
```

- [ ] **Step 4 : Ajouter la fonction `tfInitials()`**

Juste après `tfSetBodyClass()`, ajouter :

```js
function tfInitials(name) {
  var parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}
```

- [ ] **Step 5 : Ajouter `tfRenderTopbarAvatar()` et `tfCloseAvatarMenu()`**

Juste après `tfInitials()`, ajouter :

```js
function tfRenderTopbarAvatar() {
  var el = document.getElementById('tf-topbar-right');
  if (!el) return;
  var displayName = '';
  var email = '';
  var avatarUrl = '';
  if (TF.user) {
    displayName = (TF.user.user_metadata && (TF.user.user_metadata.full_name || TF.user.user_metadata.name)) || TF.user.email || '';
    email = TF.user.email || '';
    avatarUrl = (TF.user.user_metadata && TF.user.user_metadata.avatar_url) || '';
  } else if (TF.survey && TF.survey.manager_name) {
    displayName = TF.survey.manager_name;
  } else {
    var teams = tfGetSavedTeams();
    displayName = teams.length ? teams[0].managerName || teams[0].teamName || '' : '';
  }
  var initials = tfInitials(displayName);
  var avatarInner = avatarUrl
    ? '<img src="' + tfEsc(avatarUrl) + '" alt="">'
    : initials;
  el.innerHTML = '<button class="tf-avatar-btn" onclick="tfToggleAvatarMenu(event)" aria-label="' + tfT('profileMenu') + '">'
    + avatarInner + '</button>';
}

function tfToggleAvatarMenu(e) {
  e.stopPropagation();
  var el = document.getElementById('tf-topbar-right');
  var existing = el.querySelector('.tf-avatar-menu');
  if (existing) { existing.remove(); return; }
  var displayName = '';
  var email = '';
  if (TF.user) {
    displayName = (TF.user.user_metadata && (TF.user.user_metadata.full_name || TF.user.user_metadata.name)) || TF.user.email || '';
    email = TF.user.email || '';
  } else if (TF.survey && TF.survey.manager_name) {
    displayName = TF.survey.manager_name;
  } else {
    var teams = tfGetSavedTeams();
    displayName = teams.length ? teams[0].managerName || teams[0].teamName || '' : '';
  }
  var menu = document.createElement('div');
  menu.className = 'tf-avatar-menu';
  menu.innerHTML = (displayName ? '<div class="tf-avatar-menu-name">' + tfEsc(displayName) + '</div>' : '')
    + (email ? '<div class="tf-avatar-menu-email">' + tfEsc(email) + '</div>' : '')
    + '<a href="https://mybloomday.app" class="tf-avatar-menu-link">' + tfT('openBloomday') + '</a>';
  el.appendChild(menu);
  document.addEventListener('click', tfCloseAvatarMenu, { once: true });
}

function tfCloseAvatarMenu() {
  var el = document.getElementById('tf-topbar-right');
  if (!el) return;
  var menu = el.querySelector('.tf-avatar-menu');
  if (menu) menu.remove();
}
```

- [ ] **Step 6 : Appeler `tfRenderTopbarAvatar()` dans chaque `tfInit*()`**

Dans `tfInitTeams()` (ligne ~152), ajouter à la fin de la fonction (avant la dernière accolade) :
```js
  tfRenderTopbarAvatar();
```

Dans `tfInitCreate()` (ligne ~180), ajouter à la fin :
```js
  tfRenderTopbarAvatar();
```

Dans `tfInitDashboard()` (ligne ~329), ajouter après `tfStartDashboardPolling()` :
```js
  tfSetBodyClass('tf-dashboard-active');
  tfRenderTopbarAvatar();
```

Dans `tfInitTeams()`, ajouter aussi `tfSetBodyClass('')` au début de la fonction.
Dans `tfInitCreate()`, ajouter `tfSetBodyClass('')` au début.
Dans `tfInitMember()` (ligne ~670), ajouter `tfSetBodyClass('')` au début.

- [ ] **Step 7 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

Résultat attendu : aucune sortie.

- [ ] **Step 8 : Vérification manuelle**

Ouvrir `team-form.html?admin=<token>` dans un navigateur. Un cercle avec les initiales du manager (ou photo si connecté) doit apparaître à droite de la topbar. Cliquer dessus : menu déroulant avec nom et lien Bloomday. Cliquer ailleurs : le menu se ferme.

- [ ] **Step 9 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(team-form): add user avatar with dropdown in topbar"
```

---

## Task 5 : JS — Refactor `tfRenderDashboard()` et formulaire toujours visible

**Files:**
- Modify: `js/team-form.js` — fonctions `tfRenderDashboard()`, `tfRenderAddMemberForm()`, `tfSubmitAddMember()`

- [ ] **Step 1 : Mettre à jour `tfRenderDashboard()`**

Trouver `tfRenderDashboard()` (ligne ~348). Remplacer l'intégralité du corps par :

```js
function tfRenderDashboard() {
  var done = TF.members.filter(function(m) { return m.completed; }).length;
  var total = TF.members.length;
  document.getElementById('tf-dash-title').textContent = '🌸 ' + TF.survey.team_name;
  document.getElementById('tf-progress-fill').style.width = (total ? Math.round(done / total * 100) : 0) + '%';
  document.getElementById('tf-progress-text').textContent = tfT('progress').replace('%done', done).replace('%total', total);
  document.getElementById('tf-dash-actions').innerHTML =
    '<div style="display:flex;gap:8px;flex-wrap:wrap">'
    + '<button class="btn btn-ghost btn-sm" onclick="tfPrintQR()">' + tfT('printQR') + '</button>'
    + '<button class="btn btn-ghost btn-sm" onclick="tfExportCSV()">' + tfT('exportCSV') + '</button>'
    + '<button class="btn btn-primary btn-sm" onclick="tfSyncBloomday()">' + tfT('importAllMembers') + '</button>'
    + '</div>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'
    + '<button class="btn btn-ghost btn-sm" onclick="tfNewTeam()">' + tfT('newTeam') + '</button>'
    + '</div>';
  document.getElementById('tf-member-cards').innerHTML = TF.members.map(function(m) {
    return tfRenderMemberCard(m);
  }).join('');
  tfRenderAddMemberForm();
}
```

Note : le bouton `+ Ajouter un membre` est retiré des actions — le formulaire est maintenant toujours visible dans la colonne gauche.

- [ ] **Step 2 : Mettre à jour `tfRenderAddMemberForm()`**

Trouver `tfRenderAddMemberForm()` (ligne ~380). Remplacer l'intégralité par :

```js
function tfRenderAddMemberForm() {
  var formCard = document.getElementById('tf-dash-form-card');
  if (!formCard) return;
  var relLabels = (TF.survey && Array.isArray(TF.survey.relation_labels)) ? TF.survey.relation_labels : [];
  var relOptions = relLabels.map(function(l) { return '<option>' + tfEsc(l) + '</option>'; }).join('');
  formCard.innerHTML =
    '<h2 style="margin-bottom:16px">' + tfT('addMemberDash') + '</h2>'
    + '<label>' + tfT('firstName') + '</label>'
    + '<input id="tf-dash-inp-first" type="text" placeholder="Prénom">'
    + '<label>' + tfT('lastName') + '</label>'
    + '<input id="tf-dash-inp-last" type="text" placeholder="Nom">'
    + '<label>' + tfT('emailLabel') + '</label>'
    + '<input id="tf-dash-inp-email" type="email" placeholder="email@exemple.com">'
    + (relOptions ? '<label>' + tfT('relation') + '</label><select id="tf-dash-inp-relation">' + relOptions + '</select>' : '')
    + '<button class="btn btn-primary" style="width:100%;margin-top:4px" onclick="tfSubmitAddMember()">' + tfT('addMember') + '</button>';
}
```

- [ ] **Step 3 : Mettre à jour `tfSubmitAddMember()`**

Trouver `tfSubmitAddMember()` (ligne ~400). Remplacer uniquement les deux lignes qui masquent le formulaire inline :

Chercher et supprimer :
```js
  document.getElementById('tf-add-member-inline').style.display = 'none';
```

Remplacer par (vider les champs après ajout) :
```js
  var firstEl2 = document.getElementById('tf-dash-inp-first');
  var lastEl2 = document.getElementById('tf-dash-inp-last');
  var emailEl2 = document.getElementById('tf-dash-inp-email');
  if (firstEl2) firstEl2.value = '';
  if (lastEl2) lastEl2.value = '';
  if (emailEl2) emailEl2.value = '';
  if (firstEl2) firstEl2.focus();
```

- [ ] **Step 4 : Supprimer `tfToggleAddMember()`**

Trouver et supprimer la fonction `tfToggleAddMember()` (environ lignes 369-378) :
```js
function tfToggleAddMember() {
  var el = document.getElementById('tf-add-member-inline');
  if (!el) return;
  if (el.style.display === 'none' || el.style.display === '') {
    tfRenderAddMemberForm();
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}
```

- [ ] **Step 5 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

- [ ] **Step 6 : Vérification manuelle**

Ouvrir `team-form.html?admin=<token>` :
- Desktop (≥ 768px) : formulaire toujours visible à gauche, membres à droite, la colonne gauche reste fixe quand on scrolle les membres.
- Mobile (< 768px) : formulaire en haut, membres en dessous. Scroller vers le bas puis remonter : le formulaire est en haut de la page.
- Ajouter un membre via le formulaire : les champs se vident, le membre apparaît dans la colonne droite.

- [ ] **Step 7 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(team-form): always-visible add-member form in left column of dashboard"
```

---

## Task 6 : JS + CSS — Step 2 création deux colonnes

**Files:**
- Modify: `js/team-form.js` — fonctions `tfRenderStep2()`, `tfStep1Next()`, `tfBackToStep1()`

- [ ] **Step 1 : Mettre à jour `tfRenderStep2()`**

Trouver `tfRenderStep2()` (ligne ~244). Remplacer l'intégralité par :

```js
function tfRenderStep2() {
  var relOptions = TF.relationLabels.map(function(l) { return '<option>' + l.replace(/</g,'&lt;') + '</option>'; }).join('');
  document.getElementById('tf-step-2').innerHTML =
    '<div class="tf-two-col">'
    + '<div class="tf-col-left">'
    + '<div class="tf-card"><h2>' + tfT('stepMembers') + '</h2>'
    + '<label>' + tfT('firstName') + '</label>'
    + '<input id="tf-inp-first" type="text" placeholder="Prénom">'
    + '<label>' + tfT('lastName') + '</label>'
    + '<input id="tf-inp-last" type="text" placeholder="Nom">'
    + '<label>' + tfT('emailLabel') + '</label>'
    + '<input id="tf-inp-email" type="email" placeholder="email@exemple.com">'
    + '<label>' + tfT('relation') + '</label>'
    + '<select id="tf-inp-relation">' + relOptions + '</select>'
    + '<button class="btn btn-ghost" style="width:100%;margin-top:4px" onclick="tfAddMember()">' + tfT('addMember') + '</button>'
    + '</div></div>'
    + '<div>'
    + '<div id="tf-member-list" style="margin-bottom:16px"></div>'
    + '</div>'
    + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:16px">'
    + '<button class="btn btn-ghost btn-sm" onclick="tfBackToStep1()">' + tfT('back') + '</button>'
    + '<button class="btn btn-primary" style="flex:1" onclick="tfSubmitCreate()">' + tfT('createTeam') + '</button>'
    + '</div>';
  tfRefreshMemberList();
}
```

- [ ] **Step 2 : Activer la body class dans `tfStep1Next()`**

Trouver `tfStep1Next()` (ligne ~229). À la fin de la fonction, juste avant la dernière accolade, ajouter :

```js
  tfSetBodyClass('tf-step2-active');
```

- [ ] **Step 3 : Retirer la body class dans `tfBackToStep1()`**

Trouver `tfBackToStep1()` (ligne ~303). À la fin de la fonction, ajouter :

```js
  tfSetBodyClass('');
```

- [ ] **Step 4 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

- [ ] **Step 5 : Vérification manuelle**

Aller sur `team-form.html` sans token (création) → cliquer "Suivant" pour passer à l'étape 2 :
- Desktop : formulaire d'ajout membre à gauche, liste des membres en attente à droite.
- Mobile : formulaire en haut, liste en dessous.
- Cliquer "← Retour" : revient à l'étape 1, layout colonne unique.
- Créer l'équipe : redirige vers le dashboard en deux colonnes.

- [ ] **Step 6 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(team-form): two-column layout for step 2 member creation"
```

---

## Task 7 : Vérification finale et déploiement

- [ ] **Step 1 : Vérifier les trois fichiers JS**

```bash
node --check js/team-form-i18n.js && node --check js/team-form.js && echo "OK"
```

Résultat attendu : `OK`

- [ ] **Step 2 : Checklist de vérification manuelle**

Ouvrir `https://mybloomday.app/team-form.html` (ou en local) et vérifier :

| Scénario | Attendu |
|----------|---------|
| Desktop dashboard | Deux colonnes, formulaire collé à gauche, membres scrollables à droite |
| Desktop dashboard scroll | La colonne gauche reste fixe |
| Mobile dashboard | Formulaire en haut, membres en dessous |
| Avatar topbar | Cercle avec initiales ou photo, cliquable |
| Menu avatar | Nom, email (si connecté), lien Bloomday |
| Clic hors menu | Menu se ferme |
| Ajouter un membre | Champs se vident, membre apparaît à droite |
| Étape 2 création desktop | Deux colonnes |
| Étape 2 création mobile | Colonne unique, formulaire en haut |
| Retour étape 1 | Layout colonne unique, max-width 540px |
| Vue "Mes équipes" | Colonne unique, avatar présent |

- [ ] **Step 3 : Déployer**

```bash
git push origin main
```

Netlify déclenche automatiquement le déploiement vers https://mybloomday.app.
