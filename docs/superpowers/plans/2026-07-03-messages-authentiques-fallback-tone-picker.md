# Messages authentiques, fallbacks enrichis et tone picker — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre les messages Bloomday plus authentiques et humains (3-5 phrases sincères), corriger les fallbacks mariage pour adresser le couple avec "vous", et ajouter un sélecteur de ton inline dans les cartes "À préparer".

**Architecture:** 4 fichiers touchés — `render.js` pour la logique de génération et le nouveau UX tone picker, `data.js` pour les messages fallback français, `i18n.js` pour les messages dans les 7 langues et les nouvelles clés, aucun changement côté serveur.

**Tech Stack:** Vanilla JS ES6+ natif, système i18n custom (`t('clé')`), pas de bundler ni de transpilation.

## Global Constraints

- Toute string visible utilisateur passe par `t('clé')` — jamais de texte hardcodé en HTML/JS
- Nouvelles clés i18n doivent exister dans les 7 langues : `fr`, `en`, `es`, `ar`, `hi`, `zh`, `pt`
- Après chaque modification JS : `node --check js/<fichier>.js`
- Fichiers JS en ES6+ natif : pas d'import/export, tout est global
- Ne pas modifier une fonction sans vérifier ses appelants

---

### Task 1 : Améliorer `buildMsgPrompt()` — render.js

**Files:**
- Modify: `js/render.js:1401-1452`

**Interfaces:**
- Consumes: `p.type`, `p.name`, `p.note` (contact object)
- Produces: prompt string enrichi, utilisé par `genMsg()` (Task 4)

- [ ] **Step 1 : Ajouter "vous" pour le mariage**

Dans `render.js`, après la ligne 1407 (`lines.push("Célèbre leur parcours commun...")`), ajouter :

```javascript
    lines.push("Adresse-toi directement au couple en utilisant 'vous'.");
```

Résultat attendu dans le bloc `wedding` (lignes 1401–1407+) :
```javascript
  if (p.type === 'wedding') {
    var couple = wname(p);
    lines.push("Génère en " + lang + " un message " + tpl.t + " pour l'anniversaire de mariage de " + couple + ".");
    if (age && isTod)  lines.push("Ils célèbrent " + age + " an" + (age > 1 ? 's' : '') + " de mariage aujourd'hui.");
    else if (age)      lines.push("Ils vont fêter " + age + " an" + (age > 1 ? 's' : '') + " de mariage.");
    else if (isTod)    lines.push("C'est leur anniversaire de mariage aujourd'hui.");
    lines.push("Célèbre leur parcours commun, leur amour et ce qu'ils ont construit ensemble.");
    lines.push("Adresse-toi directement au couple en utilisant 'vous'.");
```

- [ ] **Step 2 : Ajouter le hint signification du prénom**

Après le bloc `if (p.note)` (ligne ~1439) et avant le bloc `if (prevMsgs)` (ligne ~1442), ajouter :

```javascript
  var firstName = p.type === 'wedding' ? '' : p.name.split(' ')[0];
  if (firstName) {
    lines.push("Si tu connais la signification ou l'origine du prénom " + firstName + ", intègre-la subtilement dans le message — uniquement si c'est naturel et pertinent.");
  }
```

- [ ] **Step 3 : Remplacer la ligne de contrainte finale**

Remplacer la ligne 1450 :
```javascript
// AVANT
  lines.push("Écris " + lengthTarget + " courtes et percutantes. Commence directement par le message, sans guillemets, sans titre, sans explication.");

// APRÈS
  lines.push("Écris " + lengthTarget + " authentiques et sincères, comme si tu écrivais à quelqu'un que tu aimes vraiment. Commence par un souhait personnel, évoque quelque chose de spécifique à cette personne ou à cette occasion, et termine sur une note d'affection ou d'avenir. Commence directement par le message, sans guillemets, sans titre, sans explication.");
```

- [ ] **Step 4 : Vérifier la syntaxe**

