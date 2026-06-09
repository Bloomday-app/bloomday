-- Permet à un utilisateur connecté de réclamer des enquêtes créées anonymement
-- ou avant la migration user_id, en fournissant leurs admin tokens.
-- Seules les enquêtes sans user_id (user_id IS NULL) peuvent être réclamées.
CREATE OR REPLACE FUNCTION tf_claim_surveys(p_tokens text[])
RETURNS int
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_count int;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 0; END IF;
  UPDATE surveys
  SET user_id = auth.uid()
  WHERE token = ANY(p_tokens)
    AND user_id IS NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION tf_claim_surveys(text[]) TO authenticated;
