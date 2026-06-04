-- Ajoute un membre à une équipe existante, validé par l'admin token.
-- Retourne le membre créé (row_to_json) ou NULL si token invalide.
CREATE OR REPLACE FUNCTION tf_add_member(
  p_admin_token text,
  p_member      jsonb
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_survey_id uuid;
BEGIN
  SELECT id INTO v_survey_id FROM surveys WHERE token = p_admin_token LIMIT 1;
  IF v_survey_id IS NULL THEN RETURN NULL; END IF;

  INSERT INTO survey_members (survey_id, token, first_name, last_name, email, relation)
  VALUES (
    v_survey_id,
    gen_random_uuid()::text,
    p_member->>'first_name',
    p_member->>'last_name',
    NULLIF(p_member->>'email', ''),
    NULLIF(p_member->>'relation', '')
  );

  RETURN (
    SELECT row_to_json(m)
    FROM survey_members m
    WHERE m.survey_id = v_survey_id
    ORDER BY m.created_at DESC
    LIMIT 1
  );
END;
$$;

GRANT EXECUTE ON FUNCTION tf_add_member(text, jsonb) TO anon;
