# Co-admin Share Sheet & Swipe Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger le bug d'affichage du panneau "Retirer" sur les fiches membres, et remplacer les deux boutons co-admin par un unique share sheet natif (WhatsApp / SMS / Email / Copier).

**Architecture:** Trois fichiers touchés — `team-form.html` (CSS + HTML modal), `js/team-form.js` (logique swipe + share sheet), `js/team-form-i18n.js` (nouvelles clés). Pas de nouveau fichier créé. Pas de dépendance externe ajoutée.

**Tech Stack:** Vanilla JS ES6+, CSS custom properties, HTML5. Pas de bundler. Syntaxe vérifiable via `node --check`.

---

## Fichiers modifiés

| Fichier | Rôle |
|---------|------|
| `team-form.html` | Lignes 57-62 (CSS swipe) + ligne 70 (liste modals) + ligne 168 (HTML share sheet) + CSS `.tf-share-tile` |
| `js/team-form.js` | `tfRenderMemberCard()` lignes ~593-614 (structure HTML track) + `tfInitSwipe()` + `tfCloseRemoveModal()` (cibles swipe) + `tfLoadCoAdminSection()` + nouvelles fonctions co-admin |
| `js/team-form-i18n.js` | Nouvelles clés fr/en dans les deux objets |

---

## Task 1 — Corriger le CSS du swipe

**Fichiers :**
- Modifier : `team-form.html:57-62`

Le bug : `.tf-dash-card-del` est en `position:absolute;right:0` donc visible dès le rendu initial.
Correction : remplacer par un flex track de `calc(100% + 80px)` de large, clippé par `overflow:hidden` de la carte parente.

- [ ] **Étape 1 : Remplacer les règles CSS swipe dans `team-form.html`**

Ligne 58 actuelle :
```
.tf-dash-swipe-inner{transform:translateX(0);transition:transform .25s ease;will-change:transform}
```
Ligne 59 actuelle :
```
.tf-dash-card-del{position:absolute;right:0;top:0;bottom:0;width:80px;background:#c0392b;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;cursor:pointer;border-radius:0 var(--rad) var(--rad) 0;user-select:none}
```

Remplacer ces deux lignes par :
```css
.tf-dash-swipe-track{display:flex;width:calc(100% + 80px);transform:translateX(0);transition:transform .25s ease;will-change:transform}
.tf-dash-swipe-inner{flex:1;min-width:0}
.tf-dash-card-del{width:80px;flex-shrink:0;background:#c0392b;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;cursor:pointer;user-select:none}
```

- [ ] **Étape 2 : Vérifier la syntaxe HTML**

```bash
node --check js/team-form.js
```
Résultat attendu : aucune sortie (syntaxe OK).

- [ ] **Étape 3 : Commit**

```bash
git add team-form.html
git commit -m "fix(swipe): replace absolute positioning with flex track to hide delete panel by default"
```

---

## Task 2 — Corriger la structure HTML + le JS du swipe

**Fichiers :**
- Modifier : `js/team-form.js` — `tfRenderMemberCard()` (~ligne 593), `tfInitSwipe()` (~ligne 1210), `tfCloseRemoveModal()` (~ligne 1162)

Le rendu de la carte doit envelopper le contenu et le bouton "Retirer" dans un `.tf-dash-swipe-track`. Le JS de swipe doit cibler ce track au lieu de `.tf-dash-swipe-inner`.

- [ ] **Étape 1 : Modifier `tfRenderMemberCard()` — ouvrir le track**

Dans `js/team-form.js`, trouver (autour de la ligne 593) :
```js
  return '<div class="tf-dash-card">'
    + '<div class="tf-dash-swipe-inner">'
```

Remplacer par :
```js
  return '<div class="tf-dash-card">'
    + (TF.isCoadmin ? '' : '<div class="tf-dash-swipe-track">')
    + '<div class="tf-dash-swipe-inner">'
```

- [ ] **Étape 2 : Modifier `tfRenderMemberCard()` — fermer le track**

Dans `js/team-form.js`, trouver (autour de la ligne 612-614) :
```js
    + '</div>'
    + (TF.isCoadmin ? '' : '<div class="tf-dash-card-del" data-token="' + m.token + '" data-name="' + fullName + '" onclick="tfOpenRemoveModal(this.dataset.token,this.dataset.name)">' + tfT('tfRemoveMemberBtn') + '</div>')
    + '</div>';
```