```bash
node --check js/render.js
```
Attendu : aucune sortie (= pas d'erreur)

- [ ] **Step 5 : Commit**

```bash
git add js/render.js
git commit -m "feat(messages): prompt plus authentique — prénom, vous mariage, ton sincère"
```

---

### Task 2 : Mettre à jour `FALLBACK` et `getFallback()` — data.js

**Files:**
- Modify: `js/data.js:1-19`

**Interfaces:**
- Produces: `getFallback(type)` — accepte désormais `'birthday'`, `'wedding'`, `'fete'`
- Consumed by: `genMsg()` catch block (Task 4)

- [ ] **Step 1 : Remplacer le bloc FALLBACK et getFallback**

Remplacer les lignes 1–19 de `data.js` intégralement :

```javascript
const FALLBACK={
  birthday:[
    'Joyeux anniversaire ! Je pense fort à toi en ce jour si particulier. J\'espère que tu passes une journée aussi belle et lumineuse que tu l\'es. Que cette nouvelle année t\'apporte exactement ce dont tu as besoin. 🎂🌸',
    'Aujourd\'hui c\'est ton jour, et je voulais juste te dire à quel point je suis heureux·se de t\'avoir dans ma vie. Tu mérites tout le bonheur du monde. Passe une journée inoubliable entouré·e de ceux que tu aimes. 🌺✨',
    'Un an de plus, et tu n\'as jamais été aussi toi-même — c\'est ce que j\'admire le plus chez toi. Joyeux anniversaire ! Que cette année soit riche en belles surprises, en rires et en moments qui comptent vraiment. 💫🎉',
  ],
  wedding:[
    'Joyeux anniversaire de mariage ! Vous formez un couple qui inspire — votre complicité, votre façon d\'être là l\'un pour l\'autre, c\'est quelque chose de rare et de beau. Nous sommes si heureux de célébrer cette nouvelle année avec vous. Que votre amour continue de s\'épanouir encore longtemps. 💍🌸',
    'Quel bonheur de penser à vous aujourd\'hui ! Chaque année qui passe semble avoir renforcé ce lien magnifique que vous partagez. Merci d\'être un exemple de ce que l\'amour peut construire avec du temps, de la confiance et de la tendresse. Joyeux anniversaire à vous deux ! 💕✨',
  ],
  fete:[
    'En ce jour de fête, toutes mes pensées sont pour toi. J\'espère que cette journée sera à la hauteur de ce que tu mérites — lumineuse, joyeuse et pleine de belles personnes. Profite de chaque instant ! 🎊🌸',
    'Quelle belle occasion de célébrer et de partager un moment de joie ! Je te souhaite une fête mémorable, entouré·e de ceux qui comptent vraiment pour toi. 🥳✨',
  ],
};
function getFallback(type){
  if(typeof t==='function'){
    var keys=type==='fete'?['fallbackFete1','fallbackFete2']:type==='wedding'?['fallbackWedding1','fallbackWedding2']:['fallbackBirthday1','fallbackBirthday2','fallbackBirthday3'];
    var msgs=keys.map(function(k){var v=t(k);return v!==k?v:null;}).filter(Boolean);
    if(msgs.length)return msgs[Math.floor(Math.random()*msgs.length)];
  }
  var m=FALLBACK[type]||FALLBACK.birthday;return m[Math.floor(Math.random()*m.length)];
}
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check js/data.js
```
Attendu : aucune sortie

- [ ] **Step 3 : Commit**

```bash
git add js/data.js
git commit -m "feat(messages): fallbacks birthday/wedding/fete — 3-4 phrases, mariage en 'vous'"
```

---

### Task 3 : Mettre à jour i18n.js — 7 langues

**Files:**
- Modify: `js/i18n.js` (lignes 629–633, 1524–1528, 2287–2291, 3050–3054, 3813–3817, 4576–4580, 5339–5343)

**Interfaces:**
- Produces: clés `fallbackBirthday1/2/3`, `fallbackWedding1/2`, `fallbackFete1/2`, `chooseTone`, `generateDefault` dans les 7 langues
- Consumed by: `getFallback()` (Task 2), `showTonePicker()` (Task 4)

#### 3a — Français (lignes 629–633)

- [ ] **Step 1 : Remplacer les clés fallback FR et ajouter wedding + UX**

```javascript
// AVANT (lignes 629–633)
    fallbackBirthday1:'Joyeux anniversaire ! Que cette journée soit pleine de joie, de rires et de bons moments partagés. 🎂🌸',
    fallbackBirthday2:'En ce jour spécial, toutes mes pensées se tournent vers toi pour te souhaiter un anniversaire inoubliable ! ✨🎉',
    fallbackBirthday3:'Que cette nouvelle année de vie t\'apporte santé, bonheur et tout ce dont tu rêves. Joyeux anniversaire ! 🌺💫',
    fallbackFete1:'À l\'occasion de cette belle fête, je te souhaite une journée lumineuse et pleine de bonheur. 🎊',
    fallbackFete2:'Que cette célébration t\'apporte joie et sérénité. Profite pleinement de chaque instant ! 🌸✨',

// APRÈS
    fallbackBirthday1:'Joyeux anniversaire ! Je pense fort à toi en ce jour si particulier. J\'espère que tu passes une journée aussi belle et lumineuse que tu l\'es. Que cette nouvelle année t\'apporte exactement ce dont tu as besoin. 🎂🌸',
    fallbackBirthday2:'Aujourd\'hui c\'est ton jour, et je voulais juste te dire à quel point je suis heureux·se de t\'avoir dans ma vie. Tu mérites tout le bonheur du monde. Passe une journée inoubliable entouré·e de ceux que tu aimes. 🌺✨',
    fallbackBirthday3:'Un an de plus, et tu n\'as jamais été aussi toi-même — c\'est ce que j\'admire le plus chez toi. Joyeux anniversaire ! Que cette année soit riche en belles surprises, en rires et en moments qui comptent vraiment. 💫🎉',
    fallbackWedding1:'Joyeux anniversaire de mariage ! Vous formez un couple qui inspire — votre complicité, votre façon d\'être là l\'un pour l\'autre, c\'est quelque chose de rare et de beau. Nous sommes si heureux de célébrer cette nouvelle année avec vous. Que votre amour continue de s\'épanouir encore longtemps. 💍🌸',
    fallbackWedding2:'Quel bonheur de penser à vous aujourd\'hui ! Chaque année qui passe semble avoir renforcé ce lien magnifique que vous partagez. Merci d\'être un exemple de ce que l\'amour peut construire avec du temps, de la confiance et de la tendresse. Joyeux anniversaire à vous deux ! 💕✨',
    fallbackFete1:'En ce jour de fête, toutes mes pensées sont pour toi. J\'espère que cette journée sera à la hauteur de ce que tu mérites — lumineuse, joyeuse et pleine de belles personnes. Profite de chaque instant ! 🎊🌸',
    fallbackFete2:'Quelle belle occasion de célébrer et de partager un moment de joie ! Je te souhaite une fête mémorable, entouré·e de ceux qui comptent vraiment pour toi. 🥳✨',
    chooseTone:'Quel ton pour ce message ?',
    generateDefault:'Générer avec le ton par défaut',
```

#### 3b — Anglais (lignes 1524–1528)

- [ ] **Step 2 : Remplacer clés EN**

```javascript
// AVANT (lignes 1524–1528)
    fallbackBirthday1:'Happy Birthday! May this day be filled with joy, laughter, and wonderful moments. 🎂🌸',
    fallbackBirthday2:'On this special day, all my thoughts go to you to wish you an unforgettable birthday! ✨🎉',
    fallbackBirthday3:'May this new year of life bring you health, happiness, and everything you dream of. Happy Birthday! 🌺💫',
    fallbackFete1:'On this special occasion, I wish you a bright and joyful day. 🎊',
    fallbackFete2:'May this celebration bring you joy and serenity. Enjoy every moment! 🌸✨',

// APRÈS
    fallbackBirthday1:'Happy birthday! I\'m thinking of you so much on this special day. I hope it\'s as beautiful and bright as you are. May this new year bring you exactly what you need. 🎂🌸',
    fallbackBirthday2:'Today is your day, and I just wanted to say how happy I am to have you in my life. You deserve all the happiness in the world. Have an unforgettable day surrounded by the people you love. 🌺✨',
    fallbackBirthday3:'Another year, and you\'ve never been more yourself — that\'s what I admire most about you. Happy birthday! May this year be full of beautiful surprises, laughter, and moments that truly matter. 💫🎉',
    fallbackWedding1:'Happy wedding anniversary! You are such an inspiring couple — your bond, the way you show up for each other, is something rare and beautiful. We are so happy to celebrate this new year with you. May your love continue to grow for a long time to come. 💍🌸',
    fallbackWedding2:'What a joy to think of you today! Each passing year seems to have strengthened the wonderful bond you share. Thank you for being an example of what love can build with time, trust, and tenderness. Happy anniversary to you both! 💕✨',
    fallbackFete1:'On this festive day, all my thoughts are with you. I hope this day lives up to what you deserve — bright, joyful and full of wonderful people. Make the most of every moment! 🎊🌸',
    fallbackFete2:'What a wonderful occasion to celebrate and share a moment of joy! I wish you a memorable celebration, surrounded by those who truly matter to you. 🥳✨',
    chooseTone:'What tone for this message?',
    generateDefault:'Generate with default tone',
```

#### 3c — Espagnol (lignes 2287–2291)

- [ ] **Step 3 : Remplacer clés ES**

```javascript
// AVANT (lignes 2287–2291)
    fallbackBirthday1:'¡Feliz cumpleaños! Que este día esté lleno de alegría, risas y buenos momentos compartidos. 🎂🌸',
    fallbackBirthday2:'¡En este día especial, todos mis pensamientos se dirigen a ti para desearte un cumpleaños inolvidable! ✨🎉',
    fallbackBirthday3:'Que este nuevo año de vida te traiga salud, felicidad y todo lo que sueñas. ¡Feliz cumpleaños! 🌺💫',
    fallbackFete1:'Con motivo de esta bella celebración, te deseo un día luminoso y lleno de felicidad. 🎊',
    fallbackFete2:'Que esta celebración te traiga alegría y serenidad. ¡Disfruta cada instante! 🌸✨',

// APRÈS
    fallbackBirthday1:'¡Feliz cumpleaños! Pienso mucho en ti en este día tan especial. Espero que sea tan hermoso y luminoso como tú. Que este nuevo año te traiga exactamente lo que necesitas. 🎂🌸',
    fallbackBirthday2:'¡Hoy es tu día, y solo quería decirte lo feliz que estoy de tenerte en mi vida. Te mereces toda la felicidad del mundo. Que pases un día inolvidable rodeado·a de quienes quieres. 🌺✨',
    fallbackBirthday3:'Un año más, y nunca has sido tan tú mismo·a — eso es lo que más admiro de ti. ¡Feliz cumpleaños! Que este año esté lleno de hermosas sorpresas, risas y momentos que realmente importen. 💫🎉',
    fallbackWedding1:'¡Feliz aniversario de bodas! Formáis un couple que inspira — vuestra complicidad, la manera en que estáis el uno para el otro, es algo raro y hermoso. Estamos muy felices de celebrar este nuevo año con vosotros. Que vuestro amor siga floreciendo por mucho tiempo. 💍🌸',
    fallbackWedding2:'¡Qué alegría pensar en vosotros hoy! Cada año que pasa parece haber fortalecido ese vínculo maravilloso que compartís. Gracias por ser un ejemplo de lo que el amor puede construir con tiempo, confianza y ternura. ¡Feliz aniversario a los dos! 💕✨',
    fallbackFete1:'En este día de fiesta, todos mis pensamientos están contigo. Espero que este día esté a la altura de lo que mereces — luminoso, alegre y lleno de personas maravillosas. ¡Disfruta cada instante! 🎊🌸',
    fallbackFete2:'¡Qué bella ocasión para celebrar y compartir un momento de alegría! Te deseo una fiesta memorable, rodeado·a de quienes realmente importan para ti. 🥳✨',
    chooseTone:'¿Qué tono para este mensaje?',
    generateDefault:'Generar con tono predeterminado',
```

#### 3d — Arabe (lignes 3050–3054)

- [ ] **Step 4 : Remplacer clés AR**

```javascript
// AVANT (lignes 3050–3054)
    fallbackBirthday1:'عيد ميلاد سعيد! أتمنى أن يكون هذا اليوم مليئاً بالفرح والضحك والأوقات الجميلة. 🎂🌸',
    fallbackBirthday2:'في هذا اليوم الخاص، تتجه كل أفكاري إليك لأتمنى لك عيد ميلاد لا يُنسى! ✨🎉',
    fallbackBirthday3:'أتمنى أن تجلب لك هذه السنة الجديدة من العمر الصحة والسعادة وكل ما تتمناه. عيد ميلاد سعيد! 🌺💫',
    fallbackFete1:'بمناسبة هذه المناسبة الجميلة، أتمنى لك يوماً مشرقاً ومليئاً بالسعادة. 🎊',
    fallbackFete2:'أتمنى أن تجلب لك هذه الاحتفالية الفرح والطمأنينة. استمتع بكل لحظة! 🌸✨',

// APRÈS
    fallbackBirthday1:'عيد ميلاد سعيد! أفكر بك كثيراً في هذا اليوم المميز. أتمنى أن يكون يومك جميلاً ومشرقاً مثلك تماماً. أتمنى أن تجلب لك هذه السنة الجديدة ما تحتاجه حقاً. 🎂🌸',
    fallbackBirthday2:'اليوم هو يومك، وأردت فقط أن أقول لك كم أنا سعيد بوجودك في حياتي. أنت تستحق كل سعادة الدنيا. أتمنى أن تمضي يوماً لا يُنسى محاطاً بمن تحب. 🌺✨',
    fallbackBirthday3:'عام آخر مضى، ولم تكن قط أكثر أصالة من نفسك كما أنت الآن — هذا ما أُعجب به فيك أكثر شيء. عيد ميلاد سعيد! أتمنى أن يكون هذا العام مليئاً بالمفاجآت الجميلة والضحكات واللحظات التي تهم حقاً. 💫🎉',
    fallbackWedding1:'عيد زواج سعيد! أنتما زوجان ملهمان حقاً — تآلفكما وطريقة وجود كل منكما للآخر أمر نادر وجميل. نحن سعداء جداً بالاحتفال بهذه السنة الجديدة معكما. أتمنى أن يستمر حبكما في الازدهار طويلاً. 💍🌸',
    fallbackWedding2:'يا له من بهجة أن أفكر بكما اليوم! كل عام مضى يبدو وكأنه عزّز هذا الرابط الرائع الذي تشتركان فيه. شكراً لكونكما مثالاً على ما يمكن للحب بناؤه مع الوقت والثقة والحنان. عيد ذكرى سعيد لكما! 💕✨',
    fallbackFete1:'في هذا اليوم المحتفل به، كل أفكاري معك. أتمنى أن يكون هذا اليوم في مستوى ما تستحقه — مشرقاً ومبهجاً ومليئاً بالأشخاص الرائعين. استمتع بكل لحظة! 🎊🌸',
    fallbackFete2:'يا له من مناسبة رائعة للاحتفال ومشاركة لحظة من الفرح! أتمنى لك احتفالاً لا يُنسى، محاطاً بمن يهمون حقاً. 🥳✨',
    chooseTone:'ما نبرة هذه الرسالة؟',
    generateDefault:'إنشاء بالنبرة الافتراضية',
```

#### 3e — Hindi (lignes 3813–3817)

- [ ] **Step 5 : Remplacer clés HI**

```javascript
// AVANT (lignes 3813–3817)
    fallbackBirthday1:'जन्मदिन मुबारक! आशा है यह दिन खुशी, हंसी और अच्छे पलों से भरा हो। 🎂🌸',
    fallbackBirthday2:'इस खास दिन पर, मेरे सभी विचार तुम्हारी ओर हैं — तुम्हें एक यादगार जन्मदिन की शुभकामनाएं! ✨🎉',
    fallbackBirthday3:'आशा है जीवन का यह नया साल तुम्हारे लिए स्वास्थ्य, खुशी और सपनों को लेकर आए। जन्मदिन मुबारक! 🌺💫',
    fallbackFete1:'इस खूबसूरत पर्व के अवसर पर, मैं तुम्हें एक उज्जवल और खुशियों से भरे दिन की शुभकामनाएं देता हूं। 🎊',
    fallbackFete2:'आशा है यह उत्सव तुम्हारे लिए खुशी और शांति लाए। हर पल का आनंद लो! 🌸✨',

// APRÈS
    fallbackBirthday1:'जन्मदिन मुबारक! इस खास दिन पर मैं तुम्हारे बारे में बहुत सोच रहा हूँ। उम्मीद है कि यह दिन तुम्हारी तरह ही खूबसूरत और रोशन हो। यह नया साल तुम्हारे लिए वही लेकर आए जो तुम्हें चाहिए। 🎂🌸',
    fallbackBirthday2:'आज तुम्हारा दिन है, और मैं बस यह कहना चाहता था कि तुम मेरी ज़िंदगी में हो — इसके लिए मैं कितना खुश हूँ। तुम दुनिया की सारी खुशियों के हकदार हो। अपने प्यारों के साथ एक यादगार दिन बिताओ। 🌺✨',
    fallbackBirthday3:'एक और साल, और तुम कभी भी इतने सच्चे खुद नहीं रहे — यही वह चीज़ है जिसे मैं तुममें सबसे ज़्यादा सराहता हूँ। जन्मदिन मुबारक! यह साल खूबसूरत आश्चर्यों, हँसी और वास्तव में मायने रखने वाले पलों से भरा हो। 💫🎉',
    fallbackWedding1:'शादी की सालगिरह मुबारक! आप दोनों एक प्रेरणादायक जोड़ा हैं — आपकी समझ, एक-दूसरे के लिए आपकी उपस्थिति, यह कुछ दुर्लभ और सुंदर है। हम इस नए साल को आपके साथ मनाकर बहुत खुश हैं। आपका प्यार लंबे समय तक फलता-फूलता रहे। 💍🌸',
    fallbackWedding2:'आज आपके बारे में सोचकर कितनी खुशी होती है! बीतते हर साल ने उस अद्भुत बंधन को और मजबूत किया है जो आप दोनों के बीच है। समय, विश्वास और स्नेह के साथ प्यार क्या बना सकता है, इसका उदाहरण होने के लिए धन्यवाद। आप दोनों को सालगिरह की बधाई! 💕✨',
    fallbackFete1:'इस उत्सव के दिन, मेरे सभी विचार तुम्हारे साथ हैं। मुझे उम्मीद है कि यह दिन तुम्हारी योग्यता के अनुसार होगा — उज्जवल, खुशनुमा और अच्छे लोगों से भरा। हर पल का आनंद लो! 🎊🌸',
    fallbackFete2:'जश्न मनाने और खुशी का पल साझा करने का क्या शानदार अवसर है! मैं चाहता हूँ कि तुम्हारी यह पार्टी यादगार हो, उन लोगों से घिरे जो तुम्हारे लिए सच में मायने रखते हैं। 🥳✨',
    chooseTone:'इस संदेश का स्वर चुनें',
    generateDefault:'डिफ़ॉल्ट टोन से जनरेट करें',
```

#### 3f — Chinois (lignes 4576–4580)

- [ ] **Step 6 : Remplacer clés ZH**

```javascript
// AVANT (lignes 4576–4580)
    fallbackBirthday1:'生日快乐！愿这一天充满欢乐、笑声和美好时光。🎂🌸',
    fallbackBirthday2:'在这个特别的日子里，我所有的思念都向着你，祝你拥有一个难忘的生日！✨🎉',
    fallbackBirthday3:'愿新的一岁为你带来健康、幸福和你所梦想的一切。生日快乐！🌺💫',
    fallbackFete1:'在这美好的节日里，我祝你拥有一个阳光灿烂、幸福快乐的日子。🎊',
    fallbackFete2:'愿这次庆典为你带来欢乐和宁静。享受每一个时刻！🌸✨',

// APRÈS
    fallbackBirthday1:'生日快乐！在这个特别的日子里，我一直在想着你。希望这一天像你一样美丽明亮。愿新的一年为你带来你所需要的一切。🎂🌸',
    fallbackBirthday2:'今天是你的日子，我只是想说，能在生命中拥有你，我是多么幸福。你值得拥有世界上所有的幸福。希望你在爱你的人的陪伴下度过难忘的一天。🌺✨',
    fallbackBirthday3:'又一年过去了，而你从未像现在这样做自己——这正是我最欣赏你的地方。生日快乐！愿这一年充满美好的惊喜、欢笑和真正重要的时刻。💫🎉',
    fallbackWedding1:'结婚纪念日快乐！你们是令人钦佩的一对——你们的默契，你们相互支持的方式，是难得而美好的。我们非常高兴与你们共同庆祝这个新的一年。愿你们的爱情继续长久地绽放。💍🌸',
    fallbackWedding2:'今天想到你们，心里真是充满喜悦！每过一年，你们之间那份美好的纽带似乎都更加深厚。感谢你们用时间、信任和温柔，诠释了爱情能够建造的一切。祝你们两位纪念日快乐！💕✨',
    fallbackFete1:'在这个节日里，我所有的心思都在你身上。我希望这一天能配得上你所应得的——明亮、快乐，充满美好的人。好好享受每一刻！🎊🌸',
    fallbackFete2:'多么美好的机会来庆祝和分享喜悦的时刻！祝你拥有一个难忘的节日，身边围绕着那些真正重要的人。🥳✨',
    chooseTone:'选择消息语气',
    generateDefault:'使用默认语气生成',
```

#### 3g — Portugais (lignes 5339–5343)

- [ ] **Step 7 : Remplacer clés PT**

```javascript
// AVANT (lignes 5339–5343)
    fallbackBirthday1:'Feliz aniversário! Que este dia seja cheio de alegria, risos e bons momentos compartilhados. 🎂🌸',
    fallbackBirthday2:'Neste dia especial, todos os meus pensamentos se voltam para você para desejar um aniversário inesquecível! ✨🎉',
    fallbackBirthday3:'Que este novo ano de vida traga saúde, felicidade e tudo o que você sonha. Feliz aniversário! 🌺💫',
    fallbackFete1:'Por ocasião desta bela festa, desejo-lhe um dia luminoso e cheio de felicidade. 🎊',
    fallbackFete2:'Que esta celebração traga alegria e serenidade. Aproveite cada momento! 🌸✨',

// APRÈS
    fallbackBirthday1:'Feliz aniversário! Estou pensando muito em você neste dia tão especial. Espero que seja tão belo e luminoso quanto você. Que este novo ano te traga exatamente o que você precisa. 🎂🌸',
    fallbackBirthday2:'Hoje é o seu dia, e eu queria te dizer o quanto sou feliz por ter você na minha vida. Você merece toda a felicidade do mundo. Que tenha um dia inesquecível rodeado·a de quem ama. 🌺✨',
    fallbackBirthday3:'Mais um ano, e você nunca foi tão você mesmo·a — é isso que mais admiro em você. Feliz aniversário! Que este ano seja rico em belas surpresas, risos e momentos que realmente importam. 💫🎉',
    fallbackWedding1:'Feliz aniversário de casamento! Vocês formam um casal que inspira — a cumplicidade de vocês, a forma como estão um para o outro, é algo raro e bonito. Estamos muito felizes em celebrar este novo ano com vocês. Que o amor de vocês continue a florescer por muito tempo. 💍🌸',
    fallbackWedding2:'Que alegria pensar em vocês hoje! Cada ano que passa parece ter fortalecido esse vínculo maravilhoso que vocês compartilham. Obrigado por serem um exemplo do que o amor pode construir com tempo, confiança e ternura. Feliz aniversário para vocês dois! 💕✨',
    fallbackFete1:'Neste dia de festa, todos os meus pensamentos estão contigo. Espero que este dia esteja à altura do que você merece — luminoso, alegre e cheio de pessoas maravilhosas. Aproveite cada instante! 🎊🌸',
    fallbackFete2:'Que bela ocasião para celebrar e partilhar um momento de alegria! Desejo-te uma festa memorável, rodeado·a daqueles que realmente importam para ti. 🥳✨',
    chooseTone:'Que tom para esta mensagem?',
    generateDefault:'Gerar com tom padrão',
```

- [ ] **Step 8 : Vérifier la syntaxe**

```bash
node --check js/i18n.js
```
Attendu : aucune sortie

- [ ] **Step 9 : Commit**

```bash
git add js/i18n.js
git commit -m "feat(i18n): fallbacks birthday/wedding/fete enrichis 7 langues + clés chooseTone/generateDefault"
```

---

### Task 4 : Corriger `genMsg()` et ajouter `showTonePicker()` — render.js

**Files:**
- Modify: `js/render.js:1455, 1470, 1487, 204, 234`
- Add: fonction `showTonePicker()` après `genMsgAI()` (~ligne 1493)

**Interfaces:**
- Consumes: `getFallback(type)` depuis Task 2, clés `chooseTone`/`generateDefault` depuis Task 3, `DTPL` + `utpls` globaux
- Produces: `genMsg(id, elId, tplId?)` avec paramètre optionnel, `showTonePicker(id, elId)`

- [ ] **Step 1 : Ajouter tplId optionnel à `genMsg()`**

Modifier la signature et la résolution du template (render.js) :

```javascript
// AVANT ligne 1455
async function genMsg(id,elId){

// APRÈS
async function genMsg(id,elId,tplId){
```

```javascript
// AVANT ligne 1470
  var tpl=DTPL.find(function(x){return x.id===actTpl;})||DTPL[0];

// APRÈS
  var tpl=DTPL.find(function(x){return x.id===(tplId||actTpl);})||DTPL[0];
```

- [ ] **Step 2 : Corriger le fallback typé dans le catch de `genMsg()`**

```javascript
// AVANT ligne 1487
    el.innerHTML='<div style="font-size:12px;color:var(--txt2);padding:8px;white-space:pre-wrap">'+esc(getFallback('birthday'))+'</div>';

// APRÈS
    var fbType=(p.type==='wedding')?'wedding':(p.type==='fete')?'fete':'birthday';
    el.innerHTML='<div style="font-size:12px;color:var(--txt2);padding:8px;white-space:pre-wrap">'+esc(getFallback(fbType))+'</div>';
```

- [ ] **Step 3 : Ajouter `showTonePicker()` après `genMsgAI()` (~ligne 1493)**

```javascript
function showTonePicker(id,elId){
  var el=document.getElementById(elId);if(!el)return;
  var allTpl=[].concat(DTPL,typeof utpls!=='undefined'?utpls:[]);
  var h='<div style="padding:8px 0">';
  h+='<div style="font-size:11px;color:var(--txt2);margin-bottom:8px">'+t('chooseTone')+'</div>';
  h+='<div class="chips" style="margin-bottom:8px">';
  allTpl.forEach(function(tp){
    h+='<button class="chip" onclick="genMsg(\''+id+'\',\''+elId+'\',\''+tp.id+'\')">'+tp.e+' '+tp.n+'</button>';
  });
  h+='</div>';
  h+='<button class="btn G sm" style="width:100%" onclick="genMsg(\''+id+'\',\''+elId+'\')">'+t('generateDefault')+' →</button>';
  h+='</div>';
  el.innerHTML=h;
}
```

- [ ] **Step 4 : Mettre à jour les boutons "Préparer" dans les cartes prep**

Il y a deux endroits dans render.js — lignes 204 et 234. Dans les deux cas, remplacer `genMsg` par `showTonePicker` :

```javascript
// AVANT (ligne 204, puis ligne 234 — même contenu)
h+='<button class="btn sm O" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:11px" onclick="genMsg(\''+p.id+'\',\'prep-'+p.id+'\')">'+t('prepareBtn')+'</button>';

// APRÈS (même remplacement aux deux endroits)
h+='<button class="btn sm O" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:11px" onclick="showTonePicker(\''+p.id+'\',\'prep-'+p.id+'\')">'+t('prepareBtn')+'</button>';
```

- [ ] **Step 5 : Vérifier la syntaxe**

```bash
node --check js/render.js
```
Attendu : aucune sortie

- [ ] **Step 6 : Commit**

```bash
git add js/render.js
git commit -m "feat(ux): tone picker avant génération, fallback typé mariage, tplId optionnel dans genMsg"
```

---

### Task 5 : Test manuel et déploiement

**Files:** aucun

- [ ] **Step 1 : Vérifier toutes les syntaxes**

```bash
node --check js/render.js && node --check js/data.js && node --check js/i18n.js
```
Attendu : aucune sortie sur les trois

- [ ] **Step 2 : Audit i18n**

```
/i18n-check
```
Attendu : clés `fallbackWedding1`, `fallbackWedding2`, `chooseTone`, `generateDefault` présentes dans les 7 langues sans warning

- [ ] **Step 3 : Test manuel — tone picker**

Ouvrir l'app, aller sur l'accueil. Si aucun anniversaire dans les 3 prochains jours, modifier temporairement une date de contact.

- Cliquer "Préparer →" sur une carte "À préparer"
- Vérifier que les chips de ton apparaissent (🌸 Chaleureux, 🌺 Poétique, etc.)
- Cliquer un chip → vérifier que l'IA génère avec ce ton
- Cliquer "Générer avec le ton par défaut" → vérifier que ça génère sans sélection

- [ ] **Step 4 : Test manuel — message mariage**

Ouvrir un contact de type mariage, cliquer "Préparer". Vérifier que le message généré :
- Utilise "vous"
- S'adresse au couple (pas à une seule personne)
- Fait 3+ phrases

- [ ] **Step 5 : Test manuel — fallback**

Pour tester le fallback sans couper internet : dans render.js, ajouter temporairement `throw new Error('test')` juste avant l'appel `fetch`, recharger, cliquer "Préparer". Vérifier :
- Pour un anniversaire normal : message en 3-4 phrases (pas l'ancien 1 phrase)
- Pour un mariage : message avec "vous" et adressé au couple
- Retirer le `throw` après test.

- [ ] **Step 6 : Déployer**

```
/ship-bloomday
```
