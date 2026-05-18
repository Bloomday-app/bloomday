# Spec — Vague 2 : Layout Desktop Responsive + Refonte Page Pricing

**Date :** 2026-05-19  
**Statut :** Validé  
**Périmètre :** CSS responsive desktop + page pricing/forfaits

---

## 1. Contexte

L'application Bloomday est aujourd'hui enfermée dans une colonne de 430px max-width sur tous les écrans, y compris desktop. Sur ordinateur, l'app s'affiche comme un téléphone centré sur la page — l'espace desktop n'est pas exploité. La page pricing affiche des cartes empilées en colonne (format mobile).

Ce spec couvre deux améliorations distinctes mais liées :
1. **Layout desktop 3 colonnes** — une vraie mise en page pour écrans ≥ 1024px
2. **Refonte page pricing** — tableau comparatif complet sur une seule page

---

## 2. Layout Desktop (≥ 1024px)

### Architecture 3 colonnes

```
┌──────┬──────────────────────────┬────────────┐
│Barre │                          │            │
│icônes│   Contenu principal      │  Panneau   │
│64px  │   (vue active)           │  contextuel│
│      │   flex: 1                │  280px     │
└──────┴──────────────────────────┴────────────┘
```

**Breakpoint d'activation :** `min-width: 1024px`  
**Mobile (< 1024px) :** comportement identique à aujourd'hui, aucun changement.

### Sidebar (64px, fixe)

Icônes verticales centrées, sans label :

| Icône | Section | ID actif |
|---|---|---|
| 🏠 | Accueil (calendrier) | `#home` |
| 👥 | Contacts | `#contacts` |
| 🗂️ | Groupes | `#groups` |
| 📅 | Calendrier | `#calendar` |
| 👤 | Profil | `#profile` |

- Icône active : couleur `--b1` (doré), fond `--b1l`
- Hover : fond `rgba(212,168,67,.08)`
- Logo Bloomday en haut de la sidebar (violet `--b4`, pas rose)
- Avatar utilisateur en bas de sidebar (lien vers profil)

### Panneau contextuel droit (280px, fixe)

Le contenu s'adapte selon la vue active :

| Vue active | Panneau affiche |
|---|---|
| Accueil / Calendrier | **Prochains anniversaires** — liste des 7 prochaines célébrations (nom, date relative, icône) avec bouton "Envoyer un message" par entrée |
| Contacts | **Fiche contact** — photo/avatar, nom, date d'anniv, groupe, bouton "Envoyer message IA", bouton "Cadeau IA" |
| Groupes | **Membres du groupe actif** — liste avec avatars, nom, date d'anniv la plus proche |
| Profil / Settings | **Raccourcis** — forfait actuel + bouton upgrade, langue, bouton déconnexion |

- Fond : `var(--card)` avec border-left `1px solid var(--brd)`
- Overflow-y: auto si contenu dépasse
- Animation d'entrée : `fadeIn 0.2s ease` lors du changement de vue

### Contenu principal (flex: 1)

- Le contenu existant occupe tout l'espace central
- La navigation bottom bar (`.nav`) disparaît sur desktop — remplacée par la sidebar
- Le header existant (`.hd`) reste visible en haut du panneau central
- Padding horizontal augmenté : `24px` → `32px` sur desktop

### Implémentation CSS

Ajouter dans `css/app.css` un bloc `@media(min-width:1024px)` qui :
- Passe `.wrap` en `max-width: 100%`, `display: flex`, `flex-direction: row`
- Insère `.desktop-sidebar` (64px, fixe)
- Insère `.desktop-right-panel` (280px, fixe)
- Cache `.nav` (bottom bar mobile)
- Les éléments `.desktop-sidebar` et `.desktop-right-panel` sont présents dans le DOM mais `display:none` sur mobile

---

## 3. Refonte Page Pricing

### Structure générale

**Une seule page, pas d'onglets Perso/Business.** Toutes les formules côte à côte dans un tableau comparatif.

### Hero section

