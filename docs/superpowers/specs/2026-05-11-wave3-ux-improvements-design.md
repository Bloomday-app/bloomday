# Bloomday Wave 3 — UX Improvements Design Spec

**Date:** 2026-05-11  
**Status:** Approved  
**Priority order:** A (UX immédiate) → B (données & pays) → C (traductions complètes)

---

## Contexte

L'application Bloomday est fonctionnelle avec 7 langues (fr, en, es, ar, hi, zh, pt), ~50 pays, et un système de fêtes nationales. Cette spec couvre les améliorations UX identifiées après audit visuel et code.

---

## A — UX Immédiate

### A1 — Logo visible dans la topbar (modes clair et sombre)

**Problème :** Le SVG `#bi` dans la topbar est rendu en noir/transparent sur fond sombre → logo invisible en mode sombre.

**Solution :**
- Envelopper le SVG logo dans un `<div class="logo-wrap">` avec `background: linear-gradient(135deg, var(--b3), var(--b1))` (rose/or selon la palette Bloomday)
- Ajouter `border-radius: 50%` + `padding: 4px` + `box-shadow: 0 2px 6px rgba(228,100,160,0.4)`
- Le SVG interne utilise `fill="white"` pour être visible sur tout fond
- CSS : ajouter la variable `--logo-bg` adaptée mode clair (`#FFB6D9`) et sombre (`#D4508C`)

**Fichiers :** `index.html` (topbar SVG wrapper), `css/*.css` (nouvelles variables)

### A2 — Onglet "Plus" → "Profil" avec photo de profil ronde

**Problème :** Le 5e onglet nav bas affiche 3 points + "Plus", impersonnel et peu engageant.

**Solution :**
- Remplacer l'icône SVG 3 points par un `<div class="nb-avatar">` de 22×22px, `border-radius:50%`, bordure dorée
- Si l'utilisateur a une photo de profil stockée (dans le premier membre avec le nom de l'utilisateur, ou via `localStorage('bdg16_user_photo')`), l'afficher en `object-fit:cover`
- Sinon : afficher la première lettre du nom d'utilisateur (ou "🌸" par défaut) sur fond dégradé rose
- La clé de traduction `navMore` devient `navProfile` → ajouter dans les 7 langues
- Mapping traductions : fr="Profil", en="Profile", es="Perfil", ar="الملف", hi="प्रोफ़ाइल", zh="我的", pt="Perfil"
- Le comportement `onclick="showSec('more',4)"` reste inchangé

