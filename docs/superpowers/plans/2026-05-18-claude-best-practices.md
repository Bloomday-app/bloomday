# Claude Code Best Practices — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configurer CLAUDE.md, des hooks automatiques, et 3 commandes réutilisables pour éliminer la répétition et prévenir les erreurs sur le projet Bloomday.

**Architecture:** Trois couches indépendantes — (1) CLAUDE.md comme source de vérité du contexte projet pour chaque session, (2) hooks automatiques dans `.claude/settings.json` pour détecter les erreurs en temps réel, (3) commandes markdown dans `.claude/commands/` pour les workflows répétitifs.

**Tech Stack:** Claude Code hooks (bash), Claude Code commands (markdown), Node.js v25 (syntaxe check), browse skill (QA), git (ship)

---

## Fichiers concernés

| Action | Fichier | Rôle |
|--------|---------|------|
| Modifier | `CLAUDE.md` | Contexte projet complet pour chaque session |
| Créer | `.claude/settings.json` | Configuration des hooks |
| Créer | `.claude/hooks/post-edit-format.sh` | Détection erreurs syntaxe JS après chaque édition |
| Créer | `.claude/hooks/stop-verify.sh` | Checklist de fin de tâche |
| Créer | `.claude/commands/i18n-check.md` | Audit traductions manquantes |
| Créer | `.claude/commands/qa-bloomday.md` | Test flows critiques via browse |
| Créer | `.claude/commands/ship-bloomday.md` | Déploiement commit + push + vérif Netlify |

---

## Task 1 : CLAUDE.md enrichi

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1 : Remplacer le contenu de CLAUDE.md**

Remplacer intégralement le fichier `CLAUDE.md` par ce contenu :

```markdown
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
```

- [ ] **Step 2 : Vérifier le nombre de lignes**

```bash
wc -l CLAUDE.md
```
Attendu : moins de 80 lignes.

- [ ] **Step 3 : Committer**

```bash
git add CLAUDE.md
git commit -m "docs(claude): enrichir CLAUDE.md avec stack, règles i18n et qualité"
```

---

## Task 2 : Hooks — post-edit-format.sh

**Files:**
- Create: `.claude/hooks/post-edit-format.sh`
- Create: `.claude/settings.json`

- [ ] **Step 1 : Créer le dossier hooks**

```bash
mkdir -p .claude/hooks
```

- [ ] **Step 2 : Créer le script post-edit-format.sh**

Créer `.claude/hooks/post-edit-format.sh` avec ce contenu :

```bash
#!/bin/bash
# Lit le JSON du tool call depuis stdin (format Claude Code PostToolUse)
INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('file_path', ''))
except:
    print('')
" 2>/dev/null)

# Ne s'applique qu'aux fichiers .js
if [[ "$FILE" == *.js ]] && [[ -f "$FILE" ]]; then
    OUTPUT=$(node --check "$FILE" 2>&1)
    EXIT=$?
    if [ $EXIT -ne 0 ]; then
        echo "ERREUR DE SYNTAXE JS dans $FILE :"
        echo "$OUTPUT"
        echo "Corrige l'erreur de syntaxe avant de continuer."
        exit 1
    fi
fi
exit 0
```

- [ ] **Step 3 : Rendre le script exécutable**

```bash
chmod +x .claude/hooks/post-edit-format.sh
```

- [ ] **Step 4 : Vérifier la syntaxe du script**

```bash
bash -n .claude/hooks/post-edit-format.sh && echo "OK"
```
Attendu : `OK`

- [ ] **Step 5 : Créer .claude/settings.json avec la configuration du hook**

Créer `.claude/settings.json` avec ce contenu :

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/post-edit-format.sh"
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 6 : Valider le JSON**

```bash
python3 -c "import json; json.load(open('.claude/settings.json')); print('JSON valide')"
```
Attendu : `JSON valide`

- [ ] **Step 7 : Committer**

```bash
git add .claude/hooks/post-edit-format.sh .claude/settings.json
git commit -m "feat(hooks): détection syntaxe JS après chaque édition (PostToolUse)"
```

---

## Task 3 : Hook — stop-verify.sh

**Files:**
- Create: `.claude/hooks/stop-verify.sh`
- Modify: `.claude/settings.json`

- [ ] **Step 1 : Créer stop-verify.sh**

Créer `.claude/hooks/stop-verify.sh` avec ce contenu :

```bash
#!/bin/bash
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║     CHECKLIST FIN DE TÂCHE — Bloomday        ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  □  Strings ajoutées dans les 7 langues ?    ║"
echo "║  □  IDs HTML modifiés mis à jour dans JS ?   ║"
echo "║  □  node --check js/<fichier>.js lancé ?     ║"
echo "║  □  Testé dans le navigateur ?               ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
exit 0
```

