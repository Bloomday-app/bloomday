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