**Fichiers :** `index.html` (nav button #nb4), `js/render.js` (renderNav + i18n key), `js/i18n.js` (7 langues)

### A3 — "Mon groupe" traduit dynamiquement selon la langue active

**Problème :** Le groupe par défaut est créé avec `name: t('myGroup')` au moment de la création. Si la langue change ensuite, le nom stocké reste "Mon groupe" (ou la langue de création).

**Solution :**
- Ajouter un flag `isDefault: true` à la création du groupe par défaut dans `core.js:3` et `core.js:171`
- Dans `rGbar()` (core.js:254), utiliser `g.isDefault ? t('myGroup') : g.name` pour l'affichage
- **Ne pas migrer** les groupes existants automatiquement (risque de perte de données) — le flag `isDefault` est ajouté uniquement aux nouveaux groupes et à la prochaine lecture si `name === 'Mon groupe' || name === 'My group' || name === 'Mi grupo'` etc. (détection par liste des valeurs connues de `myGroup`)
- Migration douce : lors du `load()`, si `group.name` correspond à l'une des 7 traductions de `myGroup`, poser `group.isDefault = true` et sauvegarder

**Fichiers :** `js/core.js` (load, rGbar, addGroup default case)

---

## B — Données & Pays

### B1 — Pays triés alphabétiquement + recherche par frappe

**Problème :** Les listes `PAYS` (data.js, ~50 entrées) et `COUNTRIES` (helpers.js, ~35 entrées) ne sont pas triées alphabétiquement. Pas de recherche textuelle.

**Solution :**

**Tri :**
- `PAYS` dans `data.js` : trier par label (après le préfixe emoji) dans la langue de l'utilisateur — tri dynamique à l'affichage
- `COUNTRIES` dans `helpers.js` : trier les arrays par ordre alphabétique dans chaque langue
- La première entrée "Non précisé / Not specified" reste en tête (valeur spéciale)
- Conserver `COUNTRIES_VALUES` synchronisé avec l'ordre trié

**Recherche :**
- Modifier `buildCountrySelect()` dans `helpers.js` pour accepter un mode "searchable"
- Ajouter un `<input type="text" class="country-search">` au-dessus du `<select>` quand `searchable=true`
- Filtrer les options au `input` event : masquer les `<option>` dont le texte ne contient pas la valeur saisie (insensible à la casse, sans accents)
- Alternative plus légère : remplacer le `<select>` par un `<div class="custom-select">` avec liste filtrée — **recommandé** pour meilleur contrôle UX
- Seuil de déclenchement : filtrage dès 1 caractère saisi

**Fichiers :** `js/helpers.js` (buildCountrySelect), `js/data.js` (PAYS ordre), `css/*.css` (custom-select)

### B2 — Plus de pays + fêtes nationales correspondantes

**Problème :** Pays manquants dans `PAYS` (data.js) et `COUNTRIES` (helpers.js). Certains pays présents dans `PAYS` n'ont pas leurs fêtes nationales dans `FETES` (data.js).

**Nouveaux pays à ajouter dans PAYS + COUNTRIES :**

| Code | Pays | Langue interface principale |
|------|------|---------------------------|
| `ng` | Nigeria | en |
| `gh` | Ghana | en (déjà présent dans PAYS, à ajouter COUNTRIES) |
| `ke` | Kenya | en |
| `et` | Éthiopie | fr/en |
| `tz` | Tanzanie | fr/en |
| `ug` | Ouganda | en |
| `za` | Afrique du Sud | en |
| `co` | Colombie | es |
| `ar` | Argentine | es |
| `pe` | Pérou | es |
| `ve` | Venezuela | es |
| `cl` | Chili | es |
| `ec` | Équateur | es |
| `mx` | Mexique | es (présent PAYS, à ajouter COUNTRIES) |
| `ph` | Philippines | en |
| `vn` | Vietnam | fr/en |
| `th` | Thaïlande | en |
| `kr` | Corée du Sud | en |
| `id` | Indonésie | en |
| `ru` | Russie | fr/en |
| `ua` | Ukraine | fr/en |
| `tr` | Turquie | fr/en |
| `ro` | Roumanie | fr |
| `pl` | Pologne | fr/en |
| `cv` | Cap-Vert | pt (déjà PAYS) |
| `mz` | Mozambique | pt |
| `ao` | Angola | pt |

**Fêtes nationales à ajouter dans FETES + FETES_NAMES :**

| Pays | Fête | Date |
|------|------|------|
| Nigeria | Indépendance Nigeria | 1er oct |
| Kenya | Indépendance Kenya | 12 déc |
| Afrique du Sud | Journée de la Liberté (Freedom Day) | 27 avr |
| Colombie | Indépendance Colombie | 20 juil |
| Argentine | Indépendance Argentine | 9 juil |
| Pérou | Indépendance Pérou | 28 juil |
| Venezuela | Indépendance Venezuela | 5 juil |
| Chili | Indépendance Chili | 18 sept |
| Mexique | Fête Nationale Mexique | 16 sept |
| Philippines | Indépendance Philippines | 12 juin |
| Vietnam | Fête Nationale Vietnam | 2 sept |
| Corée du Sud | Fête Nationale Corée | 15 août |
| Burkina Faso | Indépendance Burkina Faso | 11 déc |
| Niger | Indépendance Niger | 3 août |
| Tchad | Indépendance Tchad | 11 août |
| Bénin | Indépendance Bénin | 1er août (déjà présent) |
| Togo | Indépendance Togo | 27 avr (déjà présent) |
| Guinée | Indépendance Guinée | 2 oct (déjà présent) |

Chaque nouvelle fête doit être ajoutée dans `FETES_NAMES` (helpers.js) avec les 7 traductions.

**Principe langue → pays :** Lors de l'affichage du sélecteur de pays dans le profil, proposer en tête de liste (après "Non précisé") les pays correspondant à la langue active de l'utilisateur. Exemple : si `appLang === 'es'`, remonter les pays hispanophones.

**Fichiers :** `js/data.js` (PAYS, FETES), `js/helpers.js` (COUNTRIES, COUNTRIES_VALUES, FETES_NAMES)

---

## C — Traductions complètes (audit)

À traiter en phase suivante. Points identifiés :

1. **Options des `<select>` dans index.html** : certains `<option>` ont des `data-i18n` mais d'autres sont codés en dur en français (ex: liste des mois dans `inp-month`)
2. **Mois dans le formulaire ajout membre** : `inp-month` a les noms de mois en dur ("Jan", "Fév"…) non liés à `I18N.fr.monthsShort` — à connecter via `applyI18n()`
3. **Textes dans les modales** : vérifier toutes les modales (groupes, plans, paiement) que chaque `data-i18n` est bien présent et que la clé existe dans les 7 langues
4. **Placeholders** : audit complet des `placeholder=""` non liés à `data-i18n-placeholder`
5. **Messages d'erreur JS** : certains `alert()` et `console.error()` sont en français en dur dans `core.js` et `features.js`

---

## Hors scope (décisions explicites)

- **Import de contacts** : mentionné par l'utilisateur mais déjà présent (`btn-import-contacts`)
- **IA adaptée à la culture** : le prompt de génération de messages utilise déjà le pays membre — amélioration mineure possible mais hors scope Wave 3
- **Fêtes religieuses variables** (Ramadan, Pâques) : déjà gérées via dates approximatives — pas de recalcul dynamique dans ce scope

---

## Ordre d'implémentation recommandé

1. A3 — Groupe traduit (2 fichiers, risque faible)
2. A1 — Logo visible (CSS + HTML, risque faible)
3. A2 — Nav Profil (HTML + JS + i18n, risque moyen)
4. B1 — Pays triés + recherche (helpers.js refactor, risque moyen)
5. B2 — Nouveaux pays + fêtes (data.js + helpers.js extension, risque faible mais volumieux)
6. C — Audit traductions (scan exhaustif, risque faible)
