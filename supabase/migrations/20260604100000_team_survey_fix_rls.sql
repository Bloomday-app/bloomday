-- FIX: Supprimer les policies "authenticated = tout" sur surveys/survey_members.
-- Ces policies permettent à n'importe quel utilisateur Bloomday connecté de lire
-- ou modifier TOUTES les surveys (IDOR / horizontal privilege escalation).
--
-- Tout l'accès passe déjà par les fonctions SECURITY DEFINER (tf_create_survey,
-- tf_get_dashboard, tf_refresh_dashboard, tf_get_member_form, tf_submit_member_form)
-- qui valident le token en interne. Aucun accès direct n'est nécessaire.

DROP POLICY IF EXISTS "surveys_auth_all" ON surveys;
DROP POLICY IF EXISTS "survey_members_auth_all" ON survey_members;
