# Team-Form — Redesign Layout Dashboard

**Date :** 2026-06-09
**Scope :** team-form.html, js/team-form.js, styles inline dans team-form.html

---

## Objectif

Restructurer la page Team-Form pour offrir un layout plus ergonomique sur desktop (deux colonnes) et améliorer la lisibilité mobile. Trois changements principaux :

1. **Topbar** : ajouter l'avatar utilisateur à droite avec menu déroulant
2. **Dashboard admin** : layout deux colonnes sticky (formulaire gauche, membres droite)
3. **Étape 2 création** : même layout deux colonnes pour cohérence

---

## 1. Topbar

### Existant
`tf-topbar-right` est un `<div>` vide de 80px servant d'équilibreur visuel.

### Nouveau comportement

Un cercle avatar de 32px est rendu dans `tf-topbar-right` :

- **Photo de profil** : si l'utilisateur a une session Supabase active avec `user.user_metadata.avatar_url`, afficher l'image dans le cercle.
- **Initiales (fallback)** : si pas de photo, afficher les initiales du manager de l'équipe active (`TF.survey.manager_name`), ou les initiales du premier team enregistré en localStorage, ou l'icône utilisateur générique si aucun contexte disponible.
- **Fond** : dégradé `--grad` pour les initiales ; transparent pour la photo.

### Menu déroulant au clic

Le clic sur l'avatar ouvre un menu `position: absolute; right: 0; top: 44px` contenant :
- Nom du manager (ou email utilisateur si session active)
- Email utilisateur (si session active)
- Lien "Ouvrir Bloomday" → `https://mybloomday.app`

Le menu se ferme via `document.addEventListener('click', ...)` en vérifiant que le clic est hors du composant. Il n'utilise pas les modals existants (`tf-modal-qr`, `tf-modal-delete`).

### Implémentation

Nouvelle fonction `tfRenderTopbarAvatar()` appelée à la fin de chaque `tfInit*()`. Elle injecte dans `tf-topbar-right`.

---

## 2. Dashboard Admin — Layout deux colonnes

### Wrapper global

`.tf-wrap` reste mais son `max-width` passe de `540px` à `1200px` **uniquement** pour la vue dashboard. Les autres vues (création, membre, thanks, teams) gardent `max-width: 540px` via une classe sur `body` ou via overrides CSS sur `#tf-view-dashboard`.

Approche retenue : ajouter `class="tf-dashboard-active"` sur `body` quand on est en mode dashboard, retirer sur les autres vues. CSS cible `.tf-dashboard-active .tf-wrap { max-width: 1200px }`.

### Structure HTML du dashboard

`#tf-view-dashboard` passe à :

```html
<div id="tf-view-dashboard">
  <div id="tf-dash-left">
    <!-- Titre équipe + barre progression + actions globales -->
    <div class="tf-card" id="tf-dash-header-card">...</div>
    <!-- Formulaire Ajouter un membre (toujours visible) -->
    <div class="tf-card" id="tf-dash-form-card">...</div>
  </div>
  <div id="tf-dash-right">
    <!-- Cards membres -->
    <div id="tf-member-cards"></div>
  </div>
</div>
```

### CSS desktop (≥ 768px)

```css
#tf-view-dashboard {
  display: grid;
  grid-template-columns: 40% 60%;
  gap: 24px;
  align-items: start;
}
#tf-dash-left {
  position: sticky;
  top: 72px; /* hauteur topbar ~60px + 12px marge */
}
```

### CSS mobile (< 768px)

```css
@media (max-width: 767px) {
  #tf-view-dashboard {
    display: block;
  }
  #tf-dash-left {
    position: static;
  }
}
```

Sur mobile, `#tf-dash-left` apparaît en premier dans le DOM (formulaire en haut), `#tf-dash-right` (membres) en dessous. Quand l'utilisateur clique "Ajouter un membre" depuis un bouton contextuel dans les cards (s'il existe), appel `document.getElementById('tf-dash-left').scrollIntoView({ behavior: 'smooth' })`.

### Contenu colonne gauche (`tf-dash-left`)

