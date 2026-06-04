# Team Form — Améliorations UX — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Améliorer l'UX de team-form : QR code en modal, persistance localStorage, ajout de membres depuis le dashboard, et message d'invitation corrigé.

**Architecture:** Modifications purement frontend (team-form.html, team-form.js, team-form-i18n.js) + une nouvelle migration SQL pour le RPC `tf_add_member`. Aucun bundler — JS global, ES6+ natif.

**Tech Stack:** Vanilla JS ES6+, HTML/CSS inline, Supabase JS SDK (RPC), localStorage API, lib/qrcode.min.js

---

## Fichiers modifiés

| Fichier | Rôle |
|---|---|
| `supabase/migrations/20260604120000_tf_add_member.sql` | Nouveau RPC SECURITY DEFINER pour ajouter un membre à une équipe existante |
| `js/team-form-i18n.js` | Message d'invitation corrigé (tu/vous, saut de ligne, signature) + 3 nouvelles clés |
| `team-form.html` | Modal QR (HTML + CSS) + div `#tf-add-member-form` |
| `js/team-form.js` | `tfShowQR` → modal ; `tfCloseQRModal` ; localStorage dans `DOMContentLoaded` et `tfSubmitCreate` ; `tfNewTeam` ; `tfShowAddMemberForm` / `tfHideAddMemberForm` / `tfSubmitAddMember` ; mise à jour `tfRenderDashboard` |

---

## Task 1 : Migration SQL — RPC tf_add_member

**Files:**
- Create: `supabase/migrations/20260604120000_tf_add_member.sql`

- [ ] **Créer le fichier de migration**

```sql
-- Ajoute un membre à une équipe existante, validé par l'admin token.
-- Retourne le membre créé (row_to_json) ou NULL si token invalide.
CREATE OR REPLACE FUNCTION tf_add_member(
  p_admin_token text,
  p_member      jsonb
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_survey_id uuid;
BEGIN
  SELECT id INTO v_survey_id FROM surveys WHERE token = p_admin_token LIMIT 1;
  IF v_survey_id IS NULL THEN RETURN NULL; END IF;

  INSERT INTO survey_members (survey_id, token, first_name, last_name, email, relation)
  VALUES (
    v_survey_id,
    gen_random_uuid()::text,
    p_member->>'first_name',
    p_member->>'last_name',
    NULLIF(p_member->>'email', ''),
    NULLIF(p_member->>'relation', '')
  );

  RETURN (
    SELECT row_to_json(m)
    FROM survey_members m
    WHERE m.survey_id = v_survey_id
    ORDER BY m.created_at DESC
    LIMIT 1
  );
END;
$$;

GRANT EXECUTE ON FUNCTION tf_add_member(text, jsonb) TO anon;
```

- [ ] **Exécuter dans Supabase**

Ouvrir le dashboard Supabase → SQL Editor → coller le contenu du fichier → Run.
Vérifier que la réponse est `Success. No rows returned.`

- [ ] **Commit**

```bash
git add supabase/migrations/20260604120000_tf_add_member.sql
git commit -m "feat(db): ajouter RPC tf_add_member pour ajout de membres post-création"
```

---

## Task 2 : Corriger le message d'invitation (i18n)

**Files:**
- Modify: `js/team-form-i18n.js`

- [ ] **Remplacer `defaultInviteMsg` FR et EN, ajouter 3 nouvelles clés**

Dans `js/team-form-i18n.js`, remplacer la ligne `defaultInviteMsg` du bloc `fr:` :

```js
defaultInviteMsg: 'Bonjour [Prénom] !\n[Manager] t\'invite à compléter ton profil pour l\'équipe [Équipe]. Ça prend 2 minutes et ça permettra de ne jamais rater tes moments importants 🎂\n👉 [LIEN]\n\n— L\'équipe Bloomday 🌸',
```

Remplacer la ligne `defaultInviteMsg` du bloc `en:` :

