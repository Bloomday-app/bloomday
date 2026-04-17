# Bloomday — Structure des fichiers

## Architecture

```
bloomday/
├── index.html              # HTML pur (structure + liens)
├── css/
│   └── app.css             # Tout le CSS (28KB)
├── js/
│   ├── data.js             # Constantes : PLANS, FETES, DTPL, PAYS
│   ├── i18n.js             # Traductions 7 langues + t() + setLang()
│   ├── helpers.js          # FETES_NAMES, COUNTRIES, buildCountrySelect
│   ├── features.js         # Import contacts, upgrade, downgrade, compte
│   ├── render.js           # rHome, rMembers, rEvents, rMore
│   └── core.js             # load(), topbar, renderAllPlans, onboarding
├── netlify/
│   └── functions/
│       └── generate-message.js  # API Anthropic (Netlify Functions)
├── package.json
├── netlify.toml
└── README.md
```

## Développement local

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Ordre de chargement des scripts (important)

1. `data.js` — constantes globales (PLANS, FETES, DTPL...)
2. `i18n.js` — système de traduction (dépend de data.js)
3. `helpers.js` — FETES_NAMES, COUNTRIES (dépend de i18n.js)
4. `features.js` — upgrade, contacts... (dépend de i18n.js)
5. `render.js` — fonctions d'affichage (dépend de tout)
6. `core.js` — initialisation app (doit être le dernier)

## Langues supportées

FR 🇫🇷 | EN 🇬🇧 | ES 🇪🇸 | AR 🇸🇦 | HI 🇮🇳 | ZH 🇨🇳 | PT 🇧🇷

## Règles iOS Safari

- Pas de `?.` (optional chaining)
- Pas de `[...spread]`  
- Pas de `font-family` dans `style=""`
- Pas de `JSON.stringify` dans les `onclick`
- Pas de `t()` dans la constante `I18N`
