# Spec — Co-admin Share Sheet & Swipe Fix

**Date :** 2026-06-11
**Périmètre :** `team-form.html`, `js/team-form.js`, `js/i18n.js`

---

## Contexte

Deux problèmes remontés sur le dashboard team-form :

1. **Bug swipe** : le panneau rouge "Retirer" (`.tf-dash-card-del`) est visible avant tout geste de swipe. Cause : `position:absolute; right:0` le place dans la zone visible dès le rendu initial, par-dessus le contenu de la carte.

2. **UX co-admin invite** : deux boutons séparés ("Inviter par email" + "Copier le lien") aboutissent à partager une URL brute sur WhatsApp — peu professionnel. L'utilisateur veut une expérience share sheet unifiée.

---

## Fix 1 — Correction du bug swipe

### Problème exact

```
.tf-dash-card         → position:relative; overflow:hidden
  .tf-dash-swipe-inner → translateX(0)  ← contenu normal
  .tf-dash-card-del    → position:absolute; right:0  ← toujours visible !
```

Le `.tf-dash-card-del` est superposé au bord droit de la carte dès le premier rendu.

### Solution : Flex track

Remplacer l'approche `position:absolute` par un "flex track" qui dépasse la largeur de la carte :

```
.tf-dash-card         → overflow:hidden (inchangé)
  .tf-dash-swipe-track → display:flex; width:calc(100% + 80px); transform:translateX(0)
    .tf-dash-swipe-inner → flex:1; min-width:0
    .tf-dash-card-del    → width:80px; flex-shrink:0 (position:static)
```

- Par défaut : le track est à `translateX(0)`, le panneau rouge est hors de la zone visible (débordement clippé par `overflow:hidden` de la carte).
- Sur swipe gauche : `translateX(-80px)` sur le track → révèle le bouton rouge.
- La JS swipe existante (lignes ~1162–1235 de `team-form.js`) doit cibler `.tf-dash-swipe-track` au lieu de `.tf-dash-swipe-inner`.
- Sur desktop (>600px) : le panneau rouge reste masqué via `display:none` (media query existante, inchangée).

### Ce qui ne change pas

- Le bouton `×` (`.tf-remove-btn`) dans l'en-tête de carte reste tel quel — visible partout.
- Le comportement de suppression (modal de confirmation) est inchangé.
- La media query `@media(min-width:600px){ .tf-dash-card-del { display:none } }` reste.

---

## Fix 2 — Co-admin invite : share sheet

### État actuel

Dans `tfLoadCoAdminSection()`, quand aucun co-admin n'est actif :

```js
'<button onclick="tfOpenCoAdminInviteEmail()">Inviter par email</button>'
'<button onclick="tfCopyCoAdminLink(token)">Copier le lien</button>'
```

### Nouvelle UX

