# Team-Form — Synchronisation multi-appareils

**Date :** 2026-06-09
**Statut :** Approuvé

## Contexte

Le team-form permet à un manager (toujours authentifié Bloomday) de créer une enquête d'équipe. Actuellement, les tokens admin sont stockés uniquement dans `localStorage`. Si l'utilisateur change d'appareil ou de navigateur, il perd l'accès à ses équipes alors que les données existent dans Supabase.

Les membres qui reçoivent le formulaire sont anonymes — ils ne sont pas obligatoirement des utilisateurs Bloomday. Seul le créateur (admin) est authentifié.

## Objectif

Lier chaque survey au compte Bloomday de son créateur, de sorte que la liste des équipes soit récupérée depuis Supabase sur tout appareil connecté au même compte.

## Architecture

### 1. Base de données

**Migration** : ajouter `user_id` à la table `surveys`.

```sql
ALTER TABLE surveys
  ADD COLUMN user_id uuid REFERENCES auth.users(id);
```

- Nullable pour rétrocompatibilité (surveys existants gardent `user_id = NULL`).
- Les surveys sans `user_id` restent accessibles via localStorage uniquement.

**Modifier `tf_create_survey`** : capturer `auth.uid()` automatiquement dans le `INSERT`.

```sql
INSERT INTO surveys (token, team_name, manager_name, relation_labels, invite_message, user_id)
VALUES (p_admin_token, p_team_name, p_manager_name, p_relation_labels, p_invite_message, auth.uid())
```

Aucun paramètre supplémentaire côté front — la fonction est déjà `SECURITY DEFINER` et a accès à `auth.uid()`.

**Nouvelle RPC `tf_get_my_surveys`** :

```sql
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

### 2. Frontend (`js/team-form.js`)

**Au chargement** (`DOMContentLoaded`), avant d'afficher la liste des équipes :

1. Récupérer la session Supabase.
2. Si l'utilisateur est connecté, appeler `tf_get_my_surveys`.
3. Fusionner les résultats avec le localStorage (dédupliqué par `token`).
4. Continuer avec la logique existante (`tfGetSavedTeams`).

**Nouvelle fonction `tfMergeAndSaveTeams(remoteTeams)`** :

- Pour chaque team distante, si le token n'existe pas encore en localStorage, l'ajouter via `tfSaveAdminToken`.
- Ne supprime rien du localStorage — les équipes locales sans `user_id` (anciennes) restent accessibles.

**Aucun changement** à :
- `tfSubmitCreate` — le `user_id` est capturé automatiquement en SQL
- `tfInitDashboard`, `tfSaveAdminToken`, `tfRenderDashboard` — comportement inchangé

## Comportement par appareil

| Scénario | Résultat |
|---|---|
| Appareil A (existant, équipes en localStorage) | Inchangé — localStorage chargé normalement. Nouvelles équipes liées au compte. |
| Appareil B (nouveau, même compte) | `tf_get_my_surveys` retourne toutes les équipes → localStorage se peuple → accès complet. |
| Équipes créées avant la migration | `user_id = NULL` → visibles uniquement sur l'appareil où le token est en localStorage. |
| Utilisateur non connecté | `tf_get_my_surveys` non appelé → comportement actuel (localStorage seul). |

## Périmètre

- Les membres qui remplissent le formulaire ne sont pas touchés — leur accès reste token-based et anonyme.
- Pas de modification du flow de création, du dashboard, ni de la suppression d'équipe.
- Pas d'i18n nécessaire — aucune string visible par l'utilisateur n'est ajoutée.

## Plan d'implémentation (ordre)

1. Migration SQL : `ALTER TABLE surveys ADD COLUMN user_id`
2. Modifier `tf_create_survey` pour insérer `auth.uid()`
3. Créer `tf_get_my_surveys`
4. Ajouter `tfMergeAndSaveTeams` dans `team-form.js`
5. Modifier `DOMContentLoaded` pour appeler la sync avant `tfGetSavedTeams`
6. Vérifier la syntaxe JS (`node --check`)
7. Tester : création sur appareil A → connexion sur appareil B → équipes visibles
