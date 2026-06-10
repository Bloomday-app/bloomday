-- Supprime un membre d'un survey identifié par son admin token.
-- Retourne true si supprimé, false si admin token invalide.
CREATE OR REPLACE FUNCTION tf_remove_member(p_admin_token text, p_member_token text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid;
BEGIN
  SELECT id INTO v_survey_id FROM surveys WHERE token = p_admin_token LIMIT 1;
  IF v_survey_id IS NULL THEN RETURN false; END IF;
  DELETE FROM survey_members WHERE survey_id = v_survey_id AND token = p_member_token;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION tf_remove_member(text, text) TO anon;