**Trigger :** Un seul bouton gradient "Inviter un co-admin" (style identique aux autres CTA primaires de l'app).

**Résultat :** Un bottom sheet (modale) monte depuis le bas avec 4 options en grille 2×2.

#### Structure du bottom sheet

```
[ Handle pill ]
Inviter un co-admin           ← titre Playfair Display
Choisis comment partager      ← sous-titre gris

[ WhatsApp ]  [ SMS      ]
[ Email    ]  [ Copier   ]

[ Annuler ]
```

#### Comportement de chaque option

| Option | Action |
|--------|--------|
| **WhatsApp** | `window.open('https://wa.me/?text=' + encodeURIComponent(msg + '\n' + url))` |
| **SMS** | `window.open('sms:?body=' + encodeURIComponent(msg + '\n' + url))` |
| **Email** | Ferme le sheet → ouvre `tfOpenCoAdminInviteEmail()` (modal existant) |
| **Copier le lien** | `navigator.clipboard.writeText(url)` + toast existant |

#### Message automatique (WhatsApp & SMS)

```
[managerName] t'invite à co-gérer l'équipe [teamName] sur Bloomday 🌸
[URL]
```

Le message utilise `TF.survey.manager_name` et `TF.survey.team_name`. Pas de personnalisation demandée par l'utilisateur — message fixe, pas d'étape intermédiaire.

#### Fermeture du sheet

- Tap sur "Annuler" → ferme
- Tap sur l'overlay (fond semi-transparent) → ferme
- Sélection d'une option → ferme + action

### HTML à ajouter

Nouveau modal `tf-modal-coadmin-share` dans `team-form.html` (à côté des modals existants) :

```html
<div id="tf-modal-coadmin-share" style="display:none" class="tf-modal-overlay" onclick="tfCloseCoAdminShareSheet(event)">
  <div class="tf-sheet-inner" onclick="event.stopPropagation()">
    <div class="tf-sheet-handle"></div>
    <h2 data-i18n="tfInviteCoAdmin"></h2>
    <p data-i18n="tfInviteCoAdminSub"></p>
    <div class="tf-share-grid">
      <button onclick="tfShareCoAdminWhatsApp()">…WhatsApp…</button>
      <button onclick="tfShareCoAdminSMS()">…SMS…</button>
      <button onclick="tfShareCoAdminEmail()">…Email…</button>
      <button onclick="tfShareCoAdminCopy()">…Copier…</button>
    </div>
    <button onclick="tfCloseCoAdminShareSheet()" data-i18n="cancelAdd"></button>
  </div>
</div>
```

### Nouvelles clés i18n (7 langues)

| Clé | FR | EN |
|-----|----|----|
| `tfInviteCoAdmin` | Inviter un co-admin | Invite a co-admin |
| `tfInviteCoAdminSub` | Choisis comment partager le lien | Choose how to share the link |
| `tfShareViaWhatsApp` | WhatsApp | WhatsApp |
| `tfShareViaSMS` | SMS | SMS |
| `tfShareViaEmail` | Email | Email |
| `tfShareViaCopy` | Copier le lien | Copy link |
| `tfCoAdminMsg` | t'invite à co-gérer l'équipe | invites you to co-manage the team |

(Les 5 autres langues : es, ar, hi, zh, pt — à compléter avec traductions équivalentes.)

### Nouvelles fonctions JS

```js
function tfOpenCoAdminShareSheet()          // stocke le token, affiche le modal
function tfCloseCoAdminShareSheet(e)        // ferme (vérifie overlay vs inner)
function tfShareCoAdminWhatsApp()           // ouvre wa.me avec message
function tfShareCoAdminSMS()               // ouvre sms: avec message
function tfShareCoAdminEmail()             // ferme sheet + ouvre modal email
function tfShareCoAdminCopy()              // clipboard + toast
```

`TF` reçoit une propriété temporaire `TF._coAdminShareToken` pendant l'ouverture du sheet (nettoyée à la fermeture).

### `tfLoadCoAdminSection()` — diff

```js
// AVANT
'<button onclick="tfOpenCoAdminInviteEmail()">…</button>'
'<button onclick="tfCopyCoAdminLink(token)">…</button>'

// APRÈS
'<button class="btn btn-primary" onclick="tfOpenCoAdminShareSheet(\'' + tfEsc(token) + '\')">'
+ tfT('tfInviteCoAdmin')
+ '</button>'
```

---

## CSS à ajouter / modifier

### Modification — Fix swipe

Dans `team-form.html` (balise `<style>`) :

```css
/* Avant */
.tf-dash-swipe-inner { transform: translateX(0); transition: transform .25s ease; will-change: transform }
.tf-dash-card-del { position: absolute; right: 0; top: 0; bottom: 0; width: 80px; … }

/* Après */
.tf-dash-swipe-track { display: flex; width: calc(100% + 80px); transform: translateX(0); transition: transform .25s ease; will-change: transform }
.tf-dash-swipe-inner { flex: 1; min-width: 0; }
.tf-dash-card-del { width: 80px; flex-shrink: 0; background: #c0392b; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; user-select: none; }
```

### Ajout — Bottom sheet

```css
.tf-sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-end; z-index: 200; }
.tf-sheet-inner { width: 100%; background: #fff; border-radius: 24px 24px 0 0; padding: 12px 20px 40px; }
.tf-sheet-handle { width: 36px; height: 4px; background: #ddd; border-radius: 2px; margin: 0 auto 16px; }
.tf-share-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0; }
.tf-share-tile { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 8px; border-radius: 14px; border: 1.5px solid var(--brd); background: var(--bg); cursor: pointer; }
.tf-share-tile-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.tf-share-tile-label { font-size: 12px; font-weight: 600; }
```

---

## Périmètre hors-spec

- Pas de changement au modal email existant (`tf-modal-coadmin-invite`) ni à `tfSendCoAdminInvite()`.
- Pas de changement au flow de révocation co-admin.
- Pas de changement au comportement de suppression membre (modal de confirmation existant).
- L'option "QR Code" n'est pas ajoutée au share sheet co-admin (non demandée).
