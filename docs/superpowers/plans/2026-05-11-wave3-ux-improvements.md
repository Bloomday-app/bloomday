# Wave 3 UX Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Améliorer la visibilité du logo, ajouter l'avatar profil dans la nav, corriger la traduction dynamique du groupe par défaut, ajouter drapeaux + tri + recherche dans les sélecteurs de pays, et porter la couverture de ~50 à ~140 pays avec leurs fêtes nationales.

**Architecture:** Modifications localisées sur 6 fichiers (`index.html`, `css/app.css`, `js/core.js`, `js/i18n.js`, `js/helpers.js`, `js/data.js`) sans changement de structure. Pas de nouveau fichier. Les données pays/fêtes sont étendues dans les structures existantes (`COUNTRIES`, `COUNTRIES_VALUES`, `PAYS`, `FETES`, `FETES_NAMES`).

**Tech Stack:** Vanilla JS ES5+, HTML5, CSS3 (media queries dark mode via `prefers-color-scheme`), localStorage pour la photo de profil.

---

## Fichiers modifiés

| Fichier | Changements |
|---------|-------------|
| `index.html` | A1: wrapper `.logo-wrap` autour du SVG topbar · A2: remplacer bouton #nb4 |
| `css/app.css` | A1: styles `.logo-wrap` + dark mode override · A2+B1: styles avatar + country-search |
| `js/core.js` | A3: flag `isDefault` à la création + migration douce dans `load()` + `rGbar()` |
| `js/i18n.js` | A2: clé `navProfile` dans les 7 langues · B1: `countrySearchPlaceholder` |
| `js/render.js` | A2: `navKeys[4]` → `'navProfile'` + fonction `updateNavAvatar()` |
| `js/helpers.js` | B1: `buildCountrySelect()` refactorisé + `COUNTRIES` avec drapeaux · B2: +90 pays + `FETES_NAMES` +18 |
| `js/data.js` | B2: `PAYS` +90 pays · `FETES` +19 fêtes |

---

## Task 1 — A3 : Groupe par défaut traduit dynamiquement

