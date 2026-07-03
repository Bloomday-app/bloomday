# Spec : Messages authentiques, fallbacks enrichis et sélecteur de ton contextuel

**Date :** 2026-07-03  
**Statut :** Approuvé  
**Dépend de :** `2026-06-11-message-generation-enriched-prompts-design.md` (déjà implémenté)

---

## Contexte

`buildMsgPrompt()` existe déjà (render.js:1393) et structure bien les prompts par type d'événement. Deux problèmes persistent :

1. **Prompt trop court** : la ligne finale `"Écris N phrases courtes et percutantes"` pousse l'IA à produire des phrases très brèves — "courtes" contredit la cible "3 à 5 phrases". Les messages générés restent génériques (1-2 phrases).
2. **Fallback insuffisant** : quand l'IA échoue (quota, timeout), `getFallback('birthday')` est toujours appelé — même pour un mariage. Les messages fallback sont des phrases uniques génériques.
3. **UX ton** : le sélecteur de ton (chips DTPL) n'est visible que dans la section "Aujourd'hui". Les cartes "À préparer" génèrent directement avec le ton global sans que l'utilisateur puisse choisir.

---

## Design

### 1. Amélioration de `buildMsgPrompt()` — render.js

#### 1a. Remplacement de la ligne de contrainte finale

**Avant (render.js:1450) :**
```
"Écris " + lengthTarget + " courtes et percutantes. Commence directement par le message, sans guillemets, sans titre, sans explication."
```

**Après :**
```
"Écris " + lengthTarget + " authentiques et sincères. Commence par un souhait personnel, évoque ensuite quelque chose de spécifique à cette personne ou à cette occasion, et termine sur une note d'avenir ou d'affection. Commence directement par le message, sans guillemets, sans titre, sans explication."
```

#### 1b. Suggestion de signification du prénom

Ajouter dans le bloc commun (après la ligne de `note`, avant `prevMsgs`) :

```javascript
var firstName = p.name.split(' ')[0];
lines.push("Si tu connais la signification ou l'origine du prénom " + firstName + ", tu peux l'intégrer subtilement dans le message — mais seulement si c'est naturel.");
```

#### 1c. Mariage — adresse directe avec "vous"

Ajouter dans le bloc `wedding` (après "Célèbre leur parcours commun...") :

```javascript
lines.push("Adresse-toi directement au couple en utilisant 'vous'.");
```

---

### 2. Nouveaux messages fallback — data.js et i18n.js

#### 2a. `getFallback()` dans data.js — ajout du type `'wedding'`

```javascript
function getFallback(type) {
  if (typeof t === 'function') {
    var keys = type === 'fete'
      ? ['fallbackFete1', 'fallbackFete2']
      : type === 'wedding'
      ? ['fallbackWedding1', 'fallbackWedding2']
      : ['fallbackBirthday1', 'fallbackBirthday2', 'fallbackBirthday3'];
    var msgs = keys.map(function(k) { var v = t(k); return v !== k ? v : null; }).filter(Boolean);
    if (msgs.length) return msgs[Math.floor(Math.random() * msgs.length)];
  }
  var m = FALLBACK[type] || FALLBACK.birthday;
  return m[Math.floor(Math.random() * m.length)];
}
```

#### 2b. Nouveaux messages fallback dans `FALLBACK` (data.js, français seulement — les autres langues dans i18n.js)

**birthday** (3 variantes, 3-4 phrases, ton chaleureux entre amis) :
```
fallbackBirthday1: "Joyeux anniversaire ! Je pense fort à toi en ce jour si particulier. J'espère que tu passes une journée aussi belle et lumineuse que tu l'es. Que cette nouvelle année t'apporte exactement ce dont tu as besoin. 🎂🌸"

fallbackBirthday2: "Aujourd'hui c'est ton jour, et je voulais juste te dire à quel point je suis heureux·se de t'avoir dans ma vie. Tu mérites tout le bonheur du monde. Passe une journée inoubliable entouré·e de ceux que tu aimes. 🌺✨"

fallbackBirthday3: "Un an de plus, et tu n'as jamais été aussi toi-même — c'est ce que j'admire le plus chez toi. Joyeux anniversaire ! Que cette année soit riche en belles surprises, en rires et en moments qui comptent vraiment. 💫🎉"
```

**wedding** (2 variantes, 3-4 phrases, "vous", ton chaleureux) :
```
fallbackWedding1: "Joyeux anniversaire de mariage ! Vous formez un couple qui inspire — votre complicité, votre façon d'être là l'un pour l'autre, c'est quelque chose de rare et de beau. Nous sommes si heureux de célébrer cette nouvelle année ensemble avec vous. Que votre amour continue de s'épanouir encore longtemps. 💍🌸"

fallbackWedding2: "Quel bonheur de penser à vous aujourd'hui ! Chaque année qui passe semble avoir renforcé ce lien magnifique que vous partagez. Merci d'être un exemple de ce que l'amour peut construire avec du temps, de la confiance et de la tendresse. Joyeux anniversaire à vous deux ! 💕✨"
```