Remplacer par :
```js
    + '</div>'
    + (TF.isCoadmin ? '' : '<div class="tf-dash-card-del" data-token="' + m.token + '" data-name="' + fullName + '" onclick="tfOpenRemoveModal(this.dataset.token,this.dataset.name)">' + tfT('tfRemoveMemberBtn') + '</div>')
    + (TF.isCoadmin ? '' : '</div>')
    + '</div>';
```

- [ ] **Étape 3 : Mettre à jour `tfInitSwipe()` — cibler le track**

Dans `tfInitSwipe()` (~ligne 1218), remplacer les 3 occurrences de `.tf-dash-swipe-inner` par `.tf-dash-swipe-track` :

Trouver (3 fois dans cette fonction) :
```js
var inner = card.querySelector('.tf-dash-swipe-inner');
```
```js
document.querySelectorAll('#tf-member-cards .tf-dash-swipe-inner').forEach(function(other) {
```

Remplacer chaque occurrence :
```js
var inner = card.querySelector('.tf-dash-swipe-track');
```
```js
document.querySelectorAll('#tf-member-cards .tf-dash-swipe-track').forEach(function(other) {
```

- [ ] **Étape 4 : Mettre à jour `tfCloseRemoveModal()` — cibler le track**

Dans `tfCloseRemoveModal()` (~ligne 1162), trouver :
```js
  document.querySelectorAll('.tf-dash-swipe-inner').forEach(function(el) {
    el.style.transform = 'translateX(0)';
  });
```

Remplacer par :
```js
  document.querySelectorAll('.tf-dash-swipe-track').forEach(function(el) {
    el.style.transform = 'translateX(0)';
  });
```

- [ ] **Étape 5 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```
Résultat attendu : aucune sortie.

- [ ] **Étape 6 : Test rapide navigateur**

Ouvrir `team-form.html` (ou `https://mybloomday.app/team-form.html`) en admin avec des membres.
- Vérifier que **le panneau rouge n'est plus visible** au chargement initial.
- Swiper une carte vers la gauche sur mobile → le panneau rouge doit apparaître.
- Cliquer "Retirer" → la modal de confirmation s'ouvre.

- [ ] **Étape 7 : Commit**

```bash
git add js/team-form.js
git commit -m "fix(swipe): wrap card in swipe-track so delete panel is hidden before gesture"
```

---

## Task 3 — Ajouter les clés i18n

**Fichiers :**
- Modifier : `js/team-form-i18n.js`

Le fichier a deux blocs : `fr` (lignes ~2-80) et `en` (lignes ~81-169). Ajouter les nouvelles clés dans chaque bloc juste avant la fermeture `openBloomday`.

- [ ] **Étape 1 : Ajouter les clés dans le bloc `fr`**

Dans `js/team-form-i18n.js`, trouver (bloc fr, vers la fin) :
```js
    openBloomday: 'Ouvrir Bloomday',
    profileMenu: 'Mon compte'
  },
  en: {
```

Remplacer par :
```js
    openBloomday: 'Ouvrir Bloomday',
    profileMenu: 'Mon compte',
    tfInviteCoAdmin: 'Inviter un co-admin',
    tfInviteCoAdminSub: 'Choisis comment partager le lien',
    tfShareViaWhatsApp: 'WhatsApp',
    tfShareViaSMS: 'SMS',
    tfShareViaEmail: 'Email',
    tfShareViaCopy: 'Copier le lien',
    tfCoAdminMsg: 't\'invite à co-gérer l\'équipe'
  },
  en: {
```

- [ ] **Étape 2 : Ajouter les clés dans le bloc `en`**

Dans `js/team-form-i18n.js`, trouver (bloc en, vers la fin) :
```js
    openBloomday: 'Open Bloomday',
    profileMenu: 'My account'
  }
};
```

