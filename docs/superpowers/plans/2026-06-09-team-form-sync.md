# Team-Form Sync Multi-Appareils — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lier chaque survey Bloomday à son créateur (via `user_id`) pour que la liste des équipes soit retrouvée sur n'importe quel appareil connecté au même compte.

**Architecture:** On ajoute une colonne `user_id` nullable sur `surveys`, on la peuple automatiquement via `auth.uid()` dans `tf_create_survey` (déjà SECURITY DEFINER), et on expose `tf_get_my_surveys` pour que le front récupère toutes les équipes du compte au chargement. Le localStorage reste actif comme cache et fallback.

**Tech Stack:** Supabase PostgreSQL (RPC SECURITY DEFINER), Vanilla JS ES6+, localStorage

---

## Fichiers concernés

| Fichier | Action |
|---|---|
| `supabase/migrations/20260609100000_tf_sync_user.sql` | Créer — migration + RPCs modifiés |
| `js/team-form.js` | Modifier — `tfMergeAndSaveTeams` + `DOMContentLoaded` async |

---

## Task 1 : Migration SQL

**Fichiers :**
- Créer : `supabase/migrations/20260609100000_tf_sync_user.sql`

- [ ] **Étape 1 : Créer le fichier de migration**

Créer `supabase/migrations/20260609100000_tf_sync_user.sql` avec ce contenu exact :

```sql
-- Ajoute user_id à surveys pour lier chaque enquête à son créateur
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Remplace tf_create_survey pour capturer auth.uid() automatiquement
-- (signature identique — CREATE OR REPLACE suffit)
CREATE OR REPLACE FUNCTION tf_create_survey(
  p_admin_token    text,
  p_team_name      text,
  p_manager_name   text,
  p_relation_labels jsonb,
  p_invite_message text,
  p_members        jsonb   -- [{token, first_name, last_name, email, relation}]
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid;
BEGIN
  INSERT INTO surveys (token, team_name, manager_name, relation_labels, invite_message, user_id)
  VALUES (p_admin_token, p_team_name, p_manager_name, p_relation_labels, p_invite_message, auth.uid())
  RETURNING id INTO v_survey_id;

  INSERT INTO survey_members (survey_id, token, first_name, last_name, email, relation)
  SELECT
    v_survey_id,
    m->>'token',
    m->>'first_name',
    m->>'last_name',
    NULLIF(m->>'email', ''),
    NULLIF(m->>'relation', '')
  FROM jsonb_array_elements(p_members) AS m;

  RETURN json_build_object('survey_id', v_survey_id);
END;
$$;

GRANT EXECUTE ON FUNCTION tf_create_survey(text, text, text, jsonb, text, jsonb) TO anon;

-- Nouvelle RPC : retourne toutes les équipes de l'utilisateur connecté
CREATE OR REPLACE FUNCTION tf_get_my_surveys()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'token',        s.token,
      'team_name',    s.team_name,
      'manager_name', s.manager_name,
      'created_at',   s.created_at
    ) ORDER BY s.created_at DESC
  ) INTO result
  FROM surveys s
  WHERE s.user_id = auth.uid();

  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION tf_get_my_surveys() TO authenticated;
```

- [ ] **Étape 2 : Appliquer la migration dans Supabase**

Ouvrir le SQL Editor du projet Supabase (dashboard web) et coller + exécuter le contenu du fichier ci-dessus.

Résultat attendu : `Success. No rows returned.`

- [ ] **Étape 3 : Vérifier la colonne `user_id`**

