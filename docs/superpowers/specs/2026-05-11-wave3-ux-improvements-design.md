# Bloomday Wave 3 — UX Improvements Design Spec

**Date:** 2026-05-11  
**Status:** Approved  
**Priority order:** A (UX immédiate) → B (données & pays) → C (traductions complètes)

---

## Contexte

L'application Bloomday est fonctionnelle avec 7 langues (fr, en, es, ar, hi, zh, pt), ~50 pays, et un système de fêtes nationales. Cette spec couvre les améliorations UX identifiées après audit visuel et code. L'objectif B2 est d'atteindre ~140 pays uniques en couvrant tous les pays où les 7 langues sont officiellement parlées.

---

## A — UX Immédiate

### A1 — Logo existant visible dans la topbar (modes clair et sombre)

**Problème :** Le SVG `#bi` (logo Bloomday existant, sprite inline dans index.html) est rendu sans fond sur la topbar → quasi invisible en mode sombre car le stroke/fill disparaît sur fond foncé.

**Contrainte importante :** Ne pas remplacer ni modifier la forme du logo. Uniquement améliorer sa visibilité par le contexte CSS/HTML autour de lui.

**Solution :**
- Envelopper le `<svg width="30" height="30"><use href="#bi"/></svg>` existant dans un `<div class="logo-wrap">` sans toucher au SVG sprite `#bi`
- CSS `.logo-wrap` : `background: linear-gradient(135deg, #FFB6D9, #FF8BC0)` en mode clair, `#D4508C` en mode sombre — fond rose visible sur les deux thèmes
- `border-radius: 50%` + `padding: 5px` pour encercler le logo
- Sur le `<use>`, ajouter via CSS `fill: white; stroke: white` pour que le logo reste blanc sur le fond coloré
- **Ne pas toucher** au SVG sprite `#bi` défini en haut d'index.html

**Fichiers :** `index.html` (wrapper div autour du svg topbar), `css/*.css` (`.logo-wrap` + overrides fill/stroke en mode sombre)

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

**Problème :** Les listes `PAYS` (data.js, ~50 entrées) et `COUNTRIES` (helpers.js, ~35 entrées) ne sont pas triées alphabétiquement. Pas de recherche textuelle. `COUNTRIES` n'a pas les emojis drapeaux contrairement à `PAYS`.

**Solution :**

**Drapeaux dans COUNTRIES :**
- `COUNTRIES` dans helpers.js doit inclure les emojis drapeaux devant chaque nom de pays, comme `PAYS` l'a déjà (`🇫🇷 France`, `🇭🇹 Haïti`…)
- `COUNTRIES_VALUES` reste inchangé (codes ISO)
- Les 7 arrays (fr, en, es, ar, hi, zh, pt) sont mis à jour pour inclure le drapeau avant chaque nom

**Tri :**
- `PAYS` dans `data.js` : trier par label alphabétique (après le préfixe emoji flag) dans la langue active — tri dynamique à l'affichage, "Non précisé" reste en tête
- `COUNTRIES` dans `helpers.js` : même logique, "Non précisé / Not specified" reste en tête
- Conserver `COUNTRIES_VALUES` synchronisé avec l'ordre trié (les index doivent rester alignés)

**Recherche :**
- Modifier `buildCountrySelect()` dans `helpers.js` : ajouter un `<input type="text" class="country-search">` au-dessus du `<select>`
- Filtrer les options au `input` event : masquer les `<option>` dont le texte normalisé (sans accents, lowercase) ne contient pas la saisie normalisée
- Seuil de déclenchement : filtrage dès 1 caractère
- Le drapeau emoji dans le texte est ignoré lors de la comparaison de filtrage

**Fichiers :** `js/helpers.js` (buildCountrySelect + COUNTRIES + COUNTRIES_VALUES), `js/data.js` (PAYS ordre), `css/*.css` (country-search input)

### B2 — Plus de pays + fêtes nationales correspondantes