Remplacer par :
```js
    openBloomday: 'Open Bloomday',
    profileMenu: 'My account',
    tfInviteCoAdmin: 'Invite a co-admin',
    tfInviteCoAdminSub: 'Choose how to share the link',
    tfShareViaWhatsApp: 'WhatsApp',
    tfShareViaSMS: 'SMS',
    tfShareViaEmail: 'Email',
    tfShareViaCopy: 'Copy link',
    tfCoAdminMsg: 'invites you to co-manage the team'
  }
};
```

- [ ] **Étape 3 : Vérifier la syntaxe**

```bash
node --check js/team-form-i18n.js
```
Résultat attendu : aucune sortie.

- [ ] **Étape 4 : Commit**

```bash
git add js/team-form-i18n.js
git commit -m "feat(i18n): add co-admin share sheet keys (fr/en)"
```

---

## Task 4 — Ajouter le modal share sheet (HTML + CSS)

**Fichiers :**
- Modifier : `team-form.html` — ligne 70 (CSS selector modals), après ligne 168 (HTML modal), dans `<style>` (CSS `.tf-share-tile`)

- [ ] **Étape 1 : Ajouter `tf-modal-coadmin-share` à la liste CSS des modals**

Dans `team-form.html`, ligne 70, trouver :
```
#tf-modal-qr,#tf-modal-delete,#tf-modal-remove,#tf-modal-coadmin,#tf-modal-coadmin-invite{position:fixed;inset:0;background:rgba(45,27,20,.6);z-index:100;align-items:center;justify-content:center;padding:20px}
```

Remplacer par :
```
#tf-modal-qr,#tf-modal-delete,#tf-modal-remove,#tf-modal-coadmin,#tf-modal-coadmin-invite{position:fixed;inset:0;background:rgba(45,27,20,.6);z-index:100;align-items:center;justify-content:center;padding:20px}
    #tf-modal-coadmin-share{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:none;align-items:flex-end}
```

- [ ] **Étape 2 : Ajouter la CSS `.tf-share-tile` dans le bloc `<style>`**

Dans `team-form.html`, dans le bloc `<style>`, ajouter après la ligne `.tf-remove-btn{...}` (ou avant la fermeture `</style>`) :

```css
    .tf-share-tile{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 8px;border-radius:14px;border:1.5px solid var(--brd);background:var(--bg);cursor:pointer;font-size:12px;font-weight:600;color:var(--txt);font-family:inherit;transition:background .15s}
    .tf-share-tile:active{background:var(--bg2)}
```

- [ ] **Étape 3 : Ajouter le HTML du modal après `tf-modal-coadmin-invite`**

Dans `team-form.html`, trouver la ligne 168 :
```html
  <div id="tf-modal-coadmin-invite" style="display:none">
    <div class="tf-modal-inner" id="tf-modal-coadmin-invite-inner"></div>
```

Après cette ligne (après le `</div>` fermant le modal coadmin-invite), ajouter :
```html
  <div id="tf-modal-coadmin-share" onclick="tfCloseCoAdminShareSheet()">
    <div style="width:100%;background:#fff;border-radius:24px 24px 0 0;padding:12px 20px 40px;box-shadow:0 -8px 32px rgba(0,0,0,.15)" onclick="event.stopPropagation()">
      <div style="width:36px;height:4px;background:#ddd;border-radius:2px;margin:0 auto 16px"></div>
      <h2 id="tf-sheet-title" style="font-family:'Playfair Display',serif;font-size:17px;font-weight:800;text-align:center;margin-bottom:4px"></h2>
      <p id="tf-sheet-sub" style="font-size:12px;color:var(--txt3);text-align:center;margin-bottom:16px"></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        <button class="tf-share-tile" onclick="tfShareCoAdminWhatsApp()">
          <div style="width:44px;height:44px;border-radius:12px;background:#25D366;display:flex;align-items:center;justify-content:center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.1-1.34C8.48 21.53 10.2 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.08 13.71c-.21.59-1.22 1.13-1.69 1.2-.43.06-.98.09-1.58-.1-.36-.12-.83-.27-1.43-.53-2.5-1.08-4.13-3.6-4.26-3.77-.13-.17-1.04-1.38-1.04-2.64 0-1.26.66-1.88.9-2.14.23-.25.51-.31.68-.31.17 0 .34 0 .49.01.16.01.37-.06.58.44.21.51.73 1.77.79 1.9.07.13.11.28.02.45-.09.17-.13.28-.26.43-.13.15-.27.34-.39.46-.13.13-.26.27-.11.52.15.25.66 1.09 1.42 1.76.98.87 1.8 1.14 2.05 1.27.25.13.4.11.54-.07.15-.18.62-.72.79-.97.17-.25.34-.21.57-.13.23.09 1.46.69 1.71.81.25.13.42.19.48.3.07.11.07.63-.14 1.22z"/></svg>
          </div>
          <span id="tf-share-wa-label"></span>
        </button>
        <button class="tf-share-tile" onclick="tfShareCoAdminSMS()">
          <div style="width:44px;height:44px;border-radius:12px;background:#007AFF;display:flex;align-items:center;justify-content:center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
          </div>
          <span id="tf-share-sms-label"></span>
        </button>
        <button class="tf-share-tile" onclick="tfShareCoAdminEmail()">
          <div style="width:44px;height:44px;border-radius:12px;background:#E8916A;display:flex;align-items:center;justify-content:center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </div>
          <span id="tf-share-email-label"></span>
        </button>
        <button class="tf-share-tile" onclick="tfShareCoAdminCopy()">
          <div style="width:44px;height:44px;border-radius:12px;background:#8E8E93;display:flex;align-items:center;justify-content:center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          </div>
          <span id="tf-share-copy-label"></span>
        </button>
      </div>
      <button class="btn btn-ghost" id="tf-sheet-cancel-btn" style="width:100%" onclick="tfCloseCoAdminShareSheet()"></button>
    </div>
  </div>
```

