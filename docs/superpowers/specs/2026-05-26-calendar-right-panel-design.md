# Calendrier mensuel interactif — Panneau droit desktop

**Date :** 2026-05-26  
**Scope :** Desktop uniquement (≥1024px) — mobile inchangé  
**Fichiers impactés :** `js/render.js`, `index.html`

---

## Contexte

L'accueil Bloomday affiche déjà un bandeau "Cette semaine" (7 cases) sur mobile, et sur desktop le panneau droit (`desktop-right-panel`) affiche un mini-calendrier mensuel via `renderSideCalendar()` plus une liste des prochains anniversaires. Ce mini-calendrier est statique (mois courant fixe) et le clic sur une personne redirige vers la section Membres.

L'objectif est d'enrichir ce panneau droit desktop en un calendrier mensuel navigable avec accès direct à la fiche de chaque personne, sans quitter la vue.

---

## Périmètre

### Dans le scope
1. Navigation mois par mois (‹ ›) et affichage mois + année dans le panneau droit
2. Grille 7×N avec : aujourd'hui en doré, jours avec anniversaires en rouge/saumon, jours vides neutres
3. Clic sur un jour avec anniversaire → détail du jour (état 2)
4. Détail du jour : carte par personne avec avatar initiales, nom, type, date, compte à rebours + 3 boutons (Modifier / Message / Idée cadeau)
5. Bouton "Modifier" → formulaire d'édition inline dans le panneau (état 3)
6. Sauvegarde → retour calendrier avec flash de confirmation verte (état 4)
7. Boutons "Message" et "Idée cadeau" réutilisent les fonctions existantes (`genMsg`, `genGiftModal`)
8. Fix bug : bouton admin "Voir l'app comme un utilisateur" — texte forcé en `#2D1B14` (sombre) pour être lisible sur le fond desktop crème hardcodé

### Hors scope
- Mobile (bandeau 7j inchangé)
- Navigation par année (← 2025 | 2026 →) — trop rare comme besoin, la navigation mois suffit
- Ajout d'un nouveau membre depuis le calendrier
- Suppression depuis le panneau droit

---

## Architecture

### Variables d'état (globales, dans `render.js`)
```js
var sideCal = { year: now.getFullYear(), month: now.getMonth() }; // mois affiché dans le panneau droit
```
Ces variables persistent pendant la session. Réinitialisées à la date courante à chaque rechargement.

### Fonctions modifiées

#### `renderSideCalendar()` — enrichissement
- Lire `sideCal.year` / `sideCal.month` au lieu de `now.getFullYear()` / `now.getMonth()`
- Ajouter un header `‹ [Mois Année] ›` avec deux boutons qui incrémentent/décrémentent `sideCal.month` (avec wrap year) puis rappellent `renderSideCalendar()`
- Garder exactement la même logique de grille (highlight aujourd'hui, highlight anniversaires)
- `cell.onclick` → `showDayDetails(day, month+1, members)` (inchangé)

#### `showDayDetails(day, month, members)` — enrichissement
- Bouton retour `← [Mois Année]` → `renderSideCalendar()` (inchangé)
- Pour chaque membre : afficher avatar (initiales ou photo), nom, type, date, `daysTill` compteur
- **Ajouter** 3 boutons par carte :
  - `✏ Modifier` → `showMemberEditPanel(p.id, day, month)`
  - `✨ Message` → `genMsg(p.id, 'side-msg-' + p.id)` + un div `id="side-msg-[id]"` sous la carte
  - `💡 Idée` → `genGiftModal(p.id)`
- Supprimer `card.onclick = function(){ togEdit(p.id); showSec('members',1); }` (navigation vers Membres supprimée)

### Nouvelle fonction : `showMemberEditPanel(memberId, backDay, backMonth)`
```
showMemberEditPanel(memberId, backDay, backMonth)
  1. Récupérer le membre depuis mems() par id
  2. Rendre dans el (desktop-right-panel) :
     - Bouton ← "[backDay] [MN[backMonth-1]]" → showDayDetails(backDay, backMonth, members du jour)
     - Titre "✏ Modifier [nom]"
     - Champs : nom (input), jour/mois/année (3 inputs en grid), téléphone (input), notes (textarea), message personnalisé (textarea)
     - Bouton "✓ Sauvegarder" → appelle saveEditPanel(memberId, backDay, backMonth)
     - Bouton "Annuler" → showDayDetails(backDay, backMonth, ...)
```

### Nouvelle fonction : `saveEditPanel(memberId, backDay, backMonth)`
```
saveEditPanel(memberId, backDay, backMonth)
  1. Lire les valeurs des inputs du panneau (même logique que saveEdit())
  2. Valider (nom non vide, jour 1-31, mois 1-12)
  3. Mettre à jour le membre dans le store local + Supabase (réutiliser saveEdit logic)
  4. Rafraîchir : rHome() si section home active
  5. Retour : showDayDetails(backDay, backMonth, membres recalculés du jour)
  6. Flash de confirmation : div vert temporaire en haut du calendrier pendant 2s
```

### Fix bouton admin (`index.html`)
Ligne 329 — ajouter `style="color:#2D1B14;border-color:#C8A850"` au bouton `.btn.fw` "Voir l'app comme un utilisateur" :
```html
<!-- Avant -->
<button class="btn fw" onclick="showSec('home',0)" data-i18n="adminBrowseBtn">…</button>
<!-- Après -->
<button class="btn fw" onclick="showSec('home',0)" data-i18n="adminBrowseBtn" style="color:#2D1B14;border-color:#C8A850">…</button>
```
**Pourquoi :** sur desktop ≥1024px le `body` a un background hardcodé crème (`#FFF8F0→#FFD8B4`). En dark mode OS, `--txt` = `#F5EEE2` (blanc cassé) → texte invisible sur fond crème. Le fix force le texte en sombre indépendamment du thème.

---

## Data flow

```
renderSideCalendar()
  ↓ (clic jour avec anniv)
showDayDetails(day, month, members)
  ↓ (clic "Modifier")
showMemberEditPanel(id, day, month)
  ↓ (clic "Sauvegarder")
saveEditPanel(id, day, month)
  → met à jour store local + Supabase
  → rHome() si visible
  → renderSideCalendar() avec flash vert
```

---

## Gestion des erreurs

- Validation des champs dans `saveEditPanel` : même règles que `saveEdit` existant (jour 1-31, mois 1-12, nom non vide)
- Si Supabase échoue : afficher message d'erreur rouge dans le panneau (inline, pas d'alert)
- Navigation mois : wrapping automatique (décembre → janvier de l'année suivante, janvier → décembre de l'année précédente)

---

## Tests manuels (via `/qa-bloomday`)

1. Sur desktop (≥1024px) : panneau droit affiche calendrier avec navigation ‹ ›
2. Mois avec anniversaire : jour coloré en rouge/saumon dans la grille
3. Clic jour → détail avec carte(s) membre(s) + 3 boutons
4. Clic "Modifier" → formulaire inline
5. Modifier un champ, sauvegarder → flash vert + retour calendrier + données à jour
6. Clic "Annuler" → retour détail du jour sans modification
7. Navigation ‹ Déc 2025 puis › → revient à Jan 2026 (wrap correct)
8. Bouton admin "Voir l'app…" → texte lisible sur fond crème (light + dark OS)
9. Mobile : bandeau 7j inchangé, aucune régression
