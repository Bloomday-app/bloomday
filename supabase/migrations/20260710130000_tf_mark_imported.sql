-- Les updates directs sur survey_members.imported_at échouaient silencieusement :
-- la RLS de survey_members n'a plus de policy directe depuis 20260604100000_team_survey_fix_rls.sql,
-- tout accès doit passer par une fonction SECURITY DEFINER (comme tf_submit_member_form).
CREATE OR REPLACE FUNCTION tf_mark_imported(p_tokens text[])
RETURNS int
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE rows_updated int;
BEGIN
  UPDATE survey_members
  SET imported_at = now()
  WHERE token = ANY(p_tokens)
    AND imported_at IS NULL;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION tf_mark_imported(text[]) TO anon, authenticated;
