# Calendrier latéral enrichi — Spec

**Date :** 2026-06-02  
**Fichiers impactés :** `js/render.js`

---

## Contexte

Le panneau droit desktop (`#desktop-right-panel`) affiche un mini-calendrier mensuel suivi d'une liste des 5 prochains anniversaires sur 30 jours. L'utilisateur souhaite deux améliorations :

1. Navigation plus rapide — pouvoir sauter d'une année directement
2. Voir les fêtes nationales / culturelles du mois affiché, mêlées aux anniversaires

---

## Feature 1 — Navigation calendrier à deux rangées

### Comportement actuel
En-tête sur une ligne : `‹ Juin 2026 ›` — navigation mois uniquement.

### Nouveau comportement
Deux rangées :

```
‹‹  2026  ››      ← rangée année  (±1 an)
 ‹  Juin   ›      ← rangée mois  (±1 mois)
```

- `‹‹` / `››` décrémente / incrémente `sideCal.year` de 1 (le mois reste inchangé)
- `‹` / `›` décrémente / incrémente `sideCal.month` avec wrap 0↔11 et ajustement de `sideCal.year` (comportement identique à l'actuel)
- Les deux rangées appellent `renderSideCalendar()` après la mise à jour

### Style
Même style de bouton que l'existant (`background:var(--bg2);border:1px solid var(--brd);border-radius:6px`). L'année est affichée en petit (`font-size:10px`) et en couleur `var(--b1d)` au-dessus du nom du mois (`font-size:13px;font-weight:700`), centrés ensemble.

---

## Feature 2 — Marqueurs de fêtes sur la grille

### Comportement actuel
Seuls les jours avec des anniversaires ont un fond orange (`background:var(--b2l);color:var(--b2d)`).

### Nouveau comportement
Calculer la liste des fêtes du mois affiché via `getFetesForMonth(sideCal.year, sideCal.month)` (voir Feature 3).

Trois cas pour chaque cellule :

| Condition | Rendu |
|-----------|-------|
| Anniversaire seulement | fond orange (inchangé) |
| Fête seulement | fond `#1c3330`, texte `#5dbfaa` |
| Anniversaire **et** fête | fond orange (prioritaire) + pseudo-élément point teal `4×4px` en bas à droite |

Le point teal est un `<span>` absolu positionné dans la cellule (pas de pseudo-CSS car le DOM est construit en JS).

---

## Feature 3 — Panneau mensuel mixte (remplace "Prochains anniversaires")

### Comportement actuel
Section "Prochains anniversaires" : jusqu'à 5 contacts dont l'anniversaire tombe dans les 30 prochains jours, triés par `daysTill()`.

### Nouveau comportement
Section **"Ce mois"** : tous les événements du mois affiché (`sideCal.month + 1`), anniversaires + fêtes du profil, triés par jour du mois.

**Anniversaires du mois :** membres dont `p.month === sideCal.month + 1`, affichés avec tag `anniv` (badge orange).

**Fêtes du mois :** résultat d'une nouvelle fonction locale `getFetesForMonth(year, month)` définie dans `renderSideCalendar()`. Elle reprend la logique de filtrage de `getActiveFetes()` (profil : `live`, `origin`, `origin2`, `religion`) mais sans filtrer les dates passées — elle retourne toutes les fêtes dont `f.m === month + 1` pour l'année donnée. `getActiveFetes()` existante n'est pas modifiée (elle sert ailleurs pour les fêtes à venir). Affichées avec tag `fête` (badge teal).

**Tri :** par `d` (jour du mois) croissant. En cas d'égalité (même jour), les anniversaires passent en premier.

**Ligne de rendu pour chaque événement :**
```
[jour/mois]  [icône + nom]  [tag]
```
- Largeur date : `min-width:28px`, `font-size:10px`, couleur `var(--b1d)`
- Nom : `font-size:11px`, flex:1
- Tag `anniv` : `background:#3d2a1a; color:#e8944a; border-radius:3px; font-size:9px; padding:1px 5px`
- Tag `fête` : `background:#1c3330; color:#5dbfaa; border-radius:3px; font-size:9px; padding:1px 5px`

**Titre de section :** `t('thisMonth')` — clé i18n à ajouter dans les 7 langues.

**État vide :** si aucun événement dans le mois, afficher un message `t('noEventsThisMonth')`.

---

## i18n — Clés à ajouter

| Clé | fr | en | es | ar | hi | zh | pt |
|-----|----|----|----|----|----|----|-----|
| `thisMonth` | Ce mois | This month | Este mes | هذا الشهر | इस महीने | 本月 | Este mês |
| `noEventsThisMonth` | Aucun événement ce mois | No events this month | Sin eventos este mes | لا أحداث هذا الشهر | इस महीने कोई कार्यक्रम नहीं | 本月无活动 | Sem eventos este mês |
| `tagHoliday` | fête | holiday | festivo | عطلة | त्योहार | 节日 | feriado |
| `tagBirthday` | anniv | bday | cumple | عيد ميلاد | जन्मदिन | 生日 | aniversário |

---

## Fichiers modifiés

- `js/render.js` — fonction `renderSideCalendar()` uniquement
- `js/i18n.js` — 4 nouvelles clés × 7 langues

## Fichiers non modifiés

- `js/data.js`, `js/helpers.js`, `js/core.js`, `js/features.js`, `index.html`, `css/app.css` — aucune modification nécessaire

---

## Hors scope

- Clic sur une fête dans la liste (pas d'action pour l'instant)
- Affichage mobile (le panneau droit est desktop uniquement)
- Limite du nombre de fêtes affichées (toutes les fêtes du mois sont affichées)
