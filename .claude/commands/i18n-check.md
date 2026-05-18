Effectue un audit complet des traductions Bloomday.

## Étape 1 — Clés manquantes par langue

Lis `js/i18n.js`. Le fichier contient `const I18N = { fr:{...}, en:{...}, es:{...}, ar:{...}, hi:{...}, zh:{...}, pt:{...} }`.

1. Extrais toutes les clés présentes dans `I18N.fr` (la référence)
2. Pour chaque clé, vérifie qu'elle existe dans les 6 autres langues : en, es, ar, hi, zh, pt
3. Produis un tableau markdown des clés manquantes :

| Clé | Langues manquantes |
|-----|--------------------|
| ... | ...                |

Si aucune clé ne manque, écris : "✅ Toutes les clés fr sont présentes dans les 6 autres langues."

## Étape 2 — Strings françaises hardcodées

Grep dans `js/*.js` et `index.html` pour détecter les strings visibles hardcodées :

```bash
grep -n "innerHTML\s*=\s*['\`][A-ZÀ-Ùa-zà-ù]" js/*.js
grep -rn "placeholder=\"[A-ZÀ-Ùa-zà-ù]" index.html
grep -rn "title=\"[A-ZÀ-Ùa-zà-ù]" index.html
```

Produis une liste des occurrences suspectes avec fichier + numéro de ligne.
Si aucune string suspecte n'est trouvée, écris : "✅ Pas de strings françaises hardcodées détectées."

## Résumé final

Affiche un résumé en 2 sections : clés manquantes + strings hardcodées.
Propose les corrections par ordre de priorité.
