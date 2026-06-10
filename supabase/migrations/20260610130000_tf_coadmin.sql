-- ── CO-ADMIN : SCHÉMA ──

-- Colonnes co-admin dans surveys
ALTER TABLE surveys
  ADD COLUMN IF NOT EXISTS co_admin_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  ADD COLUMN IF NOT EXISTS co_admin_user_ids JSONB DEFAULT '[]'::jsonb;

-- Suivi des emails invités (pour affichage dans le dashboard)
CREATE TABLE IF NOT EXISTS co_admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── CO-ADMIN : RPCs ──

-- Claim : le co-admin appelle cette RPC après login pour lier son user_id au survey
CREATE OR REPLACE FUNCTION tf_claim_coadmin(p_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey surveys%ROWTYPE;
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
  IF NOT (v_survey.co_admin_user_ids @> to_jsonb(auth.uid()::text)) THEN
    UPDATE surveys
    SET co_admin_user_ids = co_admin_user_ids || to_jsonb(auth.uid()::text)
    WHERE id = v_survey.id;
  END IF;
  RETURN json_build_object(
    'co_admin_token', v_survey.co_admin_token,
    'team_name',      v_survey.team_name,
    'manager_name',   v_survey.manager_name
  );
END;
$$;
GRANT EXECUTE ON FUNCTION tf_claim_coadmin(text) TO authenticated;

-- Dashboard co-admin : même structure que tf_get_dashboard mais sans exposer le token admin
CREATE OR REPLACE FUNCTION tf_get_dashboard_coadmin(p_coadmin_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_result json;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT json_build_object(
    'survey', json_build_object(
      'id',              s.id,
      'team_name',       s.team_name,
      'manager_name',    s.manager_name,
      'invite_message',  s.invite_message,
      'relation_labels', s.relation_labels,
      'created_at',      s.created_at
    ),
    'members', COALESCE(
      (SELECT json_agg(m ORDER BY m.created_at) FROM survey_members m WHERE m.survey_id = s.id),
      '[]'::json
    )
  ) INTO v_result
  FROM surveys s
  WHERE s.co_admin_token = p_coadmin_token
    AND (s.co_admin_user_ids @> to_jsonb(auth.uid()::text));
  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION tf_get_dashboard_coadmin(text) TO authenticated;

-- Refresh membres (polling) pour co-admin
CREATE OR REPLACE FUNCTION tf_refresh_dashboard_coadmin(p_coadmin_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid; v_members json;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT id INTO v_survey_id FROM surveys
  WHERE co_admin_token = p_coadmin_token
    AND (co_admin_user_ids @> to_jsonb(auth.uid()::text));
  IF v_survey_id IS NULL THEN RETURN NULL; END IF;
  SELECT json_agg(m ORDER BY m.created_at) INTO v_members
  FROM survey_members m WHERE m.survey_id = v_survey_id;
  RETURN COALESCE(v_members, '[]'::json);
END;
$$;
GRANT EXECUTE ON FUNCTION tf_refresh_dashboard_coadmin(text) TO authenticated;

-- Ajout membre pour co-admin
CREATE OR REPLACE FUNCTION tf_add_member_coadmin(p_coadmin_token text, p_member jsonb)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid; v_new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT id INTO v_survey_id FROM surveys
  WHERE co_admin_token = p_coadmin_token
    AND (co_admin_user_ids @> to_jsonb(auth.uid()::text));
  IF v_survey_id IS NULL THEN RETURN NULL; END IF;
  IF p_member->>'first_name' IS NULL OR trim(p_member->>'first_name') = '' THEN
    RETURN NULL;
  END IF;
  INSERT INTO survey_members (survey_id, token, first_name, last_name, email, relation)
  VALUES (
    v_survey_id,
    gen_random_uuid()::text,
    p_member->>'first_name',
    p_member->>'last_name',
    NULLIF(p_member->>'email', ''),
    NULLIF(p_member->>'relation', '')
  )
  RETURNING id INTO v_new_id;
  RETURN (SELECT row_to_json(m) FROM survey_members m WHERE m.id = v_new_id);
END;
$$;
GRANT EXECUTE ON FUNCTION tf_add_member_coadmin(text, jsonb) TO authenticated;

-- Révoquer l'accès co-admin (propriétaire uniquement, via admin token)
CREATE OR REPLACE FUNCTION tf_revoke_coadmin(p_admin_token text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid;
BEGIN
  SELECT id INTO v_survey_id FROM surveys WHERE token = p_admin_token LIMIT 1;
  IF v_survey_id IS NULL THEN RETURN false; END IF;
  UPDATE surveys
  SET co_admin_user_ids = '[]'::jsonb,
      co_admin_token = gen_random_uuid()::text
  WHERE id = v_survey_id;
  DELETE FROM co_admin_invitations WHERE survey_id = v_survey_id;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION tf_revoke_coadmin(text) TO anon;

-- Enregistrer l'email de l'invitation (pour affichage)
CREATE OR REPLACE FUNCTION tf_save_coadmin_invitation(p_admin_token text, p_email text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid;
BEGIN
  SELECT id INTO v_survey_id FROM surveys WHERE token = p_admin_token LIMIT 1;
  IF v_survey_id IS NULL THEN RETURN false; END IF;
  DELETE FROM co_admin_invitations WHERE survey_id = v_survey_id;
  INSERT INTO co_admin_invitations (survey_id, email) VALUES (v_survey_id, p_email);
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION tf_save_coadmin_invitation(text, text) TO anon;

-- Infos co-admin pour un survey (utilisé pour afficher la section dans le dashboard)
CREATE OR REPLACE FUNCTION tf_get_coadmin_info(p_admin_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_result json;
BEGIN
  SELECT json_build_object(
    'co_admin_token', s.co_admin_token,
    'invited_email',  ci.email,
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

-- Mise à jour de tf_get_my_surveys : inclure les surveys co-admin
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
      'manager_name', s.manager_name,
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
