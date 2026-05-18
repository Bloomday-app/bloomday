# Design : Claude Code Best Practices pour Bloomday

**Date :** 2026-05-18
**Approche choisie :** B — CLAUDE.md + Hooks + Commands
**Objectif :** Éliminer la répétition, prévenir les erreurs, automatiser les workflows quotidiens

---

## 1. CLAUDE.md enrichi

### Problème actuel
18 lignes, uniquement le routing de skills. Claude ne connaît pas la stack, les règles i18n, ni les commandes pour tester le projet.

### Contenu cible (~80 lignes max)

**Blocs à ajouter :**

- **Stack technique** : Vanilla JS (ES6+), Supabase (auth + DB), Netlify (déploiement auto depuis main), i18n custom en 7 langues (fr, en, es, ar, hi, zh, pt), 140 pays
- **Structure des fichiers JS** :
  - `js/i18n.js` — dictionnaire de traductions et fonction `t(key)`
  - `js/data.js` — données locales (contacts, groupes, pays, fêtes)
  - `js/render.js` — toutes les fonctions de rendu DOM
  - `js/core.js` — logique métier principale
  - `js/auth.js` — authentification Supabase
  - `js/features.js` — fonctionnalités secondaires (florist, email, plans)
- **Commandes essentielles** :
  - Pas de framework de test — tester manuellement via browse ou en ouvrant index.html
  - `git push origin main` déclenche le déploiement Netlify automatiquement
  - URL de prod : `https://mybloomday.app`
- **Règles i18n** (critiques) :
  - Toute string visible par l'utilisateur doit passer par `t('clé')` ou `data-i18n="clé"`
  - Jamais de string hardcodée en français dans JS ou HTML
  - Quand on ajoute une clé, l'ajouter dans les 7 langues : `fr, en, es, ar, hi, zh, pt`
  - Structure dans `i18n.js` : chaque langue est un objet `LANG.fr = {...}`, `LANG.en = {...}` etc.
- **Règles de qualité** :
  - Ne jamais modifier une fonction existante sans vérifier tous ses appelants
  - Après tout changement JS, vérifier la syntaxe avec `node --check js/<fichier>.js`
  - Les fichiers JS sont en ES6+ natif (pas de bundler, pas de transpilation)
  - Les IDs HTML sont la source de vérité pour les sélecteurs JS — ne pas les renommer sans grep
- **Routing skills** : déjà en place, conservé tel quel

---

## 2. Hooks

### Fichiers à créer

#### `.claude/hooks/post-edit-format.sh`
**Trigger :** PostToolUse sur Edit ou Write (fichiers `.js` uniquement)
**Action :**
```bash
#!/bin/bash
FILE="$1"
if [[ "$FILE" == *.js ]]; then
  node --check "$FILE" 2>&1
  if [ $? -ne 0 ]; then
    echo "⚠️  Erreur de syntaxe détectée dans $FILE"
    exit 1
  fi
fi
```
**Objectif :** Détecter les erreurs de syntaxe JS immédiatement après chaque édition.

#### `.claude/hooks/stop-verify.sh`
**Trigger :** Stop (fin de chaque tour Claude)
**Action :** Affiche un rappel contextuel non-bloquant :
```
📋 Checklist de fin de tâche Bloomday :
  - Les strings ajoutées sont-elles dans les 7 langues ?
  - Les IDs HTML modifiés sont-ils mis à jour dans le JS ?
  - Le comportement a-t-il été testé dans le navigateur ?
```
**Objectif :** Nudge de vérification, pas bloquant.

### Configuration dans `.claude/settings.json`
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": ".claude/hooks/post-edit-format.sh $FILE" }]
      }
    ],
    "Stop": [
      { "type": "command", "command": ".claude/hooks/stop-verify.sh" }
    ]
  }
}
```

---

## 3. Commands

### Fichiers à créer dans `.claude/commands/`

#### `i18n-check.md`
**Invocation :** `/i18n-check`
**Ce que ça fait :**
1. Lit toutes les clés de `LANG.fr` dans `js/i18n.js`
2. Vérifie que chaque clé existe dans `en, es, ar, hi, zh, pt`
3. Grep dans `js/*.js` et `index.html` pour détecter les patterns de strings hardcodées françaises
4. Produit un rapport : clés manquantes par langue + strings hardcodées suspectes
**Format de sortie :** tableau markdown avec clé / langue manquante / ligne

#### `qa-bloomday.md`
**Invocation :** `/qa-bloomday`
**Ce que ça fait :**
1. Ouvre `https://mybloomday.app` via browse
2. Teste 5 flows critiques :
   - Page de login visible et formulaire fonctionnel
   - Bouton Google login présent
   - Navigation bas (5 onglets dont Profil)
   - Ajout d'un contact avec date d'anniversaire
   - Affichage du calendrier avec un événement
3. Screenshot en cas d'échec
4. Rapport final : ✅/❌ par flow

#### `ship-bloomday.md`
**Invocation :** `/ship-bloomday`
**Ce que ça fait :**
1. `git status` — liste les fichiers modifiés
2. Propose un message de commit basé sur les changements
3. `git add -p` (sélectif) ou `git add .` selon confirmation
4. `git commit -m "..."`
5. `git push origin main`
6. Attend 60s puis vérifie `https://mybloomday.app` (HTTP 200)
7. Confirme le déploiement ou alerte si l'URL ne répond pas

---

## Structure finale `.claude/`

```
.claude/
  settings.json          ← hooks configurés ici
  settings.local.json    ← permissions (déjà existant)
  hooks/
    post-edit-format.sh
    stop-verify.sh
  commands/
    i18n-check.md
    qa-bloomday.md
    ship-bloomday.md
```

---

## Hors scope

- Agents spécialisés (i18n-specialist, qa-specialist) — à envisager si la complexité augmente avec Supabase Phase 2
- Framework de test automatisé — pas adapté à la stack vanilla JS actuelle
- CI/CD GitHub Actions — Netlify auto-deploy depuis main suffit

---

## Critères de succès

- CLAUDE.md : toute nouvelle session Claude connaît la stack sans que l'utilisateur ré-explique
- Hooks : les erreurs de syntaxe JS sont détectées immédiatement, pas au moment du push
- Commands : `/i18n-check`, `/qa-bloomday`, `/ship-bloomday` fonctionnent en une invocation
