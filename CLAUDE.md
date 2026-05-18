
## Stack technique

- **Frontend :** Vanilla JS ES6+ (pas de bundler, pas de transpilation), CSS custom, HTML5
- **Backend :** Supabase (auth + PostgreSQL) via `js/supabase-client.js`
- **Déploiement :** Netlify — chaque `git push origin main` déclenche un déploiement automatique
- **URL de prod :** https://mybloomday.app
- **i18n :** Système custom dans `js/i18n.js` — 7 langues (fr, en, es, ar, hi, zh, pt), 140 pays

## Structure des fichiers JS

- `js/i18n.js` — Dictionnaire `I18N = { fr:{...}, en:{...}, ... }` et fonction `t(key)`
- `js/data.js` — Données locales : contacts, groupes, pays, fêtes nationales
- `js/render.js` — Toutes les fonctions de rendu DOM
- `js/core.js` — Logique métier principale (calendrier, anniversaires, groupes)
- `js/auth.js` — Authentification Supabase (login, signup, Google OAuth)
- `js/features.js` — Fonctionnalités secondaires (florist, email, plans d'abonnement)
- `js/helpers.js` — Utilitaires partagés
- `js/db.js` — Accès Supabase (CRUD contacts, groupes, profil)

## Commandes essentielles

- Pas de framework de test — tester manuellement via `/qa-bloomday` ou en ouvrant index.html
- Tester la syntaxe JS : `node --check js/<fichier>.js`
- Déployer : `/ship-bloomday` ou `git push origin main`
- Auditer les traductions : `/i18n-check`

## Règles i18n — CRITIQUES

- Toute string visible par l'utilisateur DOIT passer par `t('clé')` (JS) ou `data-i18n="clé"` (HTML)
- Jamais de string hardcodée en français dans JS ou HTML
- Quand une clé est ajoutée, elle doit exister dans les 7 langues : fr, en, es, ar, hi, zh, pt
- Structure i18n : `I18N.fr.maClé`, `I18N.en.maClé`, etc.
- Les clés sont en camelCase anglais : `labelEmail`, `btnSave`, `errorRequired`

## Règles de qualité

- Ne jamais modifier une fonction existante sans grep ses appelants d'abord
- Après tout changement JS, vérifier : `node --check js/<fichier>.js`
- Les IDs HTML sont la source de vérité pour les sélecteurs JS — ne pas renommer sans grep global
- Les fichiers JS sont en ES6+ natif : pas d'import/export, pas de require(), tout est global via `<script>`
- Ne pas introduire de dépendances npm côté frontend

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Audit traductions i18n → invoquer /i18n-check
- Test QA des flows → invoquer /qa-bloomday
- Déployer en production → invoquer /ship-bloomday