- [ ] **Step 2 : Rendre exécutable et vérifier la syntaxe**

```bash
chmod +x .claude/hooks/stop-verify.sh
bash -n .claude/hooks/stop-verify.sh && echo "OK"
```
Attendu : `OK`

- [ ] **Step 3 : Ajouter le Stop hook dans settings.json**

Modifier `.claude/settings.json` pour ajouter le hook Stop :

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/post-edit-format.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "type": "command",
        "command": "bash .claude/hooks/stop-verify.sh"
      }
    ]
  }
}
```

- [ ] **Step 4 : Valider le JSON**

```bash
python3 -c "import json; json.load(open('.claude/settings.json')); print('JSON valide')"
```
Attendu : `JSON valide`

- [ ] **Step 5 : Committer**

```bash
git add .claude/hooks/stop-verify.sh .claude/settings.json
git commit -m "feat(hooks): checklist de fin de tâche (Stop hook)"
```

---

## Task 4 : Commande /i18n-check

**Files:**
- Create: `.claude/commands/i18n-check.md`

- [ ] **Step 1 : Créer le dossier commands**

```bash
mkdir -p .claude/commands
```

- [ ] **Step 2 : Créer i18n-check.md**

Créer `.claude/commands/i18n-check.md` avec ce contenu :

```markdown
Effectue un audit complet des traductions Bloomday.

## Étape 1 — Clés manquantes par langue

Lis `js/i18n.js`. Le fichier contient un objet `I18N` avec 7 sections de langue : `fr`, `en`, `es`, `ar`, `hi`, `zh`, `pt`.

1. Extrais toutes les clés présentes dans `I18N.fr` (la référence)
2. Pour chaque clé, vérifie qu'elle existe dans les 6 autres langues
3. Produis un tableau markdown des clés manquantes :

| Clé | Langues manquantes |
|-----|--------------------|
| ... | ...                |

Si aucune clé ne manque, écris : "✅ Toutes les clés fr sont présentes dans les 6 autres langues."

## Étape 2 — Strings françaises hardcodées

Grep dans `js/*.js` et `index.html` pour détecter :
- Des strings françaises dans `innerHTML` ou `textContent` sans variable `t('...')`
- Des attributs `placeholder` ou `title` en français sans `data-i18n`
- Des `console.log` ou messages d'erreur en français visibles à l'utilisateur

Patterns à chercher (exemples) :
```bash
grep -n "innerHTML\s*=\s*['\`][A-ZÀ-Ú]" js/*.js
grep -n "placeholder=\"[A-ZÀ-Ú]" index.html
```

Produis une liste :
```
js/render.js:145 → innerHTML = 'Aucun contact'  (hardcodé)
index.html:418   → placeholder="Votre mot de passe"  (hardcodé)
```

Si aucune string suspecte n'est trouvée, écris : "✅ Pas de strings françaises hardcodées détectées."

## Résumé final

Affiche un résumé en 2 sections : clés manquantes + strings hardcodées.
Propose les corrections à effectuer par ordre de priorité.
```

- [ ] **Step 3 : Tester la commande manuellement**

Invoque `/i18n-check` dans Claude Code et vérifie que le rapport est produit.
Attendu : un tableau de clés manquantes (ou confirmation qu'il n'y en a pas) + liste de strings hardcodées.

- [ ] **Step 4 : Committer**

```bash
git add .claude/commands/i18n-check.md
git commit -m "feat(commands): commande /i18n-check — audit traductions 7 langues"
```

---

## Task 5 : Commande /qa-bloomday

**Files:**
- Create: `.claude/commands/qa-bloomday.md`

- [ ] **Step 1 : Créer qa-bloomday.md**

Créer `.claude/commands/qa-bloomday.md` avec ce contenu :

```markdown
Lance un test QA complet de https://mybloomday.app via le skill browse.

Utilise le skill `browse` (invoke `Skill(browse)` si besoin) pour tester ces 5 flows dans l'ordre :

## Flow 1 — Page de login
- Navigue vers https://mybloomday.app
- Vérifie que le formulaire email/mot de passe est visible
- Vérifie que le bouton "Continuer avec Google" est présent
- Attendu : les deux éléments visibles ✅

## Flow 2 — Navigation bas
- Vérifie que la barre de navigation basse est présente
- Vérifie qu'elle contient exactement 5 onglets (Accueil, Calendrier, Contacts, Plans, Profil)
- Attendu : 5 onglets visibles ✅