```js
defaultInviteMsg: 'Hi [First name]!\n[Manager] is inviting you to complete your profile for the [Team] team. Takes 2 minutes and will make sure no one ever misses your important moments 🎂\n👉 [LINK]\n\n— The Bloomday Team 🌸',
```

Ajouter ces 3 clés dans le bloc `fr:` (après la clé `syncNotConnected`) :

```js
addMemberDash: '+ Ajouter un membre',
newTeam: 'Nouvelle équipe',
cancelAdd: 'Annuler',
```

Ajouter ces 3 clés dans le bloc `en:` (après la clé `syncNotConnected`) :

```js
addMemberDash: '+ Add a member',
newTeam: 'New team',
cancelAdd: 'Cancel',
```

- [ ] **Vérifier la syntaxe**

```bash
node --check js/team-form-i18n.js
```

Attendu : aucune sortie (pas d'erreur).

- [ ] **Commit**

```bash
git add js/team-form-i18n.js
git commit -m "fix(i18n): corriger message invitation (tu/vous, saut de ligne, signature Bloomday)"
```

---

## Task 3 : Modal QR code

**Files:**
- Modify: `team-form.html`
- Modify: `js/team-form.js`

- [ ] **Ajouter le CSS de la modal dans `<style>` de `team-form.html`**

Ajouter avant la balise fermante `</style>` :

```css
#tf-modal-qr{position:fixed;inset:0;background:rgba(45,27,20,.6);z-index:100;align-items:center;justify-content:center;padding:20px}
.tf-modal-inner{background:var(--bg2);border-radius:var(--rad);padding:24px;max-width:300px;width:100%;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.3)}
@media print{body>*{display:none!important}#tf-modal-qr{display:flex!important;position:static;background:none;padding:0}}
```

- [ ] **Ajouter le HTML de la modal dans `team-form.html`**

Juste avant `<div class="toast" id="tf-toast">`, ajouter :

```html
<div id="tf-modal-qr" style="display:none">
  <div class="tf-modal-inner">
    <div style="display:flex;justify-content:flex-end;margin-bottom:4px">
      <button onclick="tfCloseQRModal()" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--txt3);line-height:1;padding:0">✕</button>
    </div>
    <div id="tf-modal-qr-name" style="font-family:'Playfair Display',serif;font-size:18px;font-weight:800;margin-bottom:16px"></div>
    <div id="tf-modal-qr-code" style="display:flex;justify-content:center;margin-bottom:12px"></div>
    <div id="tf-modal-qr-url" style="font-size:11px;color:var(--txt3);word-break:break-all;margin-bottom:16px"></div>
    <button onclick="window.print()" class="btn btn-primary">Imprimer</button>
  </div>
</div>
```

- [ ] **Remplacer `tfShowQR` et ajouter `tfCloseQRModal` dans `js/team-form.js`**

Remplacer la fonction `tfShowQR` existante (lignes 306–320) par :

```js
function tfShowQR(memberToken) {
  var m = TF.members.find(function(x) { return x.token === memberToken; });
  var url = tfMemberUrl(memberToken);
  document.getElementById('tf-modal-qr-name').textContent = m.first_name + ' ' + m.last_name;
  document.getElementById('tf-modal-qr-url').textContent = url;
  var container = document.getElementById('tf-modal-qr-code');
  container.innerHTML = '';
  var qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  container.innerHTML = qr.createImgTag(6);
  document.getElementById('tf-modal-qr').style.display = 'flex';
}

function tfCloseQRModal() {
  document.getElementById('tf-modal-qr').style.display = 'none';
}
```

- [ ] **Vérifier la syntaxe JS**

```bash
node --check js/team-form.js
```

Attendu : aucune sortie.

- [ ] **Tester manuellement**

Ouvrir `team-form.html?admin=<token>` dans le navigateur.
Cliquer sur "QR Code" d'un membre → la modal s'ouvre sur la même page, QR grand et centré, bouton ✕ ferme la modal.

- [ ] **Commit**

```bash
git add team-form.html js/team-form.js
git commit -m "feat(qr): afficher le QR code dans une modal overlay au lieu d'une popup"
```

---

## Task 4 : Persistance localStorage

**Files:**
- Modify: `js/team-form.js`

- [ ] **Mettre à jour `DOMContentLoaded` pour vérifier localStorage**

Remplacer le bloc `window.addEventListener('DOMContentLoaded', ...)` existant (lignes 25–33) par :

```js
window.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  TF.adminToken = params.get('admin');
  TF.memberToken = params.get('member');
  TF.prefillManager = params.get('manager') || '';
  if (TF.memberToken) { TF.mode = 'member'; tfInitMember(); }
  else if (TF.adminToken) { TF.mode = 'dashboard'; tfInitDashboard(); }
  else {
    var saved = localStorage.getItem('tf_admin_token');
    if (saved) { window.location.href = 'team-form.html?admin=' + saved; return; }
    TF.mode = 'create'; tfInitCreate();
  }
});
```

- [ ] **Sauvegarder le token dans `tfSubmitCreate` avant la redirection**

Dans `tfSubmitCreate`, remplacer la ligne :

```js
window.location.href = 'team-form.html?admin=' + adminToken;
```

par :

```js
localStorage.setItem('tf_admin_token', adminToken);
window.location.href = 'team-form.html?admin=' + adminToken;
```

- [ ] **Ajouter la fonction `tfNewTeam`** (après `tfRenderDashboard`) :

```js
function tfNewTeam() {
  if (!confirm('Créer une nouvelle équipe ? Tu perdras l\'accès au dashboard actuel depuis ce navigateur.')) return;
  localStorage.removeItem('tf_admin_token');
  window.location.href = 'team-form.html';
}
```

- [ ] **Vérifier la syntaxe JS**

```bash
node --check js/team-form.js
```

Attendu : aucune sortie.

- [ ] **Tester manuellement**

1. Ouvrir `team-form.html` sans paramètre → redirection automatique vers `?admin=TOKEN` si une équipe a déjà été créée.
2. Créer une nouvelle équipe → token sauvegardé, redirection vers le dashboard.
3. (Le bouton "Nouvelle équipe" sera testé en Task 5 une fois `tfRenderDashboard` mis à jour.)

- [ ] **Commit**

```bash
git add js/team-form.js
git commit -m "feat(persistence): sauvegarder admin token en localStorage pour retrouver le dashboard"
```

---

## Task 5 : Ajouter un membre depuis le dashboard

**Files:**
- Modify: `team-form.html`
- Modify: `js/team-form.js`

- [ ] **Ajouter le div `#tf-add-member-form` dans `team-form.html`**

Dans le bloc `<!-- Mode: Dashboard -->`, juste après `<div id="tf-member-cards"></div>`, ajouter :

```html
<div id="tf-add-member-form"></div>
```

- [ ] **Mettre à jour `tfRenderDashboard` pour ajouter les deux nouveaux boutons**

Dans `tfRenderDashboard`, remplacer le contenu de `tf-dash-actions` (le `innerHTML =` existant) par la version finale :

```js
document.getElementById('tf-dash-actions').innerHTML =
  '<div style="display:flex;gap:8px;flex-wrap:wrap">'
  + '<button class="btn btn-ghost btn-sm" onclick="tfPrintQR()">' + tfT('printQR') + '</button>'
  + '<button class="btn btn-ghost btn-sm" onclick="tfExportCSV()">' + tfT('exportCSV') + '</button>'
  + '<button class="btn btn-primary btn-sm" onclick="tfSyncBloomday()">' + tfT('syncBloomday') + '</button>'
  + '</div>'
  + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'
  + '<button class="btn btn-ghost btn-sm" onclick="tfShowAddMemberForm()">' + tfT('addMemberDash') + '</button>'
  + '<button class="btn btn-ghost btn-sm" onclick="tfNewTeam()">' + tfT('newTeam') + '</button>'
  + '</div>';
```

- [ ] **Ajouter les 3 fonctions dans `js/team-form.js`** (après `tfNewTeam`) :

```js
function tfShowAddMemberForm() {
  var relOptions = (TF.survey.relation_labels || []).map(function(l) {
    return '<option>' + tfEsc(l) + '</option>';
  }).join('');
  document.getElementById('tf-add-member-form').innerHTML =
    '<div class="tf-card" style="border:1.5px solid var(--b2)">'
    + '<h2>' + tfT('addMemberDash') + '</h2>'
    + '<label>' + tfT('firstName') + '</label>'
    + '<input id="tf-add-first" type="text" placeholder="Prénom">'
    + '<label>' + tfT('lastName') + '</label>'
    + '<input id="tf-add-last" type="text" placeholder="Nom">'
    + '<label>' + tfT('emailLabel') + '</label>'
    + '<input id="tf-add-email" type="email" placeholder="email@exemple.com">'
    + '<label>' + tfT('relation') + '</label>'
    + '<select id="tf-add-relation">' + relOptions + '</select>'
    + '<div style="display:flex;gap:8px">'
    + '<button class="btn btn-primary" style="flex:1" onclick="tfSubmitAddMember()">' + tfT('addMember') + '</button>'
    + '<button class="btn btn-ghost" onclick="tfHideAddMemberForm()">' + tfT('cancelAdd') + '</button>'
    + '</div></div>';
  document.getElementById('tf-add-first').focus();
}

function tfHideAddMemberForm() {
  document.getElementById('tf-add-member-form').innerHTML = '';
}

async function tfSubmitAddMember() {
  var firstName = (document.getElementById('tf-add-first').value || '').trim();
  if (!firstName) { alert(tfT('errorRequired')); return; }
  var member = {
    first_name: firstName,
    last_name:  (document.getElementById('tf-add-last').value || '').trim(),
    email:      (document.getElementById('tf-add-email').value || '').trim(),
    relation:   document.getElementById('tf-add-relation').value || ''
  };
  var res = await supabase.rpc('tf_add_member', {
    p_admin_token: TF.adminToken,
    p_member:      member
  });
  if (res.error || !res.data) {
    alert('Erreur : ' + (res.error ? res.error.message : 'Membre non ajouté'));
    return;
  }
  TF.members.push(res.data);
  tfHideAddMemberForm();
  tfRenderDashboard();
  tfToast(tfEsc(firstName) + ' ajouté(e) !');
}
```

- [ ] **Vérifier la syntaxe JS**

```bash
node --check js/team-form.js
```

Attendu : aucune sortie.

- [ ] **Tester manuellement**

1. Aller sur un dashboard existant (`team-form.html?admin=TOKEN`).
2. Les boutons "+ Ajouter un membre" et "Nouvelle équipe" apparaissent sur le dashboard.
3. Cliquer "+ Ajouter un membre" → formulaire inline apparaît.
4. Remplir prénom + relation → cliquer "Ajouter →" → toast "X ajouté(e) !", fiche du membre apparaît dans la liste avec ses boutons de partage.
5. Cliquer "Annuler" → formulaire disparaît sans modification.
6. Cliquer "Nouvelle équipe" → confirm → retour au wizard de création.

- [ ] **Commit**

```bash
git add team-form.html js/team-form.js
git commit -m "feat(dashboard): ajouter un membre depuis le dashboard avec formulaire inline"
```

---

## Task 6 : Déploiement

- [ ] **Push et vérification Netlify**

```bash
git push origin main
```

Attendre ~1 minute, puis vérifier que le déploiement est actif :

```bash
curl -s -o /dev/null -w "%{http_code}" https://mybloomday.app/team-form.html
```

Attendu : `200`

- [ ] **Smoke test production**

Ouvrir https://mybloomday.app/team-form.html :
1. Sans paramètre → redirection vers dashboard si token en localStorage (ou wizard si premier usage)
2. Sur le dashboard → cliquer QR Code → modal s'ouvre sur la page
3. Bouton "+ Ajouter un membre" → formulaire inline fonctionne
4. Message d'invitation visible dans le wizard → vérifier saut de ligne et signature "— L'équipe Bloomday 🌸"
