-- Stocker le prénom du co-admin (lu depuis son profil Bloomday au moment du claim)
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS co_admin_name TEXT;

-- tf_claim_coadmin : lit le nom depuis profiles ou auth.users et le stocke
CREATE OR REPLACE FUNCTION tf_claim_coadmin(p_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_survey surveys%ROWTYPE;
  v_co_admin_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('error', 'unauthenticated');
  END IF;
  SELECT * INTO v_survey FROM surveys WHERE co_admin_token = p_token LIMIT 1;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'invalid_token');
  END IF;
  IF v_survey.user_id = auth.uid() THEN
    RETURN json_build_object('error', 'already_owner');
  END IF;

  -- Lit le prénom depuis le profil Bloomday, avec fallback auth metadata
  SELECT COALESCE(
    NULLIF(p.name, ''),
    NULLIF(u.raw_user_meta_data->>'full_name', ''),
    NULLIF(u.raw_user_meta_data->>'name', ''),
    u.email
  ) INTO v_co_admin_name
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  WHERE u.id = auth.uid();

  IF NOT (v_survey.co_admin_user_ids @> to_jsonb(auth.uid()::text)) THEN
    UPDATE surveys
    SET co_admin_user_ids = co_admin_user_ids || to_jsonb(auth.uid()::text),
        co_admin_name = v_co_admin_name
    WHERE id = v_survey.id;
  ELSE
    -- Met à jour le nom si le profil a changé depuis le dernier claim
    UPDATE surveys SET co_admin_name = v_co_admin_name WHERE id = v_survey.id;
  END IF;

  RETURN json_build_object(
    'co_admin_token', v_survey.co_admin_token,
    'team_name',      v_survey.team_name,
    'manager_name',   v_survey.manager_name,
    'co_admin_name',  v_co_admin_name
  );
END;
$$;
GRANT EXECUTE ON FUNCTION tf_claim_coadmin(text) TO authenticated;

-- tf_get_coadmin_info : retourne maintenant co_admin_name
CREATE OR REPLACE FUNCTION tf_get_coadmin_info(p_admin_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_result json;
BEGIN
  SELECT json_build_object(
    'co_admin_token',     s.co_admin_token,
    'invited_email',      ci.email,
    'co_admin_name',      s.co_admin_name,
    'has_active_coadmin', (jsonb_array_length(s.co_admin_user_ids) > 0)
  ) INTO v_result
  FROM surveys s
  LEFT JOIN co_admin_invitations ci ON ci.survey_id = s.id
  WHERE s.token = p_admin_token
  LIMIT 1;
  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION tf_get_coadmin_info(text) TO anon;

-- tf_get_my_surveys : pour les surveys co-admin, retourne le prénom du co-admin (pas du manager original)
CREATE OR REPLACE FUNCTION tf_get_my_surveys()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'token',        CASE WHEN s.user_id = auth.uid() THEN s.token ELSE s.co_admin_token END,
      'team_name',    s.team_name,
      'manager_name', CASE WHEN s.user_id = auth.uid() THEN s.manager_name ELSE s.co_admin_name END,
      'created_at',   s.created_at,
      'is_coadmin',   (s.user_id IS DISTINCT FROM auth.uid())
    ) ORDER BY s.created_at DESC
  ) INTO result
  FROM surveys s
  WHERE s.user_id = auth.uid()
     OR (s.co_admin_user_ids @> to_jsonb(auth.uid()::text));
  RETURN COALESCE(result, '[]'::json);
END;
$$;
GRANT EXECUTE ON FUNCTION tf_get_my_surveys() TO authenticated;