```
[Logo Bloomday]
Célébrez chaque personne qui compte pour vous
Messages IA personnalisés · Idées cadeaux · Fêtes du monde entier

Stats : [140 Pays] [7 Langues] [IA Personnalisé]

🌸 7 jours gratuits · Sans carte bancaire
```

### Tableau comparatif

4 colonnes : Starter / Bloom ⭐ / Business / Enterprise

La colonne **Bloom** est mise en avant : fond doré (`linear-gradient(160deg, #D4A843, #FF8C7A)`), header en couleur, légèrement surélevée visuellement.

**Lignes du tableau :**

| Fonctionnalité | Starter | Bloom | Business | Enterprise |
|---|---|---|---|---|
| Prix | 0€ | 4,99€/mois | 19,99€/mois | Sur devis |
| Membres max | 10 | Illimité | 50 | Illimité |
| Groupes | 1 | 5 | Illimité | Illimité |
| Messages IA/mois | 5 | Illimité | Illimité | Illimité |
| Idées cadeaux IA | ✗ | ✓ | ✓ | ✓ |
| Cartes virtuelles | ✗ | ✓ | ✓ | ✓ |
| Admins de groupe | ✗ | 2 | 5 | Illimité |
| Import CSV | ✗ | ✗ | ✓ | ✓ |
| Marque blanche | ✗ | ✗ | ✗ | ✓ |
| Publicités | Oui | ✗ Aucune | ✗ Aucune | ✗ Aucune |
| **CTA** | Gratuit → | 7j gratuits → | 14j gratuits → | Nous contacter |

**Styling des cellules :**
- `✓` : vert `#18A86B`, bold
- `✗` : gris clair `#e0d5cc`
- Valeur Bloom : fond `#fffbf0`, texte `#c08830`, badge arrondi
- Ligne "Publicités" : Starter en orange `#FF8C7A` (argument de conversion)

### Responsive du tableau

- Desktop : tableau pleine largeur, 4 colonnes visibles
- Mobile : affichage en cartes empilées (fallback — chaque plan = une carte verticale, comportement actuel)

### Implémentation

- La fonction `renderAllPlans()` dans `js/core.js` est remplacée par `renderPricingTable()` qui génère le tableau HTML
- Le HTML dans `index.html` (section `#land`) est mis à jour avec la nouvelle structure
- Les styles du tableau sont ajoutés dans `css/app.css`
- Toutes les strings passent par `t('clé')` — les nouvelles clés sont ajoutées dans les 7 langues de `js/i18n.js`

---

## 4. Fichiers impactés

| Fichier | Modification |
|---|---|
| `css/app.css` | Ajout bloc `@media(min-width:1024px)` pour desktop layout + styles tableau pricing |
| `js/core.js` | Remplacement `renderAllPlans()` → `renderPricingTable()` + logique panneau contextuel |
| `js/render.js` | Fonctions de rendu panneau droit contextuel |
| `index.html` | Structure HTML sidebar + panneau droit + section pricing |
| `js/i18n.js` | Nouvelles clés i18n pour tableau pricing (7 langues) |

---

## 5. Hors périmètre (autres vagues)

- Logo violet : Vague 1
- Photo de profil : Vague 3
- Groupes multi-admins : Vague 4
- Publicités affiliées : Vague 5
- RGPD : Vague 6

---

## 6. Critères d'acceptance

- [ ] Sur desktop (≥ 1024px) : sidebar visible, panneau contextuel visible, contenu principal occupe le centre
- [ ] Sur mobile (< 1024px) : aucun changement visuel vs aujourd'hui
- [ ] Sidebar : icône active correctement surlignée lors des changements de vue
- [ ] Panneau contextuel : contenu change selon la vue active sans rechargement
- [ ] Page pricing : tableau complet avec 4 colonnes, colonne Bloom surlignée
- [ ] Page pricing : responsive — cartes empilées sur mobile
- [ ] Toutes les strings du tableau pricing sont traduits dans les 7 langues
- [ ] `node --check js/core.js` et `node --check js/render.js` passent sans erreur