**fete** (2 variantes, améliorées) :
```
fallbackFete1: "En ce jour de fête, toutes mes pensées sont pour toi. J'espère que cette journée sera à la hauteur de ce que tu mérites — lumineuse, joyeuse et pleine de belles personnes. Profite de chaque instant ! 🎊🌸"

fallbackFete2: "Quelle belle occasion de célébrer et de partager un moment de joie ! Je te souhaite une fête mémorable, entouré·e de ceux qui comptent vraiment pour toi. 🥳✨"
```

#### 2c. Même contenu traduit dans `i18n.js` pour les 7 langues

Ajouter les clés `fallbackWedding1` et `fallbackWedding2` dans chaque bloc langue. Réécrire `fallbackBirthday1/2/3` et `fallbackFete1/2` pour chaque langue avec le même esprit (3-4 phrases, authentiques).

Langues : `fr`, `en`, `es`, `ar`, `hi`, `zh`, `pt`.

---

### 3. `genMsg()` — passer le type à `getFallback()`

**Avant (render.js:1487) :**
```javascript
el.innerHTML = '<div ...>' + esc(getFallback('birthday')) + '</div>';
```

**Après :**
```javascript
var fbType = (p.type === 'wedding') ? 'wedding' : (p.type === 'fete') ? 'fete' : 'birthday';
el.innerHTML = '<div ...>' + esc(getFallback(fbType)) + '</div>';
```

---

### 4. Sélecteur de ton avant génération — UX cartes "À préparer"

#### Comportement

Dans les cartes "à préparer" (sections `i===0` et cartes dépliées), le clic sur **"Préparer →"** ne lance plus l'IA directement. Il affiche à la place un sélecteur de ton inline.

**Flow :**
1. Clic sur "Préparer →" → la zone `prep-{id}` affiche les chips de ton (DTPL complet)
2. Clic sur un chip → génère le message avec ce ton via `genMsgWithTpl(id, elId, tplId)`
3. Un bouton "→ Générer avec ton par défaut" est affiché en dessous des chips pour ceux qui veulent sauter l'étape

#### Implémentation

Nouvelle fonction `showTonePicker(id, elId)` dans render.js :

```javascript
function showTonePicker(id, elId) {
  var el = document.getElementById(elId); if (!el) return;
  var h = '<div style="padding:8px 0">';
  h += '<div style="font-size:11px;color:var(--txt2);margin-bottom:8px">' + t('chooseTone') + '</div>';
  h += '<div class="chips" style="margin-bottom:8px">';
  DTPL.forEach(function(tp) {
    h += '<button class="chip" onclick="genMsgWithTpl(\'' + id + '\',\'' + elId + '\',\'' + tp.id + '\')">' + tp.e + ' ' + tp.n + '</button>';
  });
  h += '</div>';
  h += '<button class="btn G sm fw" onclick="genMsg(\'' + id + '\',\'' + elId + '\')">' + t('generateDefault') + '</button>';
  h += '</div>';
  el.innerHTML = h;
}
```

Nouvelle fonction `genMsgWithTpl(id, elId, tplId)` : identique à `genMsg` mais reçoit `tplId` en paramètre et l'utilise au lieu de `actTpl` pour la sélection du template — **sans modifier la variable globale `actTpl`**. Concrètement : `var tpl = DTPL.find(function(x){return x.id===tplId;}) || DTPL[0];` au lieu de la ligne qui lit `actTpl`.

**Périmètre UX :** Le sélecteur de ton s'applique uniquement aux cartes "À préparer" (blocs `prep-{id}` dans les sections `i===0` et cartes dépliées, render.js:207 et 237). La section "7 jours" (render.js:263) conserve l'appel direct à `genMsg` — elle a déjà le sélecteur global DTPL visible dans la section "Aujourd'hui".

Le bouton "Préparer →" dans les cartes prep change de `onclick="genMsg(...)"` en `onclick="showTonePicker(...)"`.

#### Clés i18n à ajouter

```
chooseTone: "Quel ton pour ce message ?"  (+ 6 traductions)
generateDefault: "Générer avec le ton par défaut"  (+ 6 traductions)
```

---

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `js/render.js` | `buildMsgPrompt()` : ligne finale, prénom, "vous" mariage ; `genMsg()` : fallback typé ; `showTonePicker()` : nouvelle fonction ; `genMsgWithTpl()` : nouvelle fonction ; boutons prep |
| `js/data.js` | `FALLBACK` : nouveaux messages birthday/wedding/fete 3-4 phrases ; `getFallback()` : type wedding |
| `js/i18n.js` | Clés `fallbackBirthday1/2/3`, `fallbackFete1/2`, `fallbackWedding1/2` enrichies dans 7 langues + clés `chooseTone`, `generateDefault` |
| `netlify/functions/generate-message.js` | Aucun changement nécessaire |

---

## Critères de succès

- Un message généré par l'IA pour un anniversaire normal fait 3-4 phrases authentiques, pas des clichés
- Un message généré pour un mariage utilise "vous" et s'adresse au couple
- Le fallback mariage affiche un message en "vous" qui parle du couple
- Dans une carte "À préparer", cliquer "Préparer →" affiche le sélecteur de ton avant de générer
- Toutes les clés i18n sont présentes dans les 7 langues (vérifiable via `/i18n-check`)
