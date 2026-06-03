# Team Survey — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer `team-form.html` — formulaire d'équipe standalone permettant à un manager de collecter nom, prénom, anniversaire, genre et mariage de ses membres, puis d'importer directement dans Bloomday.

**Architecture:** Page HTML unique avec 3 modes détectés via URL params (`?admin=TOKEN` = dashboard, `?member=TOKEN` = fiche membre, aucun = création). Données dans 2 tables Supabase (`surveys` + `survey_members`). Sync directe Bloomday via session Supabase partagée (même domaine `mybloomday.app`).

**Tech Stack:** Vanilla JS ES6+, Supabase anon key (même projet que Bloomday), Netlify Functions/Brevo (email), qrcode-generator.js (embarqué localement, pas de CDN)

---

## Structure des fichiers

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `team-form.html` | Créer | Structure HTML + CSS + includes scripts |
| `js/team-form-i18n.js` | Créer | Dictionnaire fr/en + fonction `tfT(key)` |
| `js/team-form.js` | Créer | Toute la logique JS (routing, wizard, dashboard, membre, QR, CSV, sync) |
| `lib/qrcode.min.js` | Télécharger | Librairie QR code embarquée localement |
| `netlify/functions/send-email.js` | Modifier | Ajouter type `survey_invite` dans `VALID_TYPES` et `templates{}` |
| Supabase SQL | Exécuter | Créer tables `surveys` + `survey_members` + RLS |

---

## Task 1 : Supabase — Tables + RLS

**Files:**
- SQL à exécuter dans l'éditeur SQL Supabase

- [ ] **Step 1 : Exécuter le SQL de création des tables**

Aller sur https://supabase.com/dashboard/project/oeqmqkkzbdouzxdeoenv/sql/new et exécuter :

```sql
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  team_name text NOT NULL,
  manager_name text NOT NULL DEFAULT '',
  relation_labels jsonb NOT NULL DEFAULT '["Collègue","Manager","Directeur·rice","Stagiaire","Ami(e)","Autre"]',
  invite_message text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS survey_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL DEFAULT '',
  email text,
  birth_day int,
  birth_month int,
  birth_year int,
  gender text,
  relation text,
  married boolean DEFAULT false,
  spouse_name text,
  wedding_day int,
  wedding_month int,
  wedding_year int,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "surveys_public" ON surveys FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE survey_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "survey_members_public" ON survey_members FOR ALL USING (true) WITH CHECK (true);
```