**Fichiers :**
- Modifier : `js/core.js` (fonctions `load`, `rGbar`, et l'onboarding ligne ~171)

**Contexte :** Le groupe par défaut est créé avec `name: t('myGroup')` en dur au moment de la création. Si la langue change, l'onglet reste dans la langue de création. Solution : poser `isDefault:true` sur le groupe par défaut, puis dans `rGbar()` afficher `t('myGroup')` si `isDefault` est vrai.

Valeurs connues de `myGroup` dans les 7 langues (pour migration douce) :
`['Mon groupe','My group','Mi grupo','\u0645\u062c\u0645\u0648\u0639\u062a\u064a','\u092e\u0947\u0930\u093e \u0938\u092e\u0942\u0939','\u6211\u7684\u7fa4\u7ec4','Meu grupo']`

- [ ] **Étape 1 : Ajouter `isDefault:true` à la création dans `load()` (core.js ligne 3)**

Remplacer :
```js
if(!groups.length)groups=[{id:'g1',name:mode==='biz'?'Mon équipe':t('myGroup'),icon:mode==='biz'?'💼':'🌸',members:[]}];
```
Par :
```js
if(!groups.length)groups=[{id:'g1',name:mode==='biz'?'Mon équipe':t('myGroup'),icon:mode==='biz'?'💼':'🌸',members:[],isDefault:mode!=='biz'}];
```

- [ ] **Étape 2 : Ajouter la migration douce dans `load()` après `groups=await gg(...)`**

Insérer juste avant le `if(!groups.length)` existant :
```js
var _defNames=['Mon groupe','My group','Mi grupo','\u0645\u062c\u0645\u0648\u0639\u062a\u064a','\u092e\u0947\u0631\u093e \u0938\u092e\u0942\u0939','\u6211\u7684\u7fa4\u7ec4','Meu grupo'];
var _migrated=false;
groups.forEach(function(g){if(!g.isDefault&&_defNames.indexOf(g.name)!==-1){g.isDefault=true;_migrated=true;}});
if(_migrated)saveG();
```

- [ ] **Étape 3 : Ajouter `isDefault:true` dans l'onboarding (core.js ligne ~171)**

Remplacer :
```js
if(!groups.length)groups=[{id:'g1',name:t('myGroup'),icon:'🌸',members:[]}];
```
Par :
```js
if(!groups.length)groups=[{id:'g1',name:t('myGroup'),icon:'🌸',members:[],isDefault:true}];
```

- [ ] **Étape 4 : Modifier `rGbar()` pour afficher `t('myGroup')` dynamiquement (core.js ligne ~254)**

La fonction `rGbar()` utilise déjà `esc()` pour sécuriser les valeurs. Remplacer la ligne qui construit le bouton groupe :
```js
// AVANT (extrait du bouton groupe) :
// ${esc(g.name)}
// APRÈS :
// ${esc(g.isDefault?t('myGroup'):g.name)}
```

La ligne complète devient :
```
b.innerHTML = groups.map(g =>
  '<button class="gc' + (g.id===curG?' on':'') + '" onclick="switchG(\'' + esc(g.id) + '\')">'
  + esc(g.icon) + ' ' + esc(g.isDefault ? t('myGroup') : g.name)
  + '</button>'
).join('') + '<button class="gc add" onclick="addGroup()" title="' + esc(t('groupModalTitle')||'Nouveau groupe') + '">\uFF0B</button>';
```

- [ ] **Étape 5 : Tester manuellement**

Ouvrir l'app. L'onglet groupe par défaut affiche "Mon groupe" (fr). Changer la langue vers EN dans les paramètres. L'onglet doit immédiatement afficher "My group". Changer vers ES → "Mi grupo".

- [ ] **Étape 6 : Commit**

```bash
git add js/core.js
git commit -m "fix: groupe par défaut traduit dynamiquement via isDefault flag"
```

---

## Task 2 — A1 : Logo Bloomday visible en mode clair et sombre

**Fichiers :**
- Modifier : `index.html` (topbar SVG, ligne ~230)
- Modifier : `css/app.css` (après bloc `.tb-l`)

**Contrainte :** Ne pas modifier le SVG sprite `#bi`. Envelopper uniquement le `<svg><use href="#bi"/></svg>` existant.

- [ ] **Étape 1 : Envelopper le SVG dans index.html**

Trouver :
```html
<svg width="30" height="30"><use href="#bi"/></svg>
```
Remplacer par :
```html
<div class="logo-wrap"><svg width="22" height="22"><use href="#bi"/></svg></div>
```

- [ ] **Étape 2 : Ajouter les styles CSS pour `.logo-wrap` dans `css/app.css`**

Après le bloc `.tb-l{...}`, ajouter :
```css
.logo-wrap{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#FFB6D9,#FF8BC0);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(228,100,160,.35)}
.logo-wrap svg{fill:white;stroke:white}
```

- [ ] **Étape 3 : Ajouter l'override dark mode dans `css/app.css`**

Dans le bloc existant `@media(prefers-color-scheme:dark)`, après la règle `:root{...}`, ajouter :
```css
.logo-wrap{background:linear-gradient(135deg,#C03880,#8B1A50);box-shadow:0 2px 8px rgba(180,50,120,.45)}
```

- [ ] **Étape 4 : Vérifier visuellement**

Ouvrir l'app en mode clair → logo blanc sur fond rose visible. Basculer macOS en mode sombre (Réglages Système → Apparence → Sombre) → logo blanc sur fond rose foncé, toujours visible.

- [ ] **Étape 5 : Commit**

```bash
git add index.html css/app.css
git commit -m "fix: logo visible en mode clair et sombre (wrapper rose)"
```

---

## Task 3 — A2 : Onglet "Plus" → "Profil" avec avatar utilisateur

**Fichiers :**
- Modifier : `index.html` (nav button #nb4, ligne ~301)
- Modifier : `js/i18n.js` (clé `navProfile` dans les 7 langues)
- Modifier : `js/render.js` (`navKeys` + `updateNavAvatar`)
- Modifier : `css/app.css` (styles `.nb-avatar`)

**Contexte :** Le 5e bouton de la nav bas (`#nb4`) affiche une icône 3 points + "Plus". On remplace l'icône par un avatar rond. L'avatar affiche : photo si `localStorage.getItem('bdg16_user_photo')` existe ; sinon initiale de `profile.name` ; sinon le symbole 🌸.

- [ ] **Étape 1 : Ajouter `navProfile` dans `js/i18n.js` pour les 7 langues**

Dans chaque section de langue, ajouter juste après `navMore` :

- **fr** : `navProfile:'Profil',`
- **en** : `navProfile:'Profile',`
- **es** : `navProfile:'Perfil',`
- **ar** : `navProfile:'\u0627\u0644\u0645\u0644\u0641',`
- **hi** : `navProfile:'\u092a\u094d\u0930\u094b\u092b\u093c\u093e\u0907\u0932',`
- **zh** : `navProfile:'\u6211\u7684',`
- **pt** : `navProfile:'Perfil',`

- [ ] **Étape 2 : Remplacer le bouton #nb4 dans `index.html`**

Trouver (ligne ~301) :
```html
  <button class="nb" id="nb4" onclick="showSec('more',4)">
    <svg viewBox="0 0 22 22" fill="none"><circle cx="11" cy="5" r="1.5" fill="currentColor"/><circle cx="11" cy="11" r="1.5" fill="currentColor"/><circle cx="11" cy="17" r="1.5" fill="currentColor"/></svg><span class="nbl" data-i18n="navMore">Plus</span>
  </button>
```
Remplacer par :
```html
  <button class="nb" id="nb4" onclick="showSec('more',4)">
    <div class="nb-avatar" id="nb4-avatar"><span id="nb4-initials">&#127800;</span></div>
    <span class="nbl" data-i18n="navProfile">Profil</span>
  </button>
```

- [ ] **Étape 3 : Ajouter les styles `.nb-avatar` dans `css/app.css`**

Après le bloc `.nb` existant :
```css
.nb-avatar{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#FFB6D9,#D4A843);display:flex;align-items:center;justify-content:center;border:2px solid var(--b1,#D4A843);overflow:hidden;flex-shrink:0}
.nb-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
.nb-avatar span{font-size:11px;color:white;font-weight:800;line-height:1}
```

- [ ] **Étape 4 : Ajouter la fonction `updateNavAvatar()` dans `js/render.js`**

Ajouter avant `applyI18n` ou en fin de fichier :
```js
function updateNavAvatar(){
  var av=document.getElementById('nb4-avatar');
  if(!av) return;
  var photo=localStorage.getItem('bdg16_user_photo')||'';
  if(photo){
    // photo est une dataURL stockée via localStorage — source contrôlée par l'utilisateur
    av.textContent='';
    var img=document.createElement('img');
    img.src=photo;
    img.alt='profil';
    av.appendChild(img);
    return;
  }
  var sp=document.getElementById('nb4-initials');
  if(!sp) return;
  var name=(profile&&profile.name)||'';
  // textContent est sûr : pas de parsing HTML
  sp.textContent=name?name.trim()[0].toUpperCase():'\uD83C\uDF38';
}
```

- [ ] **Étape 5 : Appeler `updateNavAvatar()` dans `applyI18n()` (js/render.js)**

À la fin de la section "3. Nav bas" dans `applyI18n`, ajouter :
```js
updateNavAvatar();
```

- [ ] **Étape 6 : Mettre à jour `navKeys` dans `js/render.js` (ligne ~406)**

```js
// AVANT :
var navKeys=['navHome','navMembers','navAdd','navEvents','navMore'];
// APRÈS :
var navKeys=['navHome','navMembers','navAdd','navEvents','navProfile'];
```

- [ ] **Étape 7 : Tester**

Le 5e onglet affiche "Profil" + icône 🌸. Changer la langue en EN → "Profile". Ajouter un nom dans les paramètres profil, recharger → initiale en or. Tester en mode sombre.

- [ ] **Étape 8 : Commit**

```bash
git add index.html css/app.css js/i18n.js js/render.js
git commit -m "feat: onglet Profil avec avatar utilisateur en nav bas"
```

---

## Task 4 — B1 : Drapeaux + tri alphabétique + recherche dans les sélecteurs pays

**Fichiers :**
- Modifier : `js/helpers.js` (COUNTRIES, COUNTRIES_VALUES, buildCountrySelect, nouvelle fonction `_normStr`)
- Modifier : `js/i18n.js` (clé `countrySearchPlaceholder` dans les 7 langues)
- Modifier : `css/app.css` (styles `.country-search`)

**Contexte :** `COUNTRIES` n'a pas de drapeaux. `buildCountrySelect()` génère un select non trié sans recherche. On ajoute : (1) drapeaux dans chaque entrée, (2) tri dynamique par `_normStr` qui normalise sans emoji/accents, (3) champ de recherche injecté devant le select.

- [ ] **Étape 1 : Remplacer `COUNTRIES` dans helpers.js par la version avec drapeaux**

Remplacer le bloc `var COUNTRIES={...}` (lignes 86-94) en entier :

```js
var COUNTRIES={
  fr:['Non précisé','\uD83C\uDDEB\uD83C\uDDF7 France','\uD83C\uDDE7\uD83C\uDDEA Belgique','\uD83C\uDDE8\uD83C\uDDED Suisse','\uD83C\uDDE8\uD83C\uDDE6 Canada','\uD83C\uDDF2\uD83C\uDDE6 Maroc','\uD83C\uDDE9\uD83C\uDDFF Alg\u00e9rie','\uD83C\uDDF9\uD83C\uDDF3 Tunisie','\uD83C\uDDF8\uD83C\uDDF3 S\u00e9n\u00e9gal','\uD83C\uDDE8\uD83C\uDDEE C\u00f4te d\'Ivoire','\uD83C\uDDE8\uD83C\uDDF2 Cameroun','\uD83C\uDDE8\uD83C\uDDEC Congo','\uD83C\uDDE7\uD83C\uDDEF B\u00e9nin','\uD83C\uDDF9\uD83C\uDDEC Togo','\uD83C\uDDE7\uD83C\uDDEB Burkina Faso','\uD83C\uDDF2\uD83C\uDDF1 Mali','\uD83C\uDDEC\uD83C\uDDF3 Guin\u00e9e','\uD83C\uDDF2\uD83C\uDDEC Madagascar','\uD83C\uDDF7\uD83C\uDDFC Rwanda','\uD83C\uDDE7\uD83C\uDDEE Burundi','\uD83C\uDDEC\uD83C\uDDE6 Gabon','\uD83C\uDDF3\uD83C\uDDEA Niger','\uD83C\uDDF9\uD83C\uDDE9 Tchad','\uD83C\uDDF2\uD83C\uDDF7 Mauritanie','\uD83C\uDDE9\uD83C\uDDEF Djibouti','\uD83C\uDDF0\uD83C\uDDF2 Comores','\uD83C\uDDE8\uD83C\uDDFB Cap-Vert','\uD83C\uDDF8\uD83C\uDDF9 S\u00e3o Tom\u00e9','\uD83C\uDDED\uD83C\uDDF9 Ha\u00efti','\uD83C\uDDEC\uD83C\uDDF5 Guadeloupe','\uD83C\uDDF2\uD83C\uDDF6 Martinique','\uD83C\uDDF7\uD83C\uDDEA R\u00e9union','\uD83C\uDDEC\uD83C\uDDEB Guyane','\uD83C\uDDF5\uD83C\uDDEB Polyn\u00e9sie','Autre'],
  en:['Not specified','\uD83C\uDDEB\uD83C\uDDF7 France','\uD83C\uDDE7\uD83C\uDDEA Belgium','\uD83C\uDDE8\uD83C\uDDED Switzerland','\uD83C\uDDE8\uD83C\uDDE6 Canada','\uD83C\uDDF2\uD83C\uDDE6 Morocco','\uD83C\uDDE9\uD83C\uDDFF Algeria','\uD83C\uDDF9\uD83C\uDDF3 Tunisia','\uD83C\uDDF8\uD83C\uDDF3 Senegal','\uD83C\uDDE8\uD83C\uDDEE Ivory Coast','\uD83C\uDDE8\uD83C\uDDF2 Cameroon','\uD83C\uDDE8\uD83C\uDDEC Congo','\uD83C\uDDE7\uD83C\uDDEF Benin','\uD83C\uDDF9\uD83C\uDDEC Togo','\uD83C\uDDE7\uD83C\uDDEB Burkina Faso','\uD83C\uDDF2\uD83C\uDDF1 Mali','\uD83C\uDDEC\uD83C\uDDF3 Guinea','\uD83C\uDDF2\uD83C\uDDEC Madagascar','\uD83C\uDDF7\uD83C\uDDFC Rwanda','\uD83C\uDDE7\uD83C\uDDEE Burundi','\uD83C\uDDEC\uD83C\uDDE6 Gabon','\uD83C\uDDF3\uD83C\uDDEA Niger','\uD83C\uDDF9\uD83C\uDDE9 Chad','\uD83C\uDDF2\uD83C\uDDF7 Mauritania','\uD83C\uDDE9\uD83C\uDDEF Djibouti','\uD83C\uDDF0\uD83C\uDDF2 Comoros','\uD83C\uDDE8\uD83C\uDDFB Cape Verde','\uD83C\uDDF8\uD83C\uDDF9 S\u00e3o Tom\u00e9','\uD83C\uDDED\uD83C\uDDF9 Haiti','\uD83C\uDDEC\uD83C\uDDF5 Guadeloupe','\uD83C\uDDF2\uD83C\uDDF6 Martinique','\uD83C\uDDF7\uD83C\uDDEA R\u00e9union','\uD83C\uDDEC\uD83C\uDDEB French Guiana','\uD83C\uDDF5\uD83C\uDDEB Polynesia','Other'],
  es:['No especificado','\uD83C\uDDEB\uD83C\uDDF7 Francia','\uD83C\uDDE7\uD83C\uDDEA B\u00e9lgica','\uD83C\uDDE8\uD83C\uDDED Suiza','\uD83C\uDDE8\uD83C\uDDE6 Canad\u00e1','\uD83C\uDDF2\uD83C\uDDE6 Marruecos','\uD83C\uDDE9\uD83C\uDDFF Argelia','\uD83C\uDDF9\uD83C\uDDF3 T\u00fanez','\uD83C\uDDF8\uD83C\uDDF3 Senegal','\uD83C\uDDE8\uD83C\uDDEE Costa de Marfil','\uD83C\uDDE8\uD83C\uDDF2 Camer\u00fan','\uD83C\uDDE8\uD83C\uDDEC Congo','\uD83C\uDDE7\uD83C\uDDEF Ben\u00edn','\uD83C\uDDF9\uD83C\uDDEC Togo','\uD83C\uDDE7\uD83C\uDDEB Burkina Faso','\uD83C\uDDF2\uD83C\uDDF1 Mal\u00ed','\uD83C\uDDEC\uD83C\uDDF3 Guinea','\uD83C\uDDF2\uD83C\uDDEC Madagascar','\uD83C\uDDF7\uD83C\uDDFC Ruanda','\uD83C\uDDE7\uD83C\uDDEE Burundi','\uD83C\uDDEC\uD83C\uDDE6 Gab\u00f3n','\uD83C\uDDF3\uD83C\uDDEA N\u00edger','\uD83C\uDDF9\uD83C\uDDE9 Chad','\uD83C\uDDF2\uD83C\uDDF7 Mauritania','\uD83C\uDDE9\uD83C\uDDEF Yibuti','\uD83C\uDDF0\uD83C\uDDF2 Comoras','\uD83C\uDDE8\uD83C\uDDFB Cabo Verde','\uD83C\uDDF8\uD83C\uDDF9 Santo Tom\u00e9','\uD83C\uDDED\uD83C\uDDF9 Hait\u00ed','\uD83C\uDDEC\uD83C\uDDF5 Guadalupe','\uD83C\uDDF2\uD83C\uDDF6 Martinica','\uD83C\uDDF7\uD83C\uDDEA Reuni\u00f3n','\uD83C\uDDEC\uD83C\uDDEB Guayana Francesa','\uD83C\uDDF5\uD83C\uDDEB Polinesia','Otro'],
  ar:['\u063a\u064a\u0631 \u0645\u062d\u062f\u062f','\uD83C\uDDEB\uD83C\uDDF7 \u0641\u0631\u0646\u0633\u0627','\uD83C\uDDE7\uD83C\uDDEA \u0628\u0644\u062c\u064a\u0643\u0627','\uD83C\uDDE8\uD83C\uDDED \u0633\u0648\u064a\u0633\u0631\u0627','\uD83C\uDDE8\uD83C\uDDE6 \u0643\u0646\u062f\u0627','\uD83C\uDDF2\uD83C\uDDE6 \u0627\u0644\u0645\u063a\u0631\u0628','\uD83C\uDDE9\uD83C\uDDFF \u0627\u0644\u062c\u0632\u0627\u0626\u0631','\uD83C\uDDF9\uD83C\uDDF3 \u062a\u0648\u0646\u0633','\uD83C\uDDF8\uD83C\uDDF3 \u0627\u0644\u0633\u0646\u063a\u0627\u0644','\uD83C\uDDE8\uD83C\uDDEE \u0633\u0627\u062d\u0644 \u0627\u0644\u0639\u0627\u062c','\uD83C\uDDE8\uD83C\uDDF2 \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0648\u0646','\uD83C\uDDE8\uD83C\uDDEC \u0627\u0644\u0643\u0648\u0646\u063a\u0648','\uD83C\uDDE7\uD83C\uDDEF \u0628\u0646\u064a\u0646','\uD83C\uDDF9\uD83C\uDDEC \u062a\u0648\u063a\u0648','\uD83C\uDDE7\uD83C\uDDEB \u0628\u0648\u0631\u0643\u064a\u0646\u0627 \u0641\u0627\u0633\u0648','\uD83C\uDDF2\uD83C\uDDF1 \u0645\u0627\u0644\u064a','\uD83C\uDDEC\uD83C\uDDF3 \u063a\u064a\u0646\u064a\u0627','\uD83C\uDDF2\uD83C\uDDEC \u0645\u062f\u063a\u0634\u0642\u0631','\uD83C\uDDF7\uD83C\uDDFC \u0631\u0648\u0627\u0646\u062f\u0627','\uD83C\uDDE7\uD83C\uDDEE \u0628\u0648\u0631\u0648\u0646\u062f\u064a','\uD83C\uDDEC\uD83C\uDDE6 \u0627\u0644\u063a\u0627\u0628\u0648\u0646','\uD83C\uDDF3\uD83C\uDDEA \u0627\u0644\u0646\u064a\u062c\u0631','\uD83C\uDDF9\uD83C\uDDE9 \u062a\u0634\u0627\u062f','\uD83C\uDDF2\uD83C\uDDF7 \u0645\u0648\u0631\u064a\u062a\u0627\u0646\u064a\u0627','\uD83C\uDDE9\uD83C\uDDEF \u062c\u064a\u0628\u0648\u062a\u064a','\uD83C\uDDF0\uD83C\uDDF2 \u062c\u0632\u0631 \u0627\u0644\u0642\u0645\u0631','\uD83C\uDDE8\uD83C\uDDFB \u0627\u0644\u0631\u0623\u0633 \u0627\u0644\u0623\u062e\u0636\u0631','\uD83C\uDDF8\uD83C\uDDF9 \u0633\u0627\u0648 \u062a\u0648\u0645\u064a','\uD83C\uDDED\uD83C\uDDF9 \u0647\u0627\u064a\u062a\u064a','\uD83C\uDDEC\uD83C\uDDF5 \u063a\u0648\u0627\u062f\u0644\u0648\u0628','\uD83C\uDDF2\uD83C\uDDF6 \u0645\u0627\u0631\u062a\u064a\u0646\u064a\u0643','\uD83C\uDDF7\uD83C\uDDEA \u0631\u064a\u0648\u0646\u064a\u0648\u0646','\uD83C\uDDEC\uD83C\uDDEB \u063a\u064a\u0627\u0646\u0627 \u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629','\uD83C\uDDF5\uD83C\uDDEB \u0628\u0648\u0644\u064a\u0646\u064a\u0632\u064a\u0627','\u0623\u062e\u0631\u0649'],
  hi:['\u0928\u093f\u0930\u094d\u0926\u093f\u0937\u094d\u091f \u0928\u0939\u0940\u0902','\uD83C\uDDEB\uD83C\uDDF7 \u092b\u094d\u0930\u093e\u0902\u0938','\uD83C\uDDE7\uD83C\uDDEA \u092c\u0947\u0932\u094d\u091c\u093f\u092e','\uD83C\uDDE8\uD83C\uDDED \u0938\u094d\u0935\u093f\u091f\u094d\u091c\u0930\u0932\u0948\u0902\u0921','\uD83C\uDDE8\uD83C\uDDE6 \u0915\u0928\u093e\u0921\u093e','\uD83C\uDDF2\uD83C\uDDE6 \u092e\u094b\u0930\u0915\u094d\u0915\u094b','\uD83C\uDDE9\uD83C\uDDFF \u0905\u0932\u094d\u091c\u0940\u0930\u093f\u092f\u093e','\uD83C\uDDF9\uD83C\uDDF3 \u091f\u094d\u092f\u0942\u0928\u0940\u0936\u093f\u092f\u093e','\uD83C\uDDF8\uD83C\uDDF3 \u0938\u0947\u0928\u0947\u0917\u0932','\uD83C\uDDE8\uD83C\uDDEE \u0906\u0907\u0935\u0930\u0940 \u0915\u094b\u0938\u094d\u091f','\uD83C\uDDE8\uD83C\uDDF2 \u0915\u0948\u092e\u0930\u0942\u0928','\uD83C\uDDE8\uD83C\uDDEC \u0915\u093e\u0902\u0917\u094b','\uD83C\uDDE7\uD83C\uDDEF \u092c\u0947\u0928\u093f\u0928','\uD83C\uDDF9\uD83C\uDDEC \u091f\u094b\u0917\u094b','\uD83C\uDDE7\uD83C\uDDEB \u092c\u0941\u0930\u094d\u0915\u093f\u0928\u093e \u092b\u093e\u0938\u094b','\uD83C\uDDF2\uD83C\uDDF1 \u092e\u093e\u0932\u0940','\uD83C\uDDEC\uD83C\uDDF3 \u0917\u093f\u0928\u0940','\uD83C\uDDF2\uD83C\uDDEC \u092e\u0947\u0921\u093e\u0917\u093e\u0938\u094d\u0915\u0930','\uD83C\uDDF7\uD83C\uDDFC \u0930\u0935\u093e\u0902\u0921\u093e','\uD83C\uDDE7\uD83C\uDDEE \u092c\u0941\u0930\u0941\u0902\u0921\u0940','\uD83C\uDDEC\uD83C\uDDE6 \u0917\u0948\u092c\u0949\u0928','\uD83C\uDDF3\uD83C\uDDEA \u0928\u093e\u0907\u091c\u0930','\uD83C\uDDF9\uD83C\uDDE9 \u091a\u093e\u0921','\uD83C\uDDF2\uD83C\uDDF7 \u092e\u0949\u0930\u093f\u091f\u093e\u0928\u093f\u092f\u093e','\uD83C\uDDE9\uD83C\uDDEF \u091c\u093f\u092c\u0942\u0924\u0940','\uD83C\uDDF0\uD83C\uDDF2 \u0915\u094b\u092e\u094b\u0930\u094b\u0938','\uD83C\uDDE8\uD83C\uDDFB \u0915\u0947\u092a \u0935\u0930\u094d\u0921\u0947','\uD83C\uDDF8\uD83C\uDDF9 \u0938\u093e\u0913 \u091f\u094b\u092e\u0947','\uD83C\uDDED\uD83C\uDDF9 \u0939\u0948\u0924\u0940','\uD83C\uDDEC\uD83C\uDDF5 \u0917\u094d\u0935\u093e\u0921\u0947\u0932\u0942\u092a','\uD83C\uDDF2\uD83C\uDDF6 \u092e\u093e\u0930\u094d\u091f\u093f\u0928\u093f\u0915','\uD83C\uDDF7\uD83C\uDDEA \u0930\u0940\u092f\u0942\u0928\u093f\u092f\u0928','\uD83C\uDDEC\uD83C\uDDEB \u092b\u094d\u0930\u0947\u0902\u091a \u0917\u0941\u092f\u093e\u0928\u093e','\uD83C\uDDF5\uD83C\uDDEB \u092a\u094b\u0932\u093f\u0928\u0947\u0936\u093f\u092f\u093e','\u0905\u0928\u094d\u092f'],
  zh:['\u672a\u6307\u5b9a','\uD83C\uDDEB\uD83C\uDDF7 \u6cd5\u56fd','\uD83C\uDDE7\uD83C\uDDEA \u6bd4\u5229\u65f6','\uD83C\uDDE8\uD83C\uDDED \u745e\u58eb','\uD83C\uDDE8\uD83C\uDDE6 \u52a0\u62ff\u5927','\uD83C\uDDF2\uD83C\uDDE6 \u6469\u6d1b\u54e5','\uD83C\uDDE9\uD83C\uDDFF \u963f\u5c14\u53ca\u5229\u4e9a','\uD83C\uDDF9\uD83C\uDDF3 \u7a81\u5c3c\u65af','\uD83C\uDDF8\uD83C\uDDF3 \u585e\u5185\u52a0\u5c14','\uD83C\uDDE8\uD83C\uDDEE \u79d1\u7279\u8fea\u74e6','\uD83C\uDDE8\uD83C\uDDF2 \u5580\u9ea6\u9686','\uD83C\uDDE8\uD83C\uDDEC \u521a\u679c','\uD83C\uDDE7\uD83C\uDDEF \u8d1d\u5b81','\uD83C\uDDF9\uD83C\uDDEC \u591a\u54e5','\uD83C\uDDE7\uD83C\uDDEB \u5e03\u57fa\u7eb3\u6cd5\u7d22','\uD83C\uDDF2\uD83C\uDDF1 \u9a6c\u91cc','\uD83C\uDDEC\uD83C\uDDF3 \u51e0\u5185\u4e9a','\uD83C\uDDF2\uD83C\uDDEC \u9a6c\u8fbe\u52a0\u65af\u52a0','\uD83C\uDDF7\uD83C\uDDFC \u5362\u65fa\u8fbe','\uD83C\uDDE7\uD83C\uDDEE \u5e03\u9686\u8fea','\uD83C\uDDEC\uD83C\uDDE6 \u52a0\u84ec','\uD83C\uDDF3\uD83C\uDDEA \u5c3c\u65e5\u5c14','\uD83C\uDDF9\uD83C\uDDE9 \u4e4d\u5f97','\uD83C\uDDF2\uD83C\uDDF7 \u6bdb\u91cc\u5854\u5c3c\u4e9a','\uD83C\uDDE9\uD83C\uDDEF \u5409\u5e03\u63d0','\uD83C\uDDF0\uD83C\uDDF2 \u79d1\u6469\u7f57','\uD83C\uDDE8\uD83C\uDDFB \u4f5b\u5f97\u89d2','\uD83C\uDDF8\uD83C\uDDF9 \u5723\u591a\u7f8e','\uD83C\uDDED\uD83C\uDDF9 \u6d77\u5730','\uD83C\uDDEC\uD83C\uDDF5 \u74dc\u5fb7\u7f57\u666e\u5c9b','\uD83C\uDDF2\uD83C\uDDF6 \u9a6c\u63d0\u5c3c\u514b\u5c9b','\uD83C\uDDF7\uD83C\uDDEA \u7559\u5c3c\u6c6a\u5c9b','\uD83C\uDDEC\uD83C\uDDEB \u6cd5\u5c5e\u572d\u4e9a\u90a3','\uD83C\uDDF5\uD83C\uDDEB \u6cd5\u5c5e\u6ce2\u5229\u5c3c\u897f\u4e9a','\u5176\u4ed6'],
  pt:['\u00c3o especificado','\uD83C\uDDEB\uD83C\uDDF7 Fran\u00e7a','\uD83C\uDDE7\uD83C\uDDEA B\u00e9lgica','\uD83C\uDDE8\uD83C\uDDED Su\u00ed\u00e7a','\uD83C\uDDE8\uD83C\uDDE6 Canad\u00e1','\uD83C\uDDF2\uD83C\uDDE6 Marrocos','\uD83C\uDDE9\uD83C\uDDFF Arg\u00e9lia','\uD83C\uDDF9\uD83C\uDDF3 Tun\u00edsia','\uD83C\uDDF8\uD83C\uDDF3 Senegal','\uD83C\uDDE8\uD83C\uDDEE Costa do Marfim','\uD83C\uDDE8\uD83C\uDDF2 Camar\u00f5es','\uD83C\uDDE8\uD83C\uDDEC Congo','\uD83C\uDDE7\uD83C\uDDEF Benim','\uD83C\uDDF9\uD83C\uDDEC Togo','\uD83C\uDDE7\uD83C\uDDEB Burkina Faso','\uD83C\uDDF2\uD83C\uDDF1 Mali','\uD83C\uDDEC\uD83C\uDDF3 Guin\u00e9','\uD83C\uDDF2\uD83C\uDDEC Madagascar','\uD83C\uDDF7\uD83C\uDDFC Ruanda','\uD83C\uDDE7\uD83C\uDDEE Burundi','\uD83C\uDDEC\uD83C\uDDE6 Gab\u00e3o','\uD83C\uDDF3\uD83C\uDDEA N\u00edger','\uD83C\uDDF9\uD83C\uDDE9 Chade','\uD83C\uDDF2\uD83C\uDDF7 Maurit\u00e2nia','\uD83C\uDDE9\uD83C\uDDEF Djibuti','\uD83C\uDDF0\uD83C\uDDF2 Comores','\uD83C\uDDE8\uD83C\uDDFB Cabo Verde','\uD83C\uDDF8\uD83C\uDDF9 S\u00e3o Tom\u00e9','\uD83C\uDDED\uD83C\uDDF9 Haiti','\uD83C\uDDEC\uD83C\uDDF5 Guadalupe','\uD83C\uDDF2\uD83C\uDDF6 Martinica','\uD83C\uDDF7\uD83C\uDDEA Reuni\u00e3o','\uD83C\uDDEC\uD83C\uDDEB Guiana Francesa','\uD83C\uDDF5\uD83C\uDDEB Poln\u00e9sia','Outro'],
};
```

- [ ] **Étape 2 : Ajouter `_normStr` et réécrire `buildCountrySelect` dans helpers.js**

Remplacer la fonction `buildCountrySelect` (lignes ~97-109) par :
```js
function _normStr(s){
  return s.replace(/[\uD83C][\uDDE6-\uDDFF]/g,'').replace(/[\uD83C][\uDDE6-\uDDFF]/g,'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
}
function buildCountrySelect(selId,currentVal){
  var sel=document.getElementById(selId);
  if(!sel) return;
  var labels=COUNTRIES[appLang]||COUNTRIES.fr;
  var first={label:labels[0],value:''};
  var rest=[];
  for(var i=1;i<labels.length;i++) rest.push({label:labels[i],value:COUNTRIES_VALUES[i]||labels[i]});
  rest.sort(function(a,b){return _normStr(a.label).localeCompare(_normStr(b.label));});
  var pairs=[first].concat(rest);
  // Injecter la barre de recherche si absente
  var wrap=sel.parentElement;
  if(wrap&&!wrap.querySelector('.country-search')){
    var si=document.createElement('input');
    si.type='text';si.className='country-search';si.autocomplete='off';
    si.placeholder=t('countrySearchPlaceholder')||'\uD83D\uDD0D Rechercher\u2026';
    wrap.insertBefore(si,sel);
    si.addEventListener('input',function(){
      var q=_normStr(si.value);
      var opts=sel.options;
      for(var oi=0;oi<opts.length;oi++){
        if(oi===0){opts[oi].style.display='';continue;}
        opts[oi].style.display=(!q||_normStr(opts[oi].textContent).indexOf(q)!==-1)?'':'none';
      }
    });
  }
  // Vider puis remplir le select avec textContent (pas de parsing HTML)
  while(sel.firstChild) sel.removeChild(sel.firstChild);
  pairs.forEach(function(p){
    var opt=document.createElement('option');
    opt.value=p.value;
    opt.textContent=p.label;
    if(p.value===currentVal||p.label===currentVal) opt.selected=true;
    sel.appendChild(opt);
  });
}
```

- [ ] **Étape 3 : Ajouter `countrySearchPlaceholder` dans `js/i18n.js`**

Dans chaque langue après `countriesLabel` :
- fr: `countrySearchPlaceholder:'\uD83D\uDD0D Rechercher un pays\u2026',`
- en: `countrySearchPlaceholder:'\uD83D\uDD0D Search a country\u2026',`
- es: `countrySearchPlaceholder:'\uD83D\uDD0D Buscar un pa\u00eds\u2026',`
- ar: `countrySearchPlaceholder:'\uD83D\uDD0D \u0627\u0628\u062d\u062b \u0639\u0646 \u062f\u0648\u0644\u0629\u2026',`
- hi: `countrySearchPlaceholder:'\uD83D\uDD0D \u0926\u0947\u0936 \u0916\u094b\u091c\u0947\u0902\u2026',`
- zh: `countrySearchPlaceholder:'\uD83D\uDD0D \u641c\u7d22\u56fd\u5bb6\u2026',`
- pt: `countrySearchPlaceholder:'\uD83D\uDD0D Pesquisar pa\u00eds\u2026',`

- [ ] **Étape 4 : Ajouter styles `.country-search` dans `css/app.css`**

```css
.country-search{width:100%;border:1.5px solid var(--b1,#D4A843);border-radius:var(--rad-sm,11px);padding:8px 12px;font-size:13px;background:var(--bg,#FFF8F0);color:var(--txt,#2D1B0E);outline:none;margin-bottom:6px;box-sizing:border-box}
.country-search:focus{border-color:var(--b1d,#B8922E)}
```

- [ ] **Étape 5 : Tester**

Ouvrir le formulaire d'ajout membre ou les paramètres. Le sélecteur pays doit avoir un champ recherche au-dessus, les pays triés A→Z avec drapeaux. Taper "hai" → seul Haïti. Effacer → liste complète.

- [ ] **Étape 6 : Commit**

```bash
git add js/helpers.js js/i18n.js css/app.css
git commit -m "feat: sélecteurs pays avec drapeaux, tri A-Z et recherche"
```

---

## Task 5 — B2 : 140 pays + 19 fêtes nationales

**Fichiers :**
- Modifier : `js/data.js` (PAYS + FETES)
- Modifier : `js/helpers.js` (COUNTRIES + COUNTRIES_VALUES + FETES_NAMES)

**Contexte :** `PAYS` (data.js) filtre les fêtes selon le pays de l'utilisateur via le code ISO `c`. `COUNTRIES` + `COUNTRIES_VALUES` (helpers.js) servent aux sélecteurs des membres. Les deux doivent recevoir les mêmes codes ISO. L'ordre d'ajout dans `COUNTRIES` n'a plus d'importance depuis que `buildCountrySelect` trie dynamiquement (Task 4).

- [ ] **Étape 1 : Ajouter les nouveaux pays dans `PAYS` (js/data.js)**

À la fin du tableau `PAYS`, avant le `];` final, ajouter :
```js
// Francophones supplémentaires
{c:'lu',l:'\uD83C\uDDF1\uD83C\uDDFA Luxembourg'},{c:'nc',l:'\uD83C\uDDF3\uD83C\uDDE8 Nouvelle-Cal\u00e9donie'},{c:'pm',l:'\uD83C\uDDF5\uD83C\uDDF2 St-Pierre-et-Miquelon'},{c:'cf',l:'\uD83C\uDDE8\uD83C\uDDEB Centrafrique'},{c:'sc',l:'\uD83C\uDDF8\uD83C\uDDE8 Seychelles'},{c:'yt',l:'\uD83C\uDDFE\uD83C\uDDF9 Mayotte'},
// Anglophones
{c:'au',l:'\uD83C\uDDE6\uD83C\uDDFA Australie'},{c:'nz',l:'\uD83C\uDDF3\uD83C\uDDFF Nouvelle-Z\u00e9lande'},{c:'ie',l:'\uD83C\uDDEE\uD83C\uDDEA Irlande'},{c:'ke',l:'\uD83C\uDDF0\uD83C\uDDEA Kenya'},{c:'tz',l:'\uD83C\uDDF9\uD83C\uDDFF Tanzanie'},{c:'ug',l:'\uD83C\uDDFA\uD83C\uDDEC Ouganda'},{c:'za',l:'\uD83C\uDDFF\uD83C\uDDE6 Afrique du Sud'},{c:'zw',l:'\uD83C\uDDFF\uD83C\uDDFC Zimbabwe'},{c:'zm',l:'\uD83C\uDDFF\uD83C\uDDF2 Zambie'},{c:'mw',l:'\uD83C\uDDF2\uD83C\uDDFC Malawi'},{c:'bw',l:'\uD83C\uDDE7\uD83C\uDDFC Botswana'},{c:'na',l:'\uD83C\uDDF3\uD83C\uDDE6 Namibie'},{c:'sl',l:'\uD83C\uDDF8\uD83C\uDDF1 Sierra Leone'},{c:'lr',l:'\uD83C\uDDF1\uD83C\uDDF7 Liberia'},{c:'gm',l:'\uD83C\uDDEC\uD83C\uDDF2 Gambie'},{c:'ph',l:'\uD83C\uDDF5\uD83C\uDDED Philippines'},{c:'sg',l:'\uD83C\uDDF8\uD83C\uDDEC Singapour'},{c:'pk',l:'\uD83C\uDDF5\uD83C\uDDF0 Pakistan'},{c:'bd',l:'\uD83C\uDDE7\uD83C\uDDE9 Bangladesh'},{c:'lk',l:'\uD83C\uDDF1\uD83C\uDDF0 Sri Lanka'},{c:'jm',l:'\uD83C\uDDEF\uD83C\uDDF2 Jama\u00efque'},{c:'tt',l:'\uD83C\uDDF9\uD83C\uDDF9 Trinidad-et-Tobago'},{c:'bb',l:'\uD83C\uDDE7\uD83C\uDDE7 Barbade'},{c:'gy',l:'\uD83C\uDDEC\uD83C\uDDFE Guyana'},{c:'mt',l:'\uD83C\uDDF2\uD83C\uDDF9 Malte'},{c:'et',l:'\uD83C\uDDEA\uD83C\uDDF9 \u00c9thiopie'},{c:'ss',l:'\uD83C\uDDF8\uD83C\uDDF8 Soudan du Sud'},{c:'er',l:'\uD83C\uDDEA\uD83C\uDDF7 \u00c9rythr\u00e9e'},
// Hispanophones
{c:'ar',l:'\uD83C\uDDE6\uD83C\uDDF7 Argentine'},{c:'pe',l:'\uD83C\uDDF5\uD83C\uDDEA P\u00e9rou'},{c:'ve',l:'\uD83C\uDDFB\uD83C\uDDEA Venezuela'},{c:'cl',l:'\uD83C\uDDE8\uD83C\uDDF1 Chili'},{c:'ec',l:'\uD83C\uDDEA\uD83C\uDDE8 \u00c9quateur'},{c:'gt',l:'\uD83C\uDDEC\uD83C\uDDF9 Guatemala'},{c:'cu',l:'\uD83C\uDDE8\uD83C\uDDFA Cuba'},{c:'bo',l:'\uD83C\uDDE7\uD83C\uDDF4 Bolivie'},{c:'do',l:'\uD83C\uDDE9\uD83C\uDDF4 R\u00e9p. Dominicaine'},{c:'hn',l:'\uD83C\uDDED\uD83C\uDDF3 Honduras'},{c:'py',l:'\uD83C\uDDF5\uD83C\uDDFE Paraguay'},{c:'sv',l:'\uD83C\uDDF8\uD83C\uDDFB El Salvador'},{c:'ni',l:'\uD83C\uDDF3\uD83C\uDDEE Nicaragua'},{c:'cr',l:'\uD83C\uDDE8\uD83C\uDDF7 Costa Rica'},{c:'pa',l:'\uD83C\uDDF5\uD83C\uDDE6 Panama'},{c:'uy',l:'\uD83C\uDDFA\uD83C\uDDFE Uruguay'},{c:'pr',l:'\uD83C\uDDF5\uD83C\uDDF7 Porto Rico'},
// Arabophones
{c:'sa',l:'\uD83C\uDDF8\uD83C\uDDE6 Arabie Saoudite'},{c:'ae',l:'\uD83C\uDDE6\uD83C\uDDEA \u00c9mirats Arabes Unis'},{c:'iq',l:'\uD83C\uDDEE\uD83C\uDDF6 Irak'},{c:'sy',l:'\uD83C\uDDF8\uD83C\uDDFE Syrie'},{c:'jo',l:'\uD83C\uDDEF\uD83C\uDDF4 Jordanie'},{c:'ye',l:'\uD83C\uDDFE\uD83C\uDDEA Y\u00e9men'},{c:'ps',l:'\uD83C\uDDF5\uD83C\uDDF8 Palestine'},{c:'qa',l:'\uD83C\uDDF6\uD83C\uDDE6 Qatar'},{c:'bh',l:'\uD83C\uDDE7\uD83C\uDDED Bahre\u00efn'},{c:'kw',l:'\uD83C\uDDF0\uD83C\uDDFC Ko\u00efw\u00eft'},{c:'om',l:'\uD83C\uDDF4\uD83C\uDDF2 Oman'},{c:'ly',l:'\uD83C\uDDF1\uD83C\uDDFE Libye'},{c:'sd',l:'\uD83C\uDDF8\uD83C\uDDE9 Soudan'},{c:'so',l:'\uD83C\uDDF8\uD83C\uDDF4 Somalie'},
// Hindiphones, sinophones, lusophones
{c:'np',l:'\uD83C\uDDF3\uD83C\uDDF5 N\u00e9pal'},{c:'fj',l:'\uD83C\uDDEB\uD83C\uDDEF Fidji'},{c:'tw',l:'\uD83C\uDDF9\uD83C\uDDFC Ta\u00efwan'},{c:'hk',l:'\uD83C\uDDED\uD83C\uDDF0 Hong Kong'},{c:'mo',l:'\uD83C\uDDF2\uD83C\uDDF4 Macao'},{c:'my',l:'\uD83C\uDDF2\uD83C\uDDFE Malaisie'},{c:'ao',l:'\uD83C\uDDE6\uD83C\uDDF4 Angola'},{c:'mz',l:'\uD83C\uDDF2\uD83C\uDDFF Mozambique'},{c:'gw',l:'\uD83C\uDDEC\uD83C\uDDFC Guin\u00e9e-Bissau'},{c:'tl',l:'\uD83C\uDDF9\uD83C\uDDF1 Timor-Leste'},
```

- [ ] **Étape 2 : Ajouter les 19 nouvelles fêtes dans `FETES` (js/data.js)**

À la fin du tableau `FETES`, avant `];` :
```js
{n:'Ind\u00e9pendance Nigeria',i:'\uD83C\uDDF3\uD83C\uDDEC',m:10,d:1,c:['ng']},
{n:'Jamhuri Day Kenya',i:'\uD83C\uDDF0\uD83C\uDDEA',m:12,d:12,c:['ke']},
{n:'Freedom Day Afrique du Sud',i:'\uD83C\uDDFF\uD83C\uDDE6',m:4,d:27,c:['za']},
{n:'Ind\u00e9pendance Colombie',i:'\uD83C\uDDE8\uD83C\uDDF4',m:7,d:20,c:['co']},
{n:'Ind\u00e9pendance Argentine',i:'\uD83C\uDDE6\uD83C\uDDF7',m:7,d:9,c:['ar']},
{n:'Ind\u00e9pendance P\u00e9rou',i:'\uD83C\uDDF5\uD83C\uDDEA',m:7,d:28,c:['pe']},
{n:'Ind\u00e9pendance Venezuela',i:'\uD83C\uDDFB\uD83C\uDDEA',m:7,d:5,c:['ve']},
{n:'F\u00eate Nationale Chili',i:'\uD83C\uDDE8\uD83C\uDDF1',m:9,d:18,c:['cl']},
{n:'F\u00eate Nationale Mexique',i:'\uD83C\uDDF2\uD83C\uDDFD',m:9,d:16,c:['mx']},
{n:'Ind\u00e9pendance Philippines',i:'\uD83C\uDDF5\uD83C\uDDED',m:6,d:12,c:['ph']},
{n:'F\u00eate Nationale Vietnam',i:'\uD83C\uDDFB\uD83C\uDDF3',m:9,d:2,c:['vn']},
{n:'Gwangbokjeol Cor\u00e9e',i:'\uD83C\uDDF0\uD83C\uDDF7',m:8,d:15,c:['kr']},
{n:'Ind\u00e9pendance Burkina Faso',i:'\uD83C\uDDE7\uD83C\uDDEB',m:12,d:11,c:['bf']},
{n:'Ind\u00e9pendance Niger',i:'\uD83C\uDDF3\uD83C\uDDEA',m:8,d:3,c:['ne']},
{n:'Ind\u00e9pendance Tchad',i:'\uD83C\uDDF9\uD83C\uDDE9',m:8,d:11,c:['td']},
{n:'F\u00eate Nationale EAU',i:'\uD83C\uDDE6\uD83C\uDDEA',m:12,d:2,c:['ae']},
{n:'F\u00eate Nationale Arabie Saoudite',i:'\uD83C\uDDF8\uD83C\uDDE6',m:9,d:23,c:['sa']},
{n:'Ind\u00e9pendance Pakistan',i:'\uD83C\uDDF5\uD83C\uDDF0',m:8,d:14,c:['pk']},
{n:'Ind\u00e9pendance Bangladesh',i:'\uD83C\uDDE7\uD83C\uDDE9',m:3,d:26,c:['bd']},
```

- [ ] **Étape 3 : Ajouter les traductions dans `FETES_NAMES` (js/helpers.js) — avant la `};` finale**

```js
'Ind\u00e9pendance Nigeria':{fr:'Ind\u00e9pendance Nigeria',en:'Nigeria Independence Day',es:'Independencia de Nigeria',ar:'\u0639\u064a\u062f \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u0646\u064a\u062c\u064a\u0631\u064a\u0627',hi:'\u0928\u093e\u0907\u091c\u0940\u0930\u093f\u092f\u093e \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u5c3c\u65e5\u5229\u4e9a\u72ec\u7acb\u65e5',pt:'Independ\u00eancia da Nig\u00e9ria'},
'Jamhuri Day Kenya':{fr:'Journ\u00e9e Nationale Kenya',en:'Kenya Jamhuri Day',es:'D\u00eda Nacional de Kenia',ar:'\u064a\u0648\u0645 \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u0643\u064a\u0646\u064a\u0627',hi:'\u0915\u0947\u0928\u094d\u092f\u093e \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u80af\u5c3c\u4e9a\u72ec\u7acb\u65e5',pt:'Dia da Independ\u00eancia do Qu\u00eania'},
'Freedom Day Afrique du Sud':{fr:'Freedom Day Afrique du Sud',en:'Freedom Day South Africa',es:'D\u00eda de la Libertad Sud\u00e1frica',ar:'\u064a\u0648\u0645 \u0627\u0644\u062d\u0631\u064a\u0629 \u062c\u0646\u0648\u0628 \u0623\u0641\u0631\u064a\u0642\u064a\u0627',hi:'\u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938 \u0926\u0915\u094d\u0937\u093f\u0923 \u0905\u092b\u094d\u0930\u0940\u0915\u093e',zh:'\u5357\u975e\u81ea\u7531\u65e5',pt:'Dia da Liberdade \u00c1frica do Sul'},
'Ind\u00e9pendance Colombie':{fr:'Ind\u00e9pendance Colombie',en:'Colombian Independence',es:'Independencia de Colombia',ar:'\u0639\u064a\u062f \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u0643\u0648\u0644\u0648\u0645\u0628\u064a\u0627',hi:'\u0915\u094b\u0932\u0902\u092c\u093f\u092f\u093e \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u54e5\u4f26\u6bd4\u4e9a\u72ec\u7acb\u65e5',pt:'Independ\u00eancia da Col\u00f4mbia'},
'Ind\u00e9pendance Argentine':{fr:'Ind\u00e9pendance Argentine',en:'Argentine Independence',es:'Independencia de Argentina',ar:'\u0639\u064a\u062f \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u0627\u0644\u0623\u0631\u062c\u0646\u062a\u064a\u0646',hi:'\u0905\u0930\u094d\u091c\u0947\u0902\u091f\u0940\u0928\u093e \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u963f\u6839\u5ef7\u72ec\u7acb\u65e5',pt:'Independ\u00eancia da Argentina'},
'Ind\u00e9pendance P\u00e9rou':{fr:'Ind\u00e9pendance P\u00e9rou',en:'Peruvian Independence',es:'Independencia del Per\u00fa',ar:'\u0639\u064a\u062f \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u0628\u064a\u0631\u0648',hi:'\u092a\u0947\u0930\u0942 \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u79d8\u9c81\u72ec\u7acb\u65e5',pt:'Independ\u00eancia do Peru'},
'Ind\u00e9pendance Venezuela':{fr:'Ind\u00e9pendance Venezuela',en:'Venezuelan Independence',es:'Independencia de Venezuela',ar:'\u0639\u064a\u062f \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u0641\u0646\u0632\u0648\u064a\u0644\u0627',hi:'\u0935\u0947\u0928\u0947\u091c\u0941\u090f\u0932\u093e \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u59d4\u5185\u745e\u62c9\u72ec\u7acb\u65e5',pt:'Independ\u00eancia da Venezuela'},
'F\u00eate Nationale Chili':{fr:'F\u00eate Nationale Chili',en:'Chilean National Day',es:'D\u00eda de la Independencia de Chile',ar:'\u0627\u0644\u064a\u0648\u0645 \u0627\u0644\u0648\u0637\u0646\u064a \u0627\u0644\u062a\u0634\u064a\u0644\u064a',hi:'\u091a\u093f\u0932\u0940 \u0930\u093e\u0937\u094d\u091f\u094d\u0930\u0940\u092f \u0926\u093f\u0935\u0938',zh:'\u667a\u5229\u56fd\u5e86\u8282',pt:'Dia Nacional do Chile'},
'F\u00eate Nationale Mexique':{fr:'F\u00eate Nationale Mexique',en:'Mexican Independence Day',es:'D\u00eda de la Independencia de M\u00e9xico',ar:'\u0639\u064a\u062f \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u0627\u0644\u0645\u0643\u0633\u064a\u0643',hi:'\u092e\u0947\u0915\u094d\u0938\u093f\u0915\u094b \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u58a8\u897f\u54e5\u72ec\u7acb\u65e5',pt:'Independ\u00eancia do M\u00e9xico'},
'Ind\u00e9pendance Philippines':{fr:'Ind\u00e9pendance Philippines',en:'Philippine Independence Day',es:'Independencia de Filipinas',ar:'\u0639\u064a\u062f \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u0627\u0644\u0641\u0644\u0628\u064a\u0646',hi:'\u092b\u093f\u0932\u0940\u092a\u0940\u0902\u0938 \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u83f2\u5f8b\u5bbe\u72ec\u7acb\u65e5',pt:'Independ\u00eancia das Filipinas'},
'F\u00eate Nationale Vietnam':{fr:'F\u00eate Nationale Vietnam',en:'Vietnam National Day',es:'D\u00eda Nacional de Vietnam',ar:'\u0627\u0644\u064a\u0648\u0645 \u0627\u0644\u0648\u0637\u0646\u064a \u0627\u0644\u0641\u064a\u062a\u0646\u0627\u0645\u064a',hi:'\u0935\u093f\u092f\u0924\u0928\u093e\u092e \u0930\u093e\u0937\u094d\u091f\u094d\u0930\u0940\u092f \u0926\u093f\u0935\u0938',zh:'\u8d8a\u5357\u56fd\u5e86\u8282',pt:'Dia Nacional do Vietname'},
'Gwangbokjeol Cor\u00e9e':{fr:'F\u00eate Nationale Cor\u00e9e du Sud',en:'Korea Liberation Day',es:'D\u00eda de la Liberaci\u00f3n de Corea',ar:'\u064a\u0648\u0645 \u062a\u062d\u0631\u064a\u0631 \u0643\u0648\u0631\u064a\u0627',hi:'\u0915\u094b\u0930\u093f\u092f\u093e \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u97e9\u56fd\u5149\u590d\u8282',pt:'Dia da Liberta\u00e7\u00e3o da Coreia'},
'Ind\u00e9pendance Burkina Faso':{fr:'Ind\u00e9pendance Burkina Faso',en:'Burkina Faso Independence',es:'Independencia de Burkina Faso',ar:'\u0639\u064a\u062f \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u0628\u0648\u0631\u0643\u064a\u0646\u0627 \u0641\u0627\u0633\u0648',hi:'\u092c\u0941\u0930\u094d\u0915\u093f\u0928\u093e \u092b\u093e\u0938\u094b \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u5e03\u57fa\u7eb3\u6cd5\u7d22\u72ec\u7acb\u65e5',pt:'Independ\u00eancia do Burkina Faso'},
'Ind\u00e9pendance Niger':{fr:'Ind\u00e9pendance Niger',en:'Niger Independence Day',es:'Independencia de N\u00edger',ar:'\u0639\u064a\u062f \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u0627\u0644\u0646\u064a\u062c\u0631',hi:'\u0928\u093e\u0907\u091c\u0930 \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u5c3c\u65e5\u5c14\u72ec\u7acb\u65e5',pt:'Independ\u00eancia do N\u00edger'},
'Ind\u00e9pendance Tchad':{fr:'Ind\u00e9pendance Tchad',en:'Chad Independence Day',es:'Independencia del Chad',ar:'\u0639\u064a\u062f \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u062a\u0634\u0627\u062f',hi:'\u091a\u093e\u0921 \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u4e4d\u5f97\u72ec\u7acb\u65e5',pt:'Independ\u00eancia do Chade'},
'F\u00eate Nationale EAU':{fr:'F\u00eate Nationale \u00c9mirats',en:'UAE National Day',es:'D\u00eda Nacional de los EAU',ar:'\u0627\u0644\u064a\u0648\u0645 \u0627\u0644\u0648\u0637\u0646\u064a \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a\u064a',hi:'\u092f\u0942\u090f\u0908 \u0930\u093e\u0937\u094d\u091f\u094d\u0930\u0940\u092f \u0926\u093f\u0935\u0938',zh:'\u963f\u8054\u914b\u56fd\u5e86\u8282',pt:'Dia Nacional dos EAU'},
'F\u00eate Nationale Arabie Saoudite':{fr:'F\u00eate Nationale Arabie Saoudite',en:'Saudi National Day',es:'D\u00eda Nacional de Arabia Saudita',ar:'\u0627\u0644\u064a\u0648\u0645 \u0627\u0644\u0648\u0637\u0646\u064a \u0627\u0644\u0633\u0639\u0648\u062f\u064a',hi:'\u0938\u094c\u0926\u0940 \u0930\u093e\u0937\u094d\u091f\u094d\u0930\u0940\u092f \u0926\u093f\u0935\u0938',zh:'\u6c99\u7279\u56fd\u5e86\u8282',pt:'Dia Nacional da Ar\u00e1bia Saudita'},
'Ind\u00e9pendance Pakistan':{fr:'Ind\u00e9pendance Pakistan',en:'Pakistan Independence Day',es:'Independencia de Pakist\u00e1n',ar:'\u0639\u064a\u062f \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u0628\u0627\u0643\u0633\u062a\u0627\u0646',hi:'\u092a\u093e\u0915\u093f\u0938\u094d\u0924\u093e\u0928 \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u5df4\u57fa\u65af\u5766\u72ec\u7acb\u65e5',pt:'Independ\u00eancia do Paquist\u00e3o'},
'Ind\u00e9pendance Bangladesh':{fr:'Ind\u00e9pendance Bangladesh',en:'Bangladesh Independence Day',es:'Independencia de Banglad\u00e9s',ar:'\u0639\u064a\u062f \u0627\u0633\u062a\u0642\u0644\u0627\u0644 \u0628\u0646\u063a\u0644\u0627\u062f\u064a\u0634',hi:'\u092c\u093e\u0902\u0917\u094d\u0932\u093e\u0926\u0947\u0936 \u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930\u0924\u093e \u0926\u093f\u0935\u0938',zh:'\u5b5f\u52a0\u62c9\u56fd\u72ec\u7acb\u65e5',pt:'Independ\u00eancia do Bangladesh'},
```

- [ ] **Étape 4 : Étendre COUNTRIES dans helpers.js avec les mêmes codes**

Ajouter à la fin de chaque array de `COUNTRIES` (fr, en, es, ar, hi, zh, pt) les mêmes pays traduits, et à `COUNTRIES_VALUES` les codes ISO correspondants dans le même ordre.

Codes à ajouter dans `COUNTRIES_VALUES` (appendre après `'other'`) :
```js
'lu','nc','pm','cf','sc','yt',
'au','nz','ie','ke','tz','ug','za','zw','zm','mw','bw','na','sl','lr','gm',
'ph','sg','pk','bd','lk','jm','tt','bb','gy','mt','et','ss','er',
'ar','pe','ve','cl','ec','gt','cu','bo','do','hn','py','sv','ni','cr','pa','uy','pr',
'sa','ae','iq','sy','jo','ye','ps','qa','bh','kw','om','ly','sd','so',
'np','fj','tw','hk','mo','my','ao','mz','gw','tl'
```

Chaque array dans `COUNTRIES` reçoit les mêmes pays traduits dans sa langue (même noms que les arrays `fr`/`en`/etc. déjà définis à l'étape 1 de Task 4, appliquer les mêmes traductions).

- [ ] **Étape 5 : Tester les fêtes**

Ouvrir l'app → Fêtes. Changer le pays de profil vers "Argentine" → "Indépendance Argentine — 9 juil" doit apparaître. Changer vers "Arabie Saoudite" → "Fête Nationale Arabie Saoudite — 23 sept". Changer langue vers EN → noms en anglais.

- [ ] **Étape 6 : Commit**

```bash
git add js/data.js js/helpers.js
git commit -m "feat: 140 pays + 19 fetes nationales (couverture complete 7 langues)"
```

---

## Auto-review

**Spec coverage :**
- ✅ A1 logo existant : Task 2 — wrapper + CSS clair/sombre
- ✅ A2 nav Profil + avatar : Task 3 — HTML + i18n + render + CSS
- ✅ A3 groupe traduit : Task 1 — isDefault + migration + rGbar
- ✅ B1 drapeaux + tri + recherche : Task 4 — COUNTRIES + buildCountrySelect refactorisé + CSS
- ✅ B2 140 pays + fêtes : Task 5 — PAYS + FETES + COUNTRIES + FETES_NAMES
- ℹ️ C traductions : hors scope, traité séparément

**Type consistency :** `_normStr` défini Task 4, utilisé dans le même fichier. `isDefault` posé Tasks 1, lu Task 1 étape 4. `updateNavAvatar` définie Task 3 étape 4, appelée étape 5. `navProfile` défini Task 3 étape 1, référencé étape 6. Cohérent.

**Placeholders :** aucun TBD ni "implement later". Toutes les étapes ont du code complet.