- [ ] **Étape 4 : Vérifier syntaxe (le HTML n'a pas de node --check — vérification visuelle)**

Ouvrir `team-form.html` dans un éditeur et confirmer que toutes les balises sont fermées correctement.

- [ ] **Étape 5 : Commit**

```bash
git add team-form.html
git commit -m "feat(ui): add co-admin share sheet HTML modal and CSS"
```

---

## Task 5 — Ajouter les fonctions JS du share sheet + mettre à jour `tfLoadCoAdminSection`

**Fichiers :**
- Modifier : `js/team-form.js`

- [ ] **Étape 1 : Ajouter `_coAdminShareToken` à l'objet `TF`**

Dans `js/team-form.js`, trouver l'objet `TF` (autour de la ligne 10-20). Il contient des propriétés comme `coadminToken`, `isCoadmin`, etc. Ajouter à la fin de l'objet, avant le `}` fermant :

```js
  _coAdminShareToken: null,
```

- [ ] **Étape 2 : Ajouter les nouvelles fonctions co-admin share**

Dans `js/team-form.js`, trouver la fonction `tfCopyCoAdminLink` (~ligne 1314). Ajouter juste **après** cette fonction (et sa fermeture `}`) le bloc suivant :

```js
function tfOpenCoAdminShareSheet(coAdminToken) {
  TF._coAdminShareToken = coAdminToken;
  var el = document.getElementById('tf-modal-coadmin-share');
  if (!el) return;
  document.getElementById('tf-sheet-title').textContent = tfT('tfInviteCoAdmin');
  document.getElementById('tf-sheet-sub').textContent = tfT('tfInviteCoAdminSub');
  document.getElementById('tf-share-wa-label').textContent = tfT('tfShareViaWhatsApp');
  document.getElementById('tf-share-sms-label').textContent = tfT('tfShareViaSMS');
  document.getElementById('tf-share-email-label').textContent = tfT('tfShareViaEmail');
  document.getElementById('tf-share-copy-label').textContent = tfT('tfShareViaCopy');
  document.getElementById('tf-sheet-cancel-btn').textContent = tfT('cancelAdd');
  el.style.display = 'flex';
}

function tfCloseCoAdminShareSheet() {
  var el = document.getElementById('tf-modal-coadmin-share');
  if (el) el.style.display = 'none';
  TF._coAdminShareToken = null;
}

function tfShareCoAdminWhatsApp() {
  var url = window.location.origin + window.location.pathname + '?coadmin=' + encodeURIComponent(TF._coAdminShareToken);
  var msg = (TF.survey.manager_name || '') + ' ' + tfT('tfCoAdminMsg') + ' ' + (TF.survey.team_name || '') + ' 🌸\n' + url;
  window.open('https://wa.me/?text=' + encodeURIComponent(msg));
  tfCloseCoAdminShareSheet();
}

function tfShareCoAdminSMS() {
  var url = window.location.origin + window.location.pathname + '?coadmin=' + encodeURIComponent(TF._coAdminShareToken);
  var msg = (TF.survey.manager_name || '') + ' ' + tfT('tfCoAdminMsg') + ' ' + (TF.survey.team_name || '') + ' 🌸\n' + url;
  window.open('sms:?body=' + encodeURIComponent(msg));
  tfCloseCoAdminShareSheet();
}

function tfShareCoAdminEmail() {
  tfCloseCoAdminShareSheet();
  tfOpenCoAdminInviteEmail();
}

async function tfShareCoAdminCopy() {
  var url = window.location.origin + window.location.pathname + '?coadmin=' + encodeURIComponent(TF._coAdminShareToken);
  try {
    await navigator.clipboard.writeText(url);
    tfToast(tfT('tfLinkCopied'));
  } catch(e) {
    prompt(tfLang() === 'fr' ? 'Copiez ce lien :' : 'Copy this link:', url);
  }
  tfCloseCoAdminShareSheet();
}
```

- [ ] **Étape 3 : Mettre à jour `tfLoadCoAdminSection()` — branche sans co-admin**

Dans `js/team-form.js`, dans `tfLoadCoAdminSection()` (~ligne 1251), trouver :
```js
    el.innerHTML = '<div style="font-size:13px;color:var(--txt3);margin-bottom:10px">' + tfT('tfNoCoAdmin') + '</div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
      + '<button class="btn btn-ghost btn-sm" onclick="tfOpenCoAdminInviteEmail()">' + tfT('tfInviteByEmail') + '</button>'
      + '<button class="btn btn-ghost btn-sm" onclick="tfCopyCoAdminLink(\'' + tfEsc(info.co_admin_token) + '\')">' + tfT('tfCopyCoAdminLink') + '</button>'
      + '</div>';
```

Remplacer par :
```js
    el.innerHTML = '<div style="font-size:13px;color:var(--txt3);margin-bottom:10px">' + tfT('tfNoCoAdmin') + '</div>'
      + '<button class="btn btn-primary" style="width:100%" onclick="tfOpenCoAdminShareSheet(\'' + tfEsc(info.co_admin_token) + '\')">' + tfT('tfInviteCoAdmin') + '</button>';
```

- [ ] **Étape 4 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```
Résultat attendu : aucune sortie.

- [ ] **Étape 5 : Test navigateur — share sheet**

Ouvrir `team-form.html` en tant qu'admin sans co-admin actif :
1. Vérifier que la section co-admin affiche **un seul bouton** "Inviter un co-admin" (gradient).
2. Cliquer ce bouton → le bottom sheet monte avec les 4 tuiles.
3. Cliquer "Copier le lien" → toast "Lien copié !" apparaît, sheet se ferme.
4. Rouvrir → cliquer "WhatsApp" → `wa.me` s'ouvre avec un message pré-rempli contenant le lien.
5. Rouvrir → cliquer "SMS" → `sms:` s'ouvre avec le message pré-rempli.
6. Rouvrir → cliquer "Email" → le modal email existant s'ouvre (champ email).
7. Tapper sur l'overlay (fond sombre) → le sheet se ferme.
8. Tapper "Annuler" → le sheet se ferme.

- [ ] **Étape 6 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(coadmin): add share sheet (WhatsApp/SMS/Email/Copy) replacing two-button invite UI"
```

---

## Test final de non-régression

- [ ] Ouvrir le dashboard admin avec des membres → confirmer que le panneau rouge n'est pas visible.
- [ ] Sur mobile : swiper une carte → panneau rouge apparaît correctement.
- [ ] Supprimer un membre via le × → modal de confirmation.
- [ ] Supprimer un membre via swipe + "Retirer" → modal de confirmation.
- [ ] Avec un co-admin actif : vérifier que la section co-admin affiche toujours le bouton "Révoquer" (pas le share sheet).
- [ ] En mode co-admin (`?coadmin=...`) : vérifier qu'aucun bouton × ni panneau "Retirer" n'apparaît.