## Flow 3 — Changement de langue
- Cherche le sélecteur de langue dans l'interface
- Si accessible sans login, change la langue (ex : passer en anglais)
- Vérifie que l'interface se met à jour
- Attendu : labels changés ✅ (ou "Requires login" si inaccessible)

## Flow 4 — Réponse HTTP
- Vérifie que https://mybloomday.app répond avec un statut 200
- Attendu : HTTP 200 ✅

## Flow 5 — Pas d'erreurs console
- Lance `console` pour vérifier l'absence d'erreurs JS critiques
- Attendu : pas d'erreur de type `Uncaught TypeError` ou `Failed to fetch` ✅

## Rapport final

Produis un rapport en tableau :

| Flow | Statut | Notes |
|------|--------|-------|
| Login form | ✅/❌ | ... |
| Navigation | ✅/❌ | ... |
| Langue | ✅/❌ | ... |
| HTTP 200 | ✅/❌ | ... |
| Console errors | ✅/❌ | ... |

En cas d'échec, prend un screenshot avec `$B screenshot /tmp/qa-fail.png` et affiche-le.
```

- [ ] **Step 2 : Tester la commande manuellement**

Invoque `/qa-bloomday` dans Claude Code et vérifie que les 5 flows sont testés.

- [ ] **Step 3 : Committer**

```bash
git add .claude/commands/qa-bloomday.md
git commit -m "feat(commands): commande /qa-bloomday — test flows critiques via browse"
```

---

## Task 6 : Commande /ship-bloomday

**Files:**
- Create: `.claude/commands/ship-bloomday.md`

- [ ] **Step 1 : Créer ship-bloomday.md**

Créer `.claude/commands/ship-bloomday.md` avec ce contenu :

```markdown
Workflow de déploiement Bloomday — commit, push, et vérification Netlify.

## Étape 1 — État du dépôt

Lance :
```bash
git status
git diff --stat
```

Affiche la liste des fichiers modifiés et un résumé des changements.

## Étape 2 — Message de commit

Propose un message de commit en respectant le format :
`type(scope): description courte en français`

Types disponibles : `feat`, `fix`, `docs`, `refactor`, `style`, `chore`

Exemples :
- `feat(i18n): ajouter traductions manquantes pour l'arabe`
- `fix(auth): corriger le redirect après login Google`

Demande confirmation avant de continuer : "Message de commit OK ? (oui/non)"

## Étape 3 — Commit et push

```bash
git add .
git commit -m "<message validé>"
git push origin main
```

## Étape 4 — Vérification déploiement

Attends 90 secondes (Netlify prend ~60-90s pour déployer), puis :

```bash
curl -s -o /dev/null -w "%{http_code}" https://mybloomday.app
```

- Si `200` : "✅ Déploiement réussi — mybloomday.app est en ligne"
- Si autre code : "⚠️ Attention : mybloomday.app répond avec le code HTTP <code>"
```

- [ ] **Step 2 : Tester la commande manuellement**

Invoque `/ship-bloomday` avec un changement mineur (ex : ajout d'un commentaire) et vérifie le workflow complet.

- [ ] **Step 3 : Committer**

```bash
git add .claude/commands/ship-bloomday.md
git commit -m "feat(commands): commande /ship-bloomday — déploiement avec vérification Netlify"
```

---

## Task 7 : Mise à jour du CLAUDE.md routing pour les nouvelles commandes

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1 : Ajouter les nouvelles commandes dans le routing**

Dans le bloc `## Skill routing` de `CLAUDE.md`, ajouter ces entrées dans la liste :

```markdown
- Audit traductions i18n → invoquer /i18n-check
- Test QA des flows → invoquer /qa-bloomday
- Déployer en production → invoquer /ship-bloomday
```

- [ ] **Step 2 : Vérifier la longueur totale**

```bash
wc -l CLAUDE.md
```
Attendu : moins de 90 lignes.

- [ ] **Step 3 : Committer**

```bash
git add CLAUDE.md
git commit -m "docs(claude): ajouter les commandes Bloomday dans le routing"
```

---

## Vérification finale

- [ ] **Vérifier la structure complète**

```bash
find .claude -type f | sort
```

Attendu :
```
.claude/commands/i18n-check.md
.claude/commands/qa-bloomday.md
.claude/commands/ship-bloomday.md
.claude/hooks/post-edit-format.sh
.claude/hooks/stop-verify.sh
.claude/settings.json
.claude/settings.local.json
.claude/skills/         (déjà existant)
```

- [ ] **Valider settings.json final**

```bash
python3 -c "import json; d=json.load(open('.claude/settings.json')); print('hooks:', list(d['hooks'].keys()))"
```
Attendu : `hooks: ['PostToolUse', 'Stop']`

- [ ] **Pousser tout en production**

```bash
git push origin main
```