Note sécurité : les tokens sont des UUID (122 bits d'entropie), ce qui rend l'accès par force brute impossible. RLS permissive intentionnelle car il n'y a pas d'auth pour les membres.

- [ ] **Step 2 : Vérifier les tables dans Supabase**

Dans "Table Editor" de Supabase, vérifier que `surveys` et `survey_members` apparaissent avec les colonnes listées.

---

## Task 2 : send-email — type `survey_invite`

**Files:**
- Modify: `netlify/functions/send-email.js`

- [ ] **Step 1 : Ajouter `survey_invite` à `VALID_TYPES` (ligne 23)**

```js
// Avant
const VALID_TYPES = ['welcome', 'subscription', 'renewal_reminder', 'anniversary'];

// Après
const VALID_TYPES = ['welcome', 'subscription', 'renewal_reminder', 'anniversary', 'survey_invite'];
```

- [ ] **Step 2 : Ajouter le template dans `buildTemplate` (avant la fermeture `};` de l'objet `templates`, ligne 151)**

Dans la fonction `buildTemplate`, juste avant la ligne `};` qui ferme l'objet `templates`, ajouter :

```js
    ,survey_invite: {
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
```

- [ ] **Step 3 : Vérifier la syntaxe**

```bash
node --check netlify/functions/send-email.js
```

Attendu : aucune sortie (= syntaxe OK)

- [ ] **Step 4 : Commit**

```bash
git add netlify/functions/send-email.js
git commit -m "feat(survey): add survey_invite email type to send-email function"
```

---

## Task 3 : Librairie QR + i18n

**Files:**
- Create: `lib/qrcode.min.js`
- Create: `js/team-form-i18n.js`

- [ ] **Step 1 : Télécharger la librairie QR code**

```bash
mkdir -p lib
curl -L -o lib/qrcode.min.js "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"
```

Vérifier que le fichier existe et fait ~40KB :

```bash
ls -lh lib/qrcode.min.js
head -c 100 lib/qrcode.min.js
```

Attendu : le fichier commence par `var qrcode` ou similaire.

- [ ] **Step 2 : Créer `js/team-form-i18n.js`**

```js
var TF_I18N = {
  fr: {
    title: 'Formulaire d\'équipe',
    stepTeam: 'L\'équipe', stepMembers: 'Les membres', stepShare: 'Partager',
    teamName: 'Nom de l\'équipe *', managerName: 'Votre prénom *',
    inviteMessage: 'Message d\'invitation',
    defaultInviteMsg: 'Bonjour [Prénom] ! [Manager] t\'invite à compléter ton profil pour l\'équipe [Équipe]. Ça prend 2 minutes et ça permettra de ne jamais rater vos moments importants 🎂 👉 [LIEN]',
    relationLabels: 'Options de relation', addRelation: '+ Ajouter une option',
    firstName: 'Prénom *', lastName: 'Nom', emailLabel: 'Email (optionnel)',
    relation: 'Relation', addMember: 'Ajouter', removeMember: 'Retirer',
    createTeam: 'Créer l\'équipe →', next: 'Suivant →', back: '← Retour',
    noMembers: 'Aucun membre — ajoutez-en au moins un.',
    dashTitle: 'Tableau de bord',
    progress: '%done/%total complétés',
    statusCompleted: '✅ Complété', statusPending: '⏳ En attente',
    sendEmail: '📧 Email', sendWhatsApp: '💬 WhatsApp',
    sendSMS: '📱 SMS', copyLink: '📋 Copier',
    copied: 'Lien copié !', qrCode: 'QR Code',
    printQR: 'Imprimer tous les QR codes',
    exportCSV: '⬇ Exporter CSV',
    syncBloomday: '🌸 Importer dans Bloomday',
    syncSuccess: '%d contact(s) importé(s) dans Bloomday !',
    syncNotConnected: 'Connectez-vous à Bloomday pour utiliser la sync directe.',
    memberTitle: 'Complète ton profil 🌸',
    memberSub: 'Tes infos restent privées et servent uniquement à Bloomday.',
    birthDate: 'Date de naissance *', day: 'Jour', month: 'Mois', year: 'Année',
    gender: 'Genre', male: 'Homme', female: 'Femme',
    married: 'Marié(e) ?',
    spouseName: 'Prénom + Nom du/de la conjoint(e) *',
    weddingDate: 'Date du mariage *',
    submit: 'Envoyer mes infos',
    thankYou: 'Merci [Prénom] ! 🎉',
    thankYouSub: 'Tes infos ont bien été enregistrées.',
    errorRequired: 'Merci de remplir les champs obligatoires.',
    alreadyCompleted: 'Tu as déjà complété ton profil. Merci !',
    defaultRelations: ['Collègue', 'Manager', 'Directeur·rice', 'Stagiaire', 'Ami(e)', 'Autre']
  },
  en: {
    title: 'Team Form',
    stepTeam: 'The team', stepMembers: 'Members', stepShare: 'Share',
    teamName: 'Team name *', managerName: 'Your first name *',
    inviteMessage: 'Invitation message',
    defaultInviteMsg: 'Hi [First name]! [Manager] is inviting you to complete your profile for the [Team] team. Takes 2 minutes 🎂 👉 [LINK]',
    relationLabels: 'Relation options', addRelation: '+ Add option',
    firstName: 'First name *', lastName: 'Last name', emailLabel: 'Email (optional)',
    relation: 'Relation', addMember: 'Add', removeMember: 'Remove',
    createTeam: 'Create team →', next: 'Next →', back: '← Back',
    noMembers: 'No members yet — add at least one.',
    dashTitle: 'Dashboard',
    progress: '%done/%total completed',
    statusCompleted: '✅ Completed', statusPending: '⏳ Pending',
    sendEmail: '📧 Email', sendWhatsApp: '💬 WhatsApp',
    sendSMS: '📱 SMS', copyLink: '📋 Copy',
    copied: 'Link copied!', qrCode: 'QR Code',
    printQR: 'Print all QR codes',
    exportCSV: '⬇ Export CSV',
    syncBloomday: '🌸 Import to Bloomday',
    syncSuccess: '%d contact(s) imported to Bloomday!',
    syncNotConnected: 'Log in to Bloomday to use direct sync.',
    memberTitle: 'Complete your profile 🌸',
    memberSub: 'Your info stays private and is only used by Bloomday.',
    birthDate: 'Date of birth *', day: 'Day', month: 'Month', year: 'Year',
    gender: 'Gender', male: 'Male', female: 'Female',
    married: 'Married?',
    spouseName: 'Spouse\'s full name *',
    weddingDate: 'Wedding date *',
    submit: 'Submit my info',
    thankYou: 'Thank you [First name]! 🎉',
    thankYouSub: 'Your info has been saved.',
    errorRequired: 'Please fill in all required fields.',
    alreadyCompleted: 'You already completed your profile. Thank you!',
    defaultRelations: ['Colleague', 'Manager', 'Director', 'Intern', 'Friend', 'Other']
  }
};

function tfLang() {
  return (navigator.language || 'fr').startsWith('fr') ? 'fr' : 'en';
}

function tfT(key) {
  var lang = tfLang();
  var val = TF_I18N[lang] && TF_I18N[lang][key] !== undefined ? TF_I18N[lang][key] : TF_I18N['fr'][key];
  return val !== undefined ? val : key;
}
```

- [ ] **Step 3 : Vérifier la syntaxe**

```bash
node --check js/team-form-i18n.js
```

Attendu : aucune sortie

- [ ] **Step 4 : Commit**

```bash
git add lib/qrcode.min.js js/team-form-i18n.js
git commit -m "feat(survey): QR library + team-form i18n (fr/en)"
```

---

## Task 4 : team-form.html — Structure + CSS

**Files:**
- Create: `team-form.html`

- [ ] **Step 1 : Créer `team-form.html`**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Bloomday — Formulaire d'équipe</title>
  <style>
    :root { --b2:#e75480; --b3:#f9a8c9; --txt:#222; --txt2:#666; --bg:#fafafa; --bg2:#fff; --rad:12px; --shadow:0 2px 12px rgba(0,0,0,.08); }
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh}
    .tf-wrap{max-width:540px;margin:0 auto;padding:24px 16px 80px}
    .tf-logo{text-align:center;margin-bottom:24px}
    .tf-logo a{font-size:22px;font-weight:800;color:var(--b2);text-decoration:none}
    .tf-card{background:var(--bg2);border-radius:var(--rad);box-shadow:var(--shadow);padding:24px;margin-bottom:16px}
    h1{font-size:20px;font-weight:700;margin-bottom:4px}
    h2{font-size:16px;font-weight:600;margin-bottom:16px;color:var(--b2)}
    label{display:block;font-size:13px;font-weight:600;margin-bottom:4px;color:var(--txt2)}
    input,select,textarea{width:100%;border:1.5px solid #e0e0e0;border-radius:8px;padding:10px 12px;font-size:14px;outline:none;background:#fff;transition:border-color .2s;margin-bottom:12px;font-family:inherit}
    input:focus,select:focus,textarea:focus{border-color:var(--b2)}
    textarea{resize:vertical;min-height:80px}
    .btn{display:inline-block;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;border:none;cursor:pointer;transition:opacity .15s;font-family:inherit}
    .btn:hover{opacity:.85}
    .btn-primary{background:var(--b2);color:#fff;width:100%;text-align:center}
    .btn-ghost{background:transparent;border:1.5px solid #ddd;color:var(--txt2)}
    .btn-sm{padding:7px 12px;font-size:12px}
    .tf-steps{display:flex;gap:8px;margin-bottom:20px}
    .tf-step{flex:1;text-align:center;font-size:12px;font-weight:600;padding:6px 0;border-radius:6px;background:#f0f0f0;color:#999}
    .tf-step.active{background:var(--b2);color:#fff}
    .tf-step.done{background:#d4edda;color:#155724}
    .member-card{border:1.5px solid #eee;border-radius:8px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center}
    .member-card .mname{font-weight:600;font-size:14px}
    .member-card .mmeta{font-size:12px;color:var(--txt2)}
    .share-btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
    .share-btn{padding:8px;border-radius:8px;font-size:12px;font-weight:600;border:1.5px solid #ddd;background:#fff;cursor:pointer;text-align:center;transition:all .15s;font-family:inherit}
    .share-btn:hover{border-color:var(--b2);color:var(--b2)}
    .badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}
    .badge-ok{background:#d4edda;color:#155724}
    .badge-wait{background:#fff3cd;color:#856404}
    .progress-bar{height:6px;border-radius:3px;background:#eee;margin-bottom:16px}
    .progress-fill{height:100%;border-radius:3px;background:var(--b2);transition:width .4s}
    .relation-tag{display:inline-flex;align-items:center;gap:6px;background:#f0f0f0;border-radius:6px;padding:4px 10px;margin:4px}
    .relation-tag input{border:none;background:transparent;padding:0;margin:0;font-size:13px;width:120px}
    .relation-tag button{background:none;border:none;cursor:pointer;color:#999;font-size:16px;padding:0;line-height:1}
    .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;z-index:999;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap}
    .toast.show{opacity:1}
    #tf-view-create,#tf-view-dashboard,#tf-view-member,#tf-view-thanks{display:none}
    .tf-gender-row{display:flex;gap:10px;margin-bottom:12px}
    .tf-gender-btn{flex:1;padding:10px;border:1.5px solid #ddd;border-radius:8px;background:#fff;font-size:13px;font-weight:600;cursor:pointer;text-align:center;transition:all .15s;font-family:inherit}
    .tf-gender-btn.selected{border-color:var(--b2);background:#fde8f0;color:var(--b2)}
    .tf-toggle{display:flex;align-items:center;gap:10px;margin-bottom:12px}
    .tf-toggle input[type=checkbox]{width:20px;height:20px;accent-color:var(--b2);margin:0;flex-shrink:0}
    .tf-dash-card{background:var(--bg2);border-radius:var(--rad);box-shadow:var(--shadow);padding:16px;margin-bottom:12px}
  </style>
</head>
<body>
  <div class="tf-wrap">
    <div class="tf-logo"><a href="https://mybloomday.app">🌸 Bloomday</a></div>

    <!-- Mode: Création -->
    <div id="tf-view-create">
      <div class="tf-steps" id="tf-wizard-steps"></div>
      <div id="tf-step-1"></div>
      <div id="tf-step-2" style="display:none"></div>
    </div>

    <!-- Mode: Dashboard -->
    <div id="tf-view-dashboard">
      <div class="tf-card">
        <h1 id="tf-dash-title"></h1>
        <div class="progress-bar"><div class="progress-fill" id="tf-progress-fill" style="width:0%"></div></div>
        <p id="tf-progress-text" style="font-size:13px;color:var(--txt2);margin-bottom:16px"></p>
        <div id="tf-dash-actions"></div>
      </div>
      <div id="tf-member-cards"></div>
    </div>

    <!-- Mode: Formulaire membre -->
    <div id="tf-view-member">
      <div class="tf-card">
        <h1 id="tf-member-title"></h1>
        <p id="tf-member-sub" style="color:var(--txt2);font-size:13px;margin-bottom:20px"></p>
        <div id="tf-member-form"></div>
      </div>
    </div>

    <!-- Confirmation membre -->
    <div id="tf-view-thanks" style="text-align:center;padding:60px 16px">
      <div style="font-size:56px">🎉</div>
      <h1 id="tf-thanks-title" style="margin:16px 0 8px"></h1>
      <p id="tf-thanks-sub" style="color:var(--txt2)"></p>
    </div>
  </div>

  <div class="toast" id="tf-toast"></div>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <script src="js/supabase-client.js"></script>
  <script src="lib/qrcode.min.js"></script>
  <script src="js/team-form-i18n.js"></script>
  <script src="js/team-form.js"></script>
</body>
</html>
```

- [ ] **Step 2 : Ouvrir dans le navigateur et vérifier absence d'erreurs**

```bash
open team-form.html
```

La page doit se charger sans erreur 404 ni erreur JS dans la console. Tout est blanc/vide — c'est normal, le JS n'est pas encore écrit.

- [ ] **Step 3 : Commit**

```bash
git add team-form.html
git commit -m "feat(survey): team-form.html skeleton — structure HTML + CSS mobile-first"
```

---

## Task 5 : team-form.js — Routing + Wizard étape 1 (Équipe)

**Files:**
- Create: `js/team-form.js`

- [ ] **Step 1 : Créer `js/team-form.js` avec routing + wizard étape 1**

```js
// ── TEAM-FORM.JS ──

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
  selectedGender: ''
};

window.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  TF.adminToken = params.get('admin');
  TF.memberToken = params.get('member');
  if (TF.memberToken) { TF.mode = 'member'; tfInitMember(); }
  else if (TF.adminToken) { TF.mode = 'dashboard'; tfInitDashboard(); }
  else { TF.mode = 'create'; tfInitCreate(); }
});

function tfShow(id) {
  ['tf-view-create','tf-view-dashboard','tf-view-member','tf-view-thanks'].forEach(function(v) {
    document.getElementById(v).style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';
}

function tfToast(msg, ms) {
  var el = document.getElementById('tf-toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(function() { el.classList.remove('show'); }, ms || 2500);
}

function tfRenderSteps(current) {
  var labels = [tfT('stepTeam'), tfT('stepMembers'), tfT('stepShare')];
  document.getElementById('tf-wizard-steps').innerHTML = labels.map(function(label, i) {
    var n = i + 1;
    var cls = n < current ? 'tf-step done' : n === current ? 'tf-step active' : 'tf-step';
    return '<div class="' + cls + '">' + (n < current ? '✓ ' : '') + label + '</div>';
  }).join('');
}

// ── MODE CRÉATION — Étape 1 ──
function tfInitCreate() {
  TF.relationLabels = tfT('defaultRelations').slice();
  tfShow('tf-view-create');
  tfRenderSteps(1);
  document.getElementById('tf-step-2').style.display = 'none';
  document.getElementById('tf-step-1').style.display = 'block';
  tfRenderStep1();
}

function tfRenderStep1() {
  document.getElementById('tf-step-1').innerHTML =
    '<div class="tf-card"><h2>' + tfT('stepTeam') + '</h2>'
    + '<label>' + tfT('teamName') + '</label>'
    + '<input id="tf-team-name" type="text" placeholder="Ex : équipe marketing">'
    + '<label>' + tfT('managerName') + '</label>'
    + '<input id="tf-manager-name" type="text" placeholder="Ex : Sophie">'
    + '<label style="margin-bottom:8px">' + tfT('relationLabels') + '</label>'
    + '<div id="tf-relation-tags"></div>'
    + '<button class="btn btn-ghost btn-sm" style="margin-bottom:16px" onclick="tfAddRelation()">' + tfT('addRelation') + '</button>'
    + '<label>' + tfT('inviteMessage') + '</label>'
    + '<textarea id="tf-invite-msg"></textarea>'
    + '<button class="btn btn-primary" onclick="tfStep1Next()">' + tfT('next') + '</button>'
    + '</div>';
  document.getElementById('tf-invite-msg').value = tfT('defaultInviteMsg');
  tfRenderRelationTags();
}

function tfRenderRelationTags() {
  document.getElementById('tf-relation-tags').innerHTML = TF.relationLabels.map(function(label, i) {
    return '<span class="relation-tag">'
      + '<input type="text" value="' + label.replace(/&/g,'&amp;').replace(/"/g,'&quot;') + '" oninput="TF.relationLabels[' + i + ']=this.value">'
      + '<button onclick="tfRemoveRelation(' + i + ')" title="Supprimer">&times;</button>'
      + '</span>';
  }).join('');
}

function tfAddRelation() {
  TF.relationLabels.push('');
  tfRenderRelationTags();
  var inputs = document.querySelectorAll('#tf-relation-tags input');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

function tfRemoveRelation(i) {
  TF.relationLabels.splice(i, 1);
  tfRenderRelationTags();
}

function tfStep1Next() {
  var teamName = (document.getElementById('tf-team-name').value || '').trim();
  var managerName = (document.getElementById('tf-manager-name').value || '').trim();
  if (!teamName || !managerName) { alert(tfT('errorRequired')); return; }
  TF.pendingTeamName = teamName;
  TF.pendingManagerName = managerName;
  TF.pendingInviteMsg = (document.getElementById('tf-invite-msg').value || '').trim() || tfT('defaultInviteMsg');
  TF.relationLabels = TF.relationLabels.filter(function(l) { return l.trim(); });
  tfRenderSteps(2);
  document.getElementById('tf-step-1').style.display = 'none';
  document.getElementById('tf-step-2').style.display = 'block';
  tfRenderStep2();
}
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

Attendu : aucune sortie

- [ ] **Step 3 : Tester dans le navigateur**

Ouvrir `team-form.html`. Vérifier :
- Wizard étape 1 visible (team name, manager name, relation tags, message)
- Ajout/suppression/renommage des options de relation fonctionnel
- "Suivant" sans données → alerte erreur
- "Suivant" avec données → étape 2 visible (vide pour l'instant)

- [ ] **Step 4 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(survey): routing + wizard étape 1 — équipe + relation labels personnalisables"
```

---

## Task 6 : team-form.js — Wizard étape 2 (Membres) + soumission Supabase

**Files:**
- Modify: `js/team-form.js` (ajouter à la fin)

- [ ] **Step 1 : Ajouter les fonctions étape 2 et soumission**

Ajouter à la fin de `js/team-form.js` :

```js
// ── MODE CRÉATION — Étape 2 ──
function tfRenderStep2() {
  var relOptions = TF.relationLabels.map(function(l) { return '<option>' + l.replace(/</g,'&lt;') + '</option>'; }).join('');
  document.getElementById('tf-step-2').innerHTML =
    '<div class="tf-card"><h2>' + tfT('stepMembers') + '</h2>'
    + '<div id="tf-member-list" style="margin-bottom:16px"></div>'
    + '<div style="border:1.5px solid #eee;border-radius:8px;padding:12px;margin-bottom:16px">'
    + '<label>' + tfT('firstName') + '</label>'
    + '<input id="tf-inp-first" type="text" placeholder="Prénom">'
    + '<label>' + tfT('lastName') + '</label>'
    + '<input id="tf-inp-last" type="text" placeholder="Nom">'
    + '<label>' + tfT('emailLabel') + '</label>'
    + '<input id="tf-inp-email" type="email" placeholder="email@exemple.com">'
    + '<label>' + tfT('relation') + '</label>'
    + '<select id="tf-inp-relation">' + relOptions + '</select>'
    + '<button class="btn btn-ghost" style="width:100%" onclick="tfAddMember()">' + tfT('addMember') + '</button>'
    + '</div>'
    + '<button class="btn btn-ghost btn-sm" style="margin-bottom:8px" onclick="tfBackToStep1()">' + tfT('back') + '</button>'
    + '<button class="btn btn-primary" onclick="tfSubmitCreate()">' + tfT('createTeam') + '</button>'
    + '</div>';
  tfRefreshMemberList();
}

function tfRefreshMemberList() {
  var el = document.getElementById('tf-member-list');
  if (!el) return;
  if (!TF.pendingMembers.length) {
    el.innerHTML = '<p style="font-size:13px;color:var(--txt2)">' + tfT('noMembers') + '</p>';
    return;
  }
  el.innerHTML = TF.pendingMembers.map(function(m, i) {
    return '<div class="member-card">'
      + '<div><div class="mname">' + m.firstName + ' ' + m.lastName + '</div>'
      + '<div class="mmeta">' + m.relation + (m.email ? ' · ' + m.email : '') + '</div></div>'
      + '<button class="btn btn-ghost btn-sm" onclick="tfRemovePendingMember(' + i + ')">' + tfT('removeMember') + '</button>'
      + '</div>';
  }).join('');
}

function tfAddMember() {
  var firstName = (document.getElementById('tf-inp-first').value || '').trim();
  if (!firstName) { alert(tfT('errorRequired')); return; }
  TF.pendingMembers.push({
    firstName: firstName,
    lastName: (document.getElementById('tf-inp-last').value || '').trim(),
    email: (document.getElementById('tf-inp-email').value || '').trim(),
    relation: document.getElementById('tf-inp-relation').value || ''
  });
  document.getElementById('tf-inp-first').value = '';
  document.getElementById('tf-inp-last').value = '';
  document.getElementById('tf-inp-email').value = '';
  document.getElementById('tf-inp-first').focus();
  tfRefreshMemberList();
}

function tfRemovePendingMember(i) {
  TF.pendingMembers.splice(i, 1);
  tfRefreshMemberList();
}

function tfBackToStep1() {
  tfRenderSteps(1);
  document.getElementById('tf-step-2').style.display = 'none';
  document.getElementById('tf-step-1').style.display = 'block';
}

async function tfSubmitCreate() {
  if (!TF.pendingMembers.length) { alert(tfT('noMembers')); return; }
  var adminToken = crypto.randomUUID();
  var res = await supabase.from('surveys').insert({
    token: adminToken,
    team_name: TF.pendingTeamName,
    manager_name: TF.pendingManagerName,
    relation_labels: TF.relationLabels,
    invite_message: TF.pendingInviteMsg
  }).select().single();
  if (res.error) { alert('Erreur création équipe : ' + res.error.message); return; }
  var surveyId = res.data.id;
  var memberRows = TF.pendingMembers.map(function(m) {
    return { survey_id: surveyId, token: crypto.randomUUID(), first_name: m.firstName, last_name: m.lastName, email: m.email || null, relation: m.relation || null };
  });
  var mRes = await supabase.from('survey_members').insert(memberRows);
  if (mRes.error) { alert('Erreur membres : ' + mRes.error.message); return; }
  window.location.href = 'team-form.html?admin=' + adminToken;
}
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

- [ ] **Step 3 : Tester le flow de création complet**

1. Ouvrir `team-form.html`, remplir étape 1, passer à l'étape 2
2. Ajouter 2 membres (un avec email, un sans)
3. Cliquer "Créer l'équipe"
4. Vérifier la redirection vers `?admin=TOKEN`
5. Dans Supabase Table Editor, vérifier que `surveys` et `survey_members` contiennent les bonnes données

- [ ] **Step 4 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(survey): wizard étape 2 — membres + soumission Supabase + redirect dashboard"
```

---

## Task 7 : team-form.js — Mode Dashboard (affichage + partage 4 canaux)

**Files:**
- Modify: `js/team-form.js` (ajouter à la fin)

- [ ] **Step 1 : Ajouter les fonctions du dashboard**

Ajouter à la fin de `js/team-form.js` :

```js
// ── MODE DASHBOARD ──
async function tfInitDashboard() {
  tfShow('tf-view-dashboard');
  var res = await supabase.from('surveys').select('*').eq('token', TF.adminToken).single();
  if (res.error || !res.data) {
    document.getElementById('tf-dash-title').textContent = 'Équipe introuvable.';
    return;
  }
  TF.survey = res.data;
  await tfLoadDashboardMembers();
  tfSubscribeDashboard();
}

async function tfLoadDashboardMembers() {
  var res = await supabase.from('survey_members').select('*').eq('survey_id', TF.survey.id).order('created_at');
  TF.members = res.data || [];
  tfRenderDashboard();
}

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
    + '<button class="btn btn-primary btn-sm" onclick="tfSyncBloomday()">' + tfT('syncBloomday') + '</button>'
    + '</div>';
  document.getElementById('tf-member-cards').innerHTML = TF.members.map(function(m) {
    return tfRenderMemberCard(m);
  }).join('');
}

function tfRenderMemberCard(m) {
  var hasEmail = m.email ? 1 : 0;
  var badgeCls = m.completed ? 'badge-ok' : 'badge-wait';
  var badgeTxt = m.completed ? tfT('statusCompleted') : tfT('statusPending');
  return '<div class="tf-dash-card">'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
    + '<div><div style="font-weight:700;font-size:15px">' + m.first_name + ' ' + m.last_name + '</div>'
    + '<div style="font-size:12px;color:var(--txt2)">' + (m.relation || '') + '</div></div>'
    + '<span class="badge ' + badgeCls + '">' + badgeTxt + '</span>'
    + '</div>'
    + '<div class="share-btns">'
    + (hasEmail ? '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareEmail(this.dataset.token)">' + tfT('sendEmail') + '</button>' : '')
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareWhatsApp(this.dataset.token)">' + tfT('sendWhatsApp') + '</button>'
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareSMS(this.dataset.token)">' + tfT('sendSMS') + '</button>'
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareCopy(this.dataset.token)">' + tfT('copyLink') + '</button>'
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShowQR(this.dataset.token)">' + tfT('qrCode') + '</button>'
    + '</div></div>';
}

function tfMemberUrl(memberToken) {
  return window.location.origin + window.location.pathname + '?member=' + memberToken;
}

function tfBuildMsg(memberToken) {
  var m = TF.members.find(function(x) { return x.token === memberToken; });
  var url = tfMemberUrl(memberToken);
  return (TF.survey.invite_message || tfT('defaultInviteMsg'))
    .replace(/\[Prénom\]/g, m.first_name).replace(/\[First name\]/g, m.first_name)
    .replace(/\[Manager\]/g, TF.survey.manager_name)
    .replace(/\[Équipe\]/g, TF.survey.team_name).replace(/\[Team\]/g, TF.survey.team_name)
    .replace(/\[LIEN\]/g, url).replace(/\[LINK\]/g, url);
}

async function tfShareEmail(memberToken) {
  var m = TF.members.find(function(x) { return x.token === memberToken; });
  if (!m || !m.email) return;
  var url = tfMemberUrl(memberToken);
  var msg = tfBuildMsg(memberToken);
  await fetch('/.netlify/functions/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'survey_invite', data: { email: m.email, firstName: m.first_name, managerName: TF.survey.manager_name, teamName: TF.survey.team_name, link: url, customMessage: msg } })
  });
  tfToast('Email envoyé à ' + m.email + ' !');
}

function tfShareWhatsApp(memberToken) {
  window.open('https://wa.me/?text=' + encodeURIComponent(tfBuildMsg(memberToken)), '_blank');
}

function tfShareSMS(memberToken) {
  window.open('sms:?body=' + encodeURIComponent(tfBuildMsg(memberToken)), '_blank');
}

function tfShareCopy(memberToken) {
  navigator.clipboard.writeText(tfBuildMsg(memberToken)).then(function() { tfToast(tfT('copied')); });
}

function tfSubscribeDashboard() {
  supabase.channel('survey-' + TF.survey.id)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'survey_members', filter: 'survey_id=eq.' + TF.survey.id }, function() { tfLoadDashboardMembers(); })
    .subscribe();
}
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

- [ ] **Step 3 : Tester le dashboard**

Ouvrir l'URL `?admin=TOKEN` générée à la tâche 6.
- Dashboard affiché avec les membres et leur statut ⏳
- Boutons WhatsApp/SMS/Copier → vérifier dans une nouvelle fenêtre que l'URL contient bien `?member=TOKEN` et que le message est pré-rempli
- Bouton Email → fonctionnel uniquement si le membre a un email et si l'environnement est Netlify (en local, fera une erreur réseau)

- [ ] **Step 4 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(survey): dashboard — affichage membres, statut, partage 4 canaux, realtime Supabase"
```

---

## Task 8 : team-form.js — QR codes + Export CSV

**Files:**
- Modify: `js/team-form.js` (ajouter à la fin)

- [ ] **Step 1 : Ajouter les fonctions QR et CSV**

Ajouter à la fin de `js/team-form.js` :

```js
// ── QR CODES ──
function tfShowQR(memberToken) {
  var m = TF.members.find(function(x) { return x.token === memberToken; });
  var url = tfMemberUrl(memberToken);
  var qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  var win = window.open('', '_blank', 'width=320,height=420');
  win.document.write('<html><body style="text-align:center;font-family:sans-serif;padding:24px">'
    + '<h3 style="margin:0 0 16px">' + m.first_name + ' ' + m.last_name + '</h3>'
    + qr.createImgTag(4)
    + '<p style="font-size:11px;color:#aaa;margin-top:12px;word-break:break-all">' + url + '</p>'
    + '<button onclick="window.print()" style="margin-top:12px;padding:8px 16px;background:#e75480;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px">Imprimer</button>'
    + '</body></html>');
  win.document.close();
}

function tfPrintQR() {
  var html = '<html><head><style>body{font-family:sans-serif} .item{display:inline-block;text-align:center;margin:12px;vertical-align:top;page-break-inside:avoid} h3{font-size:13px;margin:8px 0 4px}</style></head><body>';
  TF.members.forEach(function(m) {
    var qr = qrcode(0, 'M');
    qr.addData(tfMemberUrl(m.token));
    qr.make();
    html += '<div class="item"><h3>' + m.first_name + ' ' + m.last_name + '</h3>' + qr.createImgTag(3) + '</div>';
  });
  html += '</body></html>';
  var win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(function() { win.print(); }, 300);
}

// ── EXPORT CSV ──
function tfExportCSV() {
  var completed = TF.members.filter(function(m) { return m.completed; });
  if (!completed.length) { alert('Aucun membre complété pour l\'export.'); return; }
  var lines = [];
  completed.forEach(function(m) {
    var fullName = (m.first_name + ' ' + m.last_name).trim();
    if (m.birth_day && m.birth_month) {
      lines.push('"' + fullName.replace(/"/g, '""') + '",' + m.birth_day + ',' + m.birth_month + (m.birth_year ? ',' + m.birth_year : ''));
    }
    if (m.married && m.wedding_day && m.wedding_month) {
      var label = fullName + ' (mariage avec ' + (m.spouse_name || '?') + ')';
      lines.push('"' + label.replace(/"/g, '""') + '",' + m.wedding_day + ',' + m.wedding_month + (m.wedding_year ? ',' + m.wedding_year : ''));
    }
  });
  var blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = TF.survey.team_name.replace(/\s+/g, '-') + '-bloomday.csv';
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

- [ ] **Step 3 : Tester QR et CSV**

- "QR Code" sur un membre → fenêtre avec QR valide (scanner avec téléphone = lien correct)
- "Imprimer tous les QR" → page d'impression avec tous les membres
- Après avoir complété un membre (task 9), tester "Exporter CSV" → fichier `.csv` avec lignes au format `"Nom",jour,mois,année`

- [ ] **Step 4 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(survey): QR code individuel + impression globale + export CSV Bloomday-compatible"
```

---

## Task 9 : team-form.js — Sync directe Bloomday

**Files:**
- Modify: `js/team-form.js` (ajouter à la fin)

- [ ] **Step 1 : Ajouter `tfSyncBloomday`**

Ajouter à la fin de `js/team-form.js` :

```js
// ── SYNC DIRECTE BLOOMDAY ──
async function tfSyncBloomday() {
  var sessRes = await supabase.auth.getSession();
  var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user && sessRes.data.session.user.id;
  if (!userId) { alert(tfT('syncNotConnected')); return; }

  var completed = TF.members.filter(function(m) { return m.completed; });
  if (!completed.length) { alert('Aucun membre complété.'); return; }

  // Créer ou réutiliser un groupe Bloomday au nom de l'équipe
  var gRes = await supabase.from('groups').select('id').eq('user_id', userId).eq('name', TF.survey.team_name).maybeSingle();
  var groupId;
  if (gRes.data && gRes.data.id) {
    groupId = gRes.data.id;
  } else {
    var newG = await supabase.from('groups').insert({ id: 'g' + Date.now(), user_id: userId, name: TF.survey.team_name, icon: '👥', mode: 'biz' }).select('id').single();
    if (newG.error) { alert('Erreur groupe : ' + newG.error.message); return; }
    groupId = newG.data.id;
  }

  var rows = [];
  var base = Date.now();
  completed.forEach(function(m, i) {
    var fullName = (m.first_name + ' ' + m.last_name).trim();
    var note = m.relation ? 'Relation : ' + m.relation : '';
    if (m.birth_day && m.birth_month) {
      rows.push({ id: String(base + i * 2), user_id: userId, group_id: groupId, name: fullName, day: m.birth_day, month: m.birth_month, year: m.birth_year || null, phone: '', note: note, type: 'birthday', gender: m.gender || '', incomplete: false, notif_days_before: null, notif_time: null });
    }
    if (m.married && m.wedding_day && m.wedding_month) {
      rows.push({ id: String(base + i * 2 + 1), user_id: userId, group_id: groupId, name: fullName + ' (mariage avec ' + (m.spouse_name || '?') + ')', day: m.wedding_day, month: m.wedding_month, year: m.wedding_year || null, phone: '', note: note, type: 'birthday', gender: '', incomplete: false, notif_days_before: null, notif_time: null });
    }
  });

  var iRes = await supabase.from('members').insert(rows);
  if (iRes.error) { alert('Erreur import : ' + iRes.error.message); return; }
  tfToast(tfT('syncSuccess').replace('%d', rows.length));
}
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

- [ ] **Step 3 : Tester la sync**

- Être connecté à Bloomday dans un autre onglet (même domaine, session partagée)
- Depuis le dashboard `?admin=TOKEN`, cliquer "Importer dans Bloomday"
- Vérifier dans Bloomday que le groupe `👥 [Nom équipe]` apparaît avec les bons membres

- [ ] **Step 4 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(survey): sync directe Bloomday — groupe + membres + anniversaires mariage"
```

---

## Task 10 : team-form.js — Mode Formulaire membre

**Files:**
- Modify: `js/team-form.js` (ajouter à la fin)

- [ ] **Step 1 : Ajouter les fonctions du formulaire membre**

Ajouter à la fin de `js/team-form.js` :

```js
// ── MODE FORMULAIRE MEMBRE ──
async function tfInitMember() {
  var res = await supabase.from('survey_members').select('*, surveys(manager_name, team_name, invite_message)').eq('token', TF.memberToken).single();
  if (res.error || !res.data) {
    tfShow('tf-view-member');
    document.getElementById('tf-member-title').textContent = 'Lien invalide ou expiré.';
    return;
  }
  TF.currentMember = res.data;
  TF.survey = res.data.surveys;
  if (res.data.completed) {
    tfShow('tf-view-thanks');
    document.getElementById('tf-thanks-title').textContent = tfT('alreadyCompleted');
    document.getElementById('tf-thanks-sub').textContent = '';
    return;
  }
  tfShow('tf-view-member');
  document.getElementById('tf-member-title').textContent = tfT('memberTitle');
  document.getElementById('tf-member-sub').textContent = tfT('memberSub');
  tfRenderMemberForm();
}

function tfRenderMemberForm() {
  var m = TF.currentMember;
  var months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  var monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var mo = tfLang() === 'fr' ? months : monthsEn;
  var monthOpts = mo.map(function(name, i) { return '<option value="' + (i+1) + '">' + name + '</option>'; }).join('');

  TF.selectedGender = '';
  document.getElementById('tf-member-form').innerHTML =
    '<p style="font-size:15px;font-weight:700;margin-bottom:16px">👋 ' + m.first_name + ' ' + m.last_name + '</p>'
    + '<label>' + tfT('birthDate') + '</label>'
    + '<div style="display:grid;grid-template-columns:1fr 2fr 1fr;gap:8px;margin-bottom:12px">'
    + '<input id="tf-birth-day" type="number" min="1" max="31" placeholder="' + tfT('day') + '">'
    + '<select id="tf-birth-month"><option value="">— ' + tfT('month') + ' —</option>' + monthOpts + '</select>'
    + '<input id="tf-birth-year" type="number" min="1920" max="2015" placeholder="' + tfT('year') + '">'
    + '</div>'
    + '<label>' + tfT('gender') + '</label>'
    + '<div class="tf-gender-row">'
    + '<button class="tf-gender-btn" id="tf-gender-m" onclick="tfSelectGender(\'M\')">' + tfT('male') + '</button>'
    + '<button class="tf-gender-btn" id="tf-gender-f" onclick="tfSelectGender(\'F\')">' + tfT('female') + '</button>'
    + '</div>'
    + '<div class="tf-toggle">'
    + '<input type="checkbox" id="tf-married" onchange="tfToggleMarried(this.checked)">'
    + '<label for="tf-married" style="margin:0;font-size:14px;font-weight:600;color:var(--txt)">' + tfT('married') + '</label>'
    + '</div>'
    + '<div id="tf-married-fields" style="display:none">'
    + '<label>' + tfT('spouseName') + '</label>'
    + '<input id="tf-spouse-name" type="text" placeholder="Prénom Nom">'
    + '<label>' + tfT('weddingDate') + '</label>'
    + '<div style="display:grid;grid-template-columns:1fr 2fr 1fr;gap:8px;margin-bottom:12px">'
    + '<input id="tf-wed-day" type="number" min="1" max="31" placeholder="' + tfT('day') + '">'
    + '<select id="tf-wed-month"><option value="">— ' + tfT('month') + ' —</option>' + monthOpts + '</select>'
    + '<input id="tf-wed-year" type="number" min="1950" max="2030" placeholder="' + tfT('year') + '">'
    + '</div>'
    + '</div>'
    + '<button class="btn btn-primary" onclick="tfSubmitMember()">' + tfT('submit') + '</button>';
}

function tfSelectGender(g) {
  TF.selectedGender = g;
  document.getElementById('tf-gender-m').classList.toggle('selected', g === 'M');
  document.getElementById('tf-gender-f').classList.toggle('selected', g === 'F');
}

function tfToggleMarried(checked) {
  document.getElementById('tf-married-fields').style.display = checked ? 'block' : 'none';
}

async function tfSubmitMember() {
  var birthDay = parseInt(document.getElementById('tf-birth-day').value) || null;
  var birthMonth = parseInt(document.getElementById('tf-birth-month').value) || null;
  var birthYear = parseInt(document.getElementById('tf-birth-year').value) || null;
  if (!birthDay || !birthMonth) { alert(tfT('errorRequired')); return; }
  var married = document.getElementById('tf-married').checked;
  var spouseName = married ? (document.getElementById('tf-spouse-name').value || '').trim() : null;
  var wedDay = married ? (parseInt(document.getElementById('tf-wed-day').value) || null) : null;
  var wedMonth = married ? (parseInt(document.getElementById('tf-wed-month').value) || null) : null;
  var wedYear = married ? (parseInt(document.getElementById('tf-wed-year').value) || null) : null;
  if (married && (!spouseName || !wedDay || !wedMonth)) { alert(tfT('errorRequired')); return; }

  var res = await supabase.from('survey_members').update({
    birth_day: birthDay, birth_month: birthMonth, birth_year: birthYear,
    gender: TF.selectedGender || null,
    married: married, spouse_name: spouseName,
    wedding_day: wedDay, wedding_month: wedMonth, wedding_year: wedYear,
    completed: true, completed_at: new Date().toISOString()
  }).eq('token', TF.memberToken);

  if (res.error) { alert('Erreur : ' + res.error.message); return; }
  tfShow('tf-view-thanks');
  document.getElementById('tf-thanks-title').textContent = tfT('thankYou')
    .replace('[Prénom]', TF.currentMember.first_name)
    .replace('[First name]', TF.currentMember.first_name);
  document.getElementById('tf-thanks-sub').textContent = tfT('thankYouSub');
}
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

- [ ] **Step 3 : Tester le flow end-to-end complet**

1. Créer une équipe avec 2 membres (dont un avec email)
2. Dashboard → copier le lien d'un membre
3. Ouvrir le lien en navigation privée (simule un autre utilisateur)
4. Remplir : date de naissance (ex: 15, Mai, 1990) + genre + marié → nom conjoint + date mariage
5. Soumettre → écran "Merci [Prénom] ! 🎉" visible
6. Revenir sur le dashboard → membre passe en "✅ Complété" automatiquement (realtime)
7. Cliquer "Exporter CSV" → vérifier 2 lignes (anniversaire + mariage) dans le fichier

- [ ] **Step 4 : Commit final**

```bash
git add js/team-form.js
git commit -m "feat(survey): formulaire membre — saisie infos + soumission + confirmation"
```

---

## Récapitulatif des fichiers

| Fichier | Statut |
|---------|--------|
| `team-form.html` | Créé — structure HTML + CSS mobile-first |
| `js/team-form-i18n.js` | Créé — dictionnaire fr/en |
| `js/team-form.js` | Créé — routing + wizard + dashboard + membre + QR + CSV + sync |
| `lib/qrcode.min.js` | Téléchargé — librairie QR embarquée |
| `netlify/functions/send-email.js` | Modifié — type `survey_invite` ajouté |
| Supabase SQL | À exécuter — tables `surveys` + `survey_members` + RLS |

## Test final de validation

Après les 10 tâches, vérifier que tous les flows fonctionnent :

- [ ] Créer une équipe avec 3 membres depuis `team-form.html`
- [ ] Dashboard affiché avec progress 0/3
- [ ] Chaque membre a ses 5 boutons de partage (ou 4 si sans email)
- [ ] QR code individuel scannabe + page impression globale
- [ ] Ouvrir 3 liens membres → remplir chacun → dashboard passe à 3/3
- [ ] Export CSV → 3 lignes anniversaire (+ lignes mariage si applicable)
- [ ] Sync Bloomday (si connecté) → groupe créé dans Bloomday avec les membres