Dans le SQL Editor, exécuter :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'surveys' AND column_name = 'user_id';
```

Résultat attendu : une ligne avec `user_id | uuid | YES`.

- [ ] **Étape 4 : Vérifier que `tf_get_my_surveys` existe**

Dans le SQL Editor :

```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'tf_get_my_surveys';
```

Résultat attendu : une ligne `tf_get_my_surveys`.

- [ ] **Étape 5 : Committer le fichier de migration**

```bash
git add supabase/migrations/20260609100000_tf_sync_user.sql
git commit -m "feat(team-form): add user_id to surveys + tf_get_my_surveys RPC for multi-device sync"
```

---

## Task 2 : Ajouter `tfMergeAndSaveTeams` dans `team-form.js`

**Fichiers :**
- Modifier : `js/team-form.js` (après `tfSaveAdminToken`, ~ligne 103)

- [ ] **Étape 1 : Ajouter la fonction `tfMergeAndSaveTeams`**

Dans `js/team-form.js`, après la fonction `tfSaveAdminToken` (ligne ~103), insérer :

```js
function tfMergeAndSaveTeams(remoteTeams) {
  var teams = tfGetSavedTeams();
  var localTokens = {};
  teams.forEach(function(t) { localTokens[t.token] = true; });
  remoteTeams.forEach(function(t) {
    if (!localTokens[t.token]) {
      tfSaveAdminToken(t.token, t.team_name, t.manager_name);
    }
  });
}
```

- [ ] **Étape 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

Résultat attendu : aucune sortie (pas d'erreur).

- [ ] **Étape 3 : Committer**

```bash
git add js/team-form.js
git commit -m "feat(team-form): add tfMergeAndSaveTeams to sync remote surveys into localStorage"
```

---

## Task 3 : Modifier `DOMContentLoaded` pour la sync au chargement

**Fichiers :**
- Modifier : `js/team-form.js` (listener `DOMContentLoaded`, lignes 65-79)

- [ ] **Étape 1 : Remplacer le listener `DOMContentLoaded`**

Remplacer le bloc existant (lignes 65-79) :

```js
window.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  TF.adminToken = params.get('admin');
  TF.memberToken = params.get('member');
  TF.prefillManager = params.get('manager') || '';
  if (TF.memberToken) { TF.mode = 'member'; tfInitMember(); }
  else if (TF.adminToken) { TF.mode = 'dashboard'; tfInitDashboard(); }
  else {
    var savedTeams = tfGetSavedTeams();
    if (savedTeams.length > 0) { TF.mode = 'teams'; tfInitTeams(); return; }
    var legacyToken = localStorage.getItem('tf_admin_token');
    if (legacyToken) { window.location.href = 'team-form.html?admin=' + legacyToken; return; }
    TF.mode = 'create'; tfInitCreate();
  }
});
```

Par ce nouveau bloc :

```js
window.addEventListener('DOMContentLoaded', async function() {
  var params = new URLSearchParams(window.location.search);
  TF.adminToken = params.get('admin');
  TF.memberToken = params.get('member');
  TF.prefillManager = params.get('manager') || '';
  if (TF.memberToken) { TF.mode = 'member'; tfInitMember(); }
  else if (TF.adminToken) { TF.mode = 'dashboard'; tfInitDashboard(); }
  else {
    var sessRes = await supabase.auth.getSession();
    var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user && sessRes.data.session.user.id;
    if (userId) {
      var syncRes = await supabase.rpc('tf_get_my_surveys');
      if (!syncRes.error && Array.isArray(syncRes.data)) {
        tfMergeAndSaveTeams(syncRes.data);
      }
    }
    var savedTeams = tfGetSavedTeams();
    if (savedTeams.length > 0) { TF.mode = 'teams'; tfInitTeams(); return; }
    var legacyToken = localStorage.getItem('tf_admin_token');
    if (legacyToken) { window.location.href = 'team-form.html?admin=' + legacyToken; return; }
    TF.mode = 'create'; tfInitCreate();
  }
});
```

- [ ] **Étape 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

Résultat attendu : aucune sortie.

- [ ] **Étape 3 : Committer**

```bash
git add js/team-form.js
git commit -m "feat(team-form): sync surveys from Supabase on load for multi-device support"
```

---

## Task 4 : Test manuel de bout en bout

Pas de framework de test — vérification manuelle dans le navigateur.

- [ ] **Étape 1 : Tester le scénario "nouvel appareil"**

1. Ouvrir `https://mybloomday.app/team-form.html` dans un navigateur où le localStorage est vide (mode navigation privée ou nouveau profil).
2. Se connecter avec un compte Bloomday qui a déjà des équipes créées après la migration.
3. Vérifier que la vue "liste des équipes" s'affiche avec les équipes du compte — sans avoir eu à saisir de token manuellement.

- [ ] **Étape 2 : Tester le scénario "création → autre appareil"**

1. Sur l'appareil A (connecté), créer une nouvelle équipe via le wizard.
2. Dans le SQL Editor Supabase, vérifier que la nouvelle ligne dans `surveys` a bien un `user_id` non-null :
   ```sql
   SELECT token, team_name, user_id FROM surveys ORDER BY created_at DESC LIMIT 5;
   ```
3. Sur l'appareil B (même compte, localStorage vide), ouvrir `team-form.html` et vérifier que l'équipe créée en étape 1 apparaît.

- [ ] **Étape 3 : Tester la rétrocompatibilité**

1. Sur un appareil avec des équipes en localStorage (créées avant la migration, `user_id = NULL`).
2. Ouvrir `team-form.html` → ces équipes doivent toujours apparaître (elles viennent du localStorage, pas de Supabase).
3. Les nouvelles équipes créées depuis doivent apparaître sur d'autres appareils.

- [ ] **Étape 4 : Tester l'utilisateur non connecté**

1. Ouvrir `team-form.html` sans être connecté (session Supabase nulle).
2. Vérifier que la page charge normalement sans erreur console — la sync Supabase est simplement ignorée.

- [ ] **Étape 5 : Déployer**

```bash
git push origin main
```

Vérifier le déploiement Netlify puis retester sur `https://mybloomday.app/team-form.html`.