**Carte header** (`.tf-card` id `tf-dash-header-card`) :
- Titre équipe (`🌸 NomÉquipe`)
- Barre de progression
- Texte progression (`X/Y complétés`)
- Boutons d'actions globales : Imprimer QR, Exporter CSV, Tout importer dans Bloomday, Nouvelle équipe

**Carte formulaire** (`.tf-card` id `tf-dash-form-card`) :
- Titre `h2` : "Ajouter un membre"
- Champs : Prénom *, Nom, Email, Relation (select)
- Bouton `btn-primary` : "Ajouter"

Le formulaire est **toujours visible** sur desktop — suppression du toggle `tfToggleAddMember()` en mode dashboard. La fonction reste pour compatibilité mais n'est plus appelée dans `tfRenderDashboard()`.

### Contenu colonne droite (`tf-dash-right`)

Les cards membres existantes via `tfRenderMemberCard(m)` — contenu inchangé (nom, badge statut, détails si complété, boutons WhatsApp / SMS / Copier / QR / Importer).

`#tf-member-cards` est déplacé dans `#tf-dash-right`.
`#tf-add-member-inline` est supprimé du HTML (remplacé par `#tf-dash-form-card` permanent dans la colonne gauche).

---

## 3. Étape 2 Création — Layout deux colonnes

Même principe que le dashboard appliqué à `#tf-step-2` lors de la création initiale d'une équipe.

### Structure

```
Gauche 40% (sticky) :          Droite 60% :
┌────────────────────┐         ┌──────────────────────────┐
│  Ajouter un membre │         │  Membres en attente       │
│  Prénom *          │         │  ┌── Jean Dupont ───────┐ │
│  [_____________]   │         │  │  Resp. Célébrations  │ │
│  Nom               │         │  │  [Supprimer]         │ │
│  [_____________]   │         │  └─────────────────────┘ │
│  Email             │         │                           │
│  [_____________]   │         │  ┌── Marie Martin ─────┐ │
│  Relation          │         │  │  RH                  │ │
│  [_____________]   │         │  │  [Supprimer]         │ │
│  [ Ajouter ]       │         │  └─────────────────────┘ │
└────────────────────┘         └──────────────────────────┘
Boutons Retour / Créer l'équipe : sous le grid, pleine largeur
```

Classe `tf-create-step2-active` sur `body` pour le max-width override.

Les boutons "Retour" et "Créer l'équipe" sont placés **sous le grid** en pleine largeur (hors des deux colonnes), dans une `<div>` séparée.

---

## 4. Vues inchangées

- **Vue "Mes équipes"** : colonne unique 540px, topbar reçoit l'avatar.
- **Étape 1 création** : colonne unique 540px.
- **Vue membre** (formulaire du membre) : colonne unique 540px.
- **Vue confirmation** (`tf-view-thanks`) : inchangée.
- **Modals** (`tf-modal-qr`, `tf-modal-delete`) : inchangées.

---

## 5. Contraintes techniques

- Vanilla JS ES6+, pas de bundler — tout le CSS reste inline dans `team-form.html` dans le bloc `<style>`.
- La topbar est `position: sticky; top: 0; z-index: 50` — la colonne gauche doit avoir `top: 72px` pour ne pas passer sous la topbar.
- `node --check js/team-form.js` doit passer après chaque modification JS.
- Toutes les strings visibles passent par `tfT()` — les nouveaux labels du menu avatar doivent être ajoutés dans `js/team-form-i18n.js`.

---

## 6. Nouvelles clés i18n requises

À ajouter dans `js/team-form-i18n.js` pour les 2 langues actuelles (fr/en) du fichier :

| Clé | FR | EN |
|-----|----|----|
| `openBloomday` | Ouvrir Bloomday | Open Bloomday |
| `profileMenu` | Mon compte | My account |

---

## Résumé des fichiers modifiés

| Fichier | Modifications |
|---------|--------------|
| `team-form.html` | Styles CSS deux colonnes, structure HTML dashboard et step-2 |
| `js/team-form.js` | `tfRenderTopbarAvatar()`, `tfRenderDashboard()` restructuré, `tfRenderStep2()` restructuré, suppression `tf-add-member-inline` toggle |
| `js/team-form-i18n.js` | Ajout clés `openBloomday`, `profileMenu` |
