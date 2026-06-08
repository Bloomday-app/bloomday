-- Supprime un survey (et ses membres) identifié par son admin token.
-- Retourne true si supprimé, false si token inconnu.
CREATE OR REPLACE FUNCTION tf_delete_survey(p_admin_token text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid;
BEGIN
  SELECT id INTO v_survey_id FROM surveys WHERE token = p_admin_token LIMIT 1;
  IF v_survey_id IS NULL THEN RETURN false; END IF;
  DELETE FROM survey_members WHERE survey_id = v_survey_id;
  DELETE FROM surveys WHERE id = v_survey_id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION tf_delete_survey(text) TO anon;
