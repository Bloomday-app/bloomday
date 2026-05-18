Workflow de déploiement Bloomday — commit, push, et vérification Netlify.

## Étape 1 — État du dépôt

Lance ces commandes et affiche le résultat :
```bash
git status
git diff --stat
```

Résume les fichiers modifiés et la nature des changements.

## Étape 2 — Message de commit

Propose un message de commit au format :
`type(scope): description courte en français`

Types : `feat`, `fix`, `docs`, `refactor`, `style`, `chore`

Exemples :
- `feat(i18n): ajouter traductions arabes manquantes`
- `fix(auth): corriger redirect après login Google`
- `docs(claude): mettre à jour CLAUDE.md`

Demande confirmation : "Ce message de commit est-il correct ? (oui pour continuer, non pour modifier)"

## Étape 3 — Commit et push

Une fois confirmé :
```bash
git add .
git commit -m "<message validé>"
git push origin main
```

## Étape 4 — Vérification déploiement Netlify

Netlify déploie automatiquement depuis main. Attends 90 secondes, puis vérifie :

```bash
curl -s -o /dev/null -w "%{http_code}" https://mybloomday.app
```

- Résultat `200` → "✅ Déploiement réussi — mybloomday.app est en ligne"
- Autre résultat → "⚠️ mybloomday.app répond avec le code HTTP <code> — vérifier sur Netlify"