**Problème :** Seulement ~50 pays couverts. Avec 7 langues officielles (fr, en, es, ar, hi, zh, pt), on peut couvrir ~140 pays uniques en incluant tous les pays où ces langues sont officiellement parlées.

**Objectif :** Porter `PAYS` et `COUNTRIES` à ~140 entrées.

**Liste complète des pays à couvrir (nouveaux + existants) par langue :**

**Francophones (~40) — déjà : fr, be, ch, ca, ht, gp, mq, re, ma, dz, tn, sn, ci, cm, cd, cg, ga, gn, ml, bf, ne, td, bj, tg, mg, mu, km, dj, lb — à ajouter :**
| Code | Pays | Drapeau |
|------|------|---------|
| `lu` | Luxembourg | 🇱🇺 |
| `gf` | Guyane française | 🇬🇫 |
| `pf` | Polynésie française | 🇵🇫 |
| `nc` | Nouvelle-Calédonie | 🇳🇨 |
| `pm` | Saint-Pierre-et-Miquelon | 🇵🇲 |
| `mf` | Saint-Martin | 🇲🇫 |
| `bi` | Burundi | 🇧🇮 |
| `rw` | Rwanda | 🇷🇼 |
| `cf` | Centrafrique | 🇨🇫 |
| `st` | São Tomé-et-Príncipe | 🇸🇹 |
| `gq` | Guinée Équatoriale | 🇬🇶 |
| `cv` | Cap-Vert | 🇨🇻 |
| `sc` | Seychelles | 🇸🇨 |
| `yt` | Mayotte | 🇾🇹 |

**Anglophones (~50) — déjà : us, gb, gh, ng — à ajouter :**
| Code | Pays | Drapeau |
|------|------|---------|
| `au` | Australie | 🇦🇺 |
| `nz` | Nouvelle-Zélande | 🇳🇿 |
| `ie` | Irlande | 🇮🇪 |
| `in` | Inde | 🇮🇳 |
| `ke` | Kenya | 🇰🇪 |
| `tz` | Tanzanie | 🇹🇿 |
| `ug` | Ouganda | 🇺🇬 |
| `za` | Afrique du Sud | 🇿🇦 |
| `zw` | Zimbabwe | 🇿🇼 |
| `zm` | Zambie | 🇿🇲 |
| `mw` | Malawi | 🇲🇼 |
| `bw` | Botswana | 🇧🇼 |
| `na` | Namibie | 🇳🇦 |
| `sl` | Sierra Leone | 🇸🇱 |
| `lr` | Liberia | 🇱🇷 |
| `gm` | Gambie | 🇬🇲 |
| `ph` | Philippines | 🇵🇭 |
| `sg` | Singapour | 🇸🇬 |
| `pk` | Pakistan | 🇵🇰 |
| `bd` | Bangladesh | 🇧🇩 |
| `lk` | Sri Lanka | 🇱🇰 |
| `jm` | Jamaïque | 🇯🇲 |
| `tt` | Trinidad-et-Tobago | 🇹🇹 |
| `bb` | Barbade | 🇧🇧 |
| `gy` | Guyana | 🇬🇾 |
| `mt` | Malte | 🇲🇹 |
| `et` | Éthiopie | 🇪🇹 |
| `ss` | Soudan du Sud | 🇸🇸 |
| `er` | Érythrée | 🇪🇷 |

**Hispanophones (~20) — déjà : es, mx, co — à ajouter :**
| Code | Pays | Drapeau |
|------|------|---------|
| `ar` | Argentine | 🇦🇷 |
| `pe` | Pérou | 🇵🇪 |
| `ve` | Venezuela | 🇻🇪 |
| `cl` | Chili | 🇨🇱 |
| `ec` | Équateur | 🇪🇨 |
| `gt` | Guatemala | 🇬🇹 |
| `cu` | Cuba | 🇨🇺 |
| `bo` | Bolivie | 🇧🇴 |
| `do` | République Dominicaine | 🇩🇴 |
| `hn` | Honduras | 🇭🇳 |
| `py` | Paraguay | 🇵🇾 |
| `sv` | El Salvador | 🇸🇻 |
| `ni` | Nicaragua | 🇳🇮 |
| `cr` | Costa Rica | 🇨🇷 |
| `pa` | Panama | 🇵🇦 |
| `uy` | Uruguay | 🇺🇾 |
| `pr` | Porto Rico | 🇵🇷 |

