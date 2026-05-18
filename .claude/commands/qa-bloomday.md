Lance un test QA complet de https://mybloomday.app via le skill browse.

Invoque d'abord le skill browse (`Skill(browse)`), puis teste ces 5 flows dans l'ordre :

## Flow 1 — Page de login
- Navigue vers https://mybloomday.app
- Vérifie que le formulaire email/mot de passe est visible (`is visible` sur les inputs)
- Vérifie que le bouton "Continuer avec Google" est présent
- Résultat attendu : ✅ les deux éléments visibles

## Flow 2 — Navigation bas
- Prend un snapshot de la page
- Vérifie que la barre de navigation basse est présente
- Vérifie qu'elle contient des onglets (Accueil, Calendrier, Contacts, Plans, Profil)
- Résultat attendu : ✅ navigation présente

## Flow 3 — Réponse HTTP
```bash
curl -s -o /dev/null -w "%{http_code}" https://mybloomday.app
```
- Résultat attendu : ✅ HTTP 200

## Flow 4 — Pas d'erreurs console critiques
- Lance `console` dans browse pour voir les logs JS
- Vérifie l'absence d'erreurs `Uncaught TypeError` ou `Failed to fetch`
- Résultat attendu : ✅ pas d'erreurs critiques (warnings acceptables)

## Flow 5 — Chargement des ressources
- Lance `network` dans browse
- Vérifie qu'aucune ressource critique (JS, CSS) n'a échoué (statut 4xx/5xx)
- Résultat attendu : ✅ toutes les ressources chargées

## Rapport final

Produis un tableau de résultats :

| Flow | Statut | Notes |
|------|--------|-------|
| Login form | ✅/❌ | ... |
| Navigation bas | ✅/❌ | ... |
| HTTP 200 | ✅/❌ | ... |
| Console errors | ✅/❌ | ... |
| Ressources réseau | ✅/❌ | ... |

En cas d'échec sur un flow, prends un screenshot :
`$B screenshot /tmp/qa-bloomday-fail.png`
et affiche l'image.