**Arabophones (~22) — déjà : ma, dz, tn, eg, lb, dj, km — à ajouter :**
| Code | Pays | Drapeau |
|------|------|---------|
| `sa` | Arabie Saoudite | 🇸🇦 |
| `ae` | Émirats Arabes Unis | 🇦🇪 |
| `iq` | Irak | 🇮🇶 |
| `sy` | Syrie | 🇸🇾 |
| `jo` | Jordanie | 🇯🇴 |
| `ye` | Yémen | 🇾🇪 |
| `ps` | Palestine | 🇵🇸 |
| `qa` | Qatar | 🇶🇦 |
| `bh` | Bahreïn | 🇧🇭 |
| `kw` | Koweït | 🇰🇼 |
| `om` | Oman | 🇴🇲 |
| `ly` | Libye | 🇱🇾 |
| `sd` | Soudan | 🇸🇩 |
| `so` | Somalie | 🇸🇴 |
| `mr` | Mauritanie | 🇲🇷 |

**Hindiphones (~3) — déjà : in — à ajouter :**
| Code | Pays | Drapeau |
|------|------|---------|
| `np` | Népal | 🇳🇵 |
| `fj` | Fidji | 🇫🇯 |

**Sinophones (~4) — déjà : cn — à ajouter :**
| Code | Pays | Drapeau |
|------|------|---------|
| `tw` | Taïwan | 🇹🇼 |
| `hk` | Hong Kong | 🇭🇰 |
| `mo` | Macao | 🇲🇴 |
| `my` | Malaisie | 🇲🇾 |

**Lusophones (~8) — déjà : pt, br, cv, st — à ajouter :**
| Code | Pays | Drapeau |
|------|------|---------|
| `ao` | Angola | 🇦🇴 |
| `mz` | Mozambique | 🇲🇿 |
| `gw` | Guinée-Bissau | 🇬🇼 |
| `tl` | Timor-Leste | 🇹🇱 |

**Total cible : ~140 pays uniques**

**Fêtes nationales manquantes à ajouter dans FETES + FETES_NAMES :**

| Pays | Fête | Date |
|------|------|------|
| Nigeria | Fête Nationale Nigeria | 1er oct |
| Kenya | Jamhuri Day (Indépendance) | 12 déc |
| Afrique du Sud | Freedom Day | 27 avr |
| Colombie | Indépendance Colombie | 20 juil |
| Argentine | Indépendance Argentine | 9 juil |
| Pérou | Indépendance Pérou | 28 juil |
| Venezuela | Indépendance Venezuela | 5 juil |
| Chili | Fête Nationale Chili | 18 sept |
| Mexique | Fête Nationale Mexique | 16 sept |
| Philippines | Indépendance Philippines | 12 juin |
| Vietnam | Fête Nationale Vietnam | 2 sept |
| Corée du Sud | Gwangbokjeol (Libération) | 15 août |
| Burkina Faso | Indépendance Burkina Faso | 11 déc |
| Niger | Indépendance Niger | 3 août |
| Tchad | Indépendance Tchad | 11 août |
| Émirats | Fête Nationale EAU | 2 déc |
| Arabie Saoudite | Fête Nationale KSA | 23 sept |
| Brésil | Indépendance Brésil (déjà présent) | 7 sept |
| Pakistan | Indépendance Pakistan | 14 août |
| Bangladesh | Indépendance Bangladesh | 26 mars |

Chaque nouvelle fête doit être ajoutée dans `FETES_NAMES` (helpers.js) avec les 7 traductions (fr, en, es, ar, hi, zh, pt).

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
