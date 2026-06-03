-- SECURITY HARDENING: remplace les policies permissives par des fonctions SECURITY DEFINER
-- Les clients anonymes ne peuvent plus lire/écrire directement les tables surveys/survey_members.
-- Tout accès passe par des RPCs qui valident le token en interne.

-- 1. Supprimer les policies permissives existantes
DROP POLICY IF EXISTS "surveys_public" ON surveys;
DROP POLICY IF EXISTS "survey_members_public" ON survey_members;

-- 2. Aucune policy directe pour anon ni authenticated.
-- Tout accès passe par les fonctions SECURITY DEFINER ci-dessous.
-- (Les policies "surveys_auth_all" / "survey_members_auth_all" ont été retirées
--  via 20260604100000_team_survey_fix_rls.sql : IDOR si laissées.)

-- 3. Fonctions SECURITY DEFINER (bypassent RLS, valident le token en interne)

-- Crée une équipe + ses membres en une transaction atomique
CREATE OR REPLACE FUNCTION tf_create_survey(
  p_admin_token   text,
  p_team_name     text,
  p_manager_name  text,
  p_relation_labels jsonb,
  p_invite_message text,
  p_members       jsonb   -- [{token, first_name, last_name, email, relation}]
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid;
BEGIN
  INSERT INTO surveys (token, team_name, manager_name, relation_labels, invite_message)
  VALUES (p_admin_token, p_team_name, p_manager_name, p_relation_labels, p_invite_message)
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

-- Retourne survey + membres complets (vue dashboard admin)
CREATE OR REPLACE FUNCTION tf_get_dashboard(p_admin_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey json; v_members json;
BEGIN
  SELECT row_to_json(s) INTO v_survey
  FROM surveys s WHERE s.token = p_admin_token LIMIT 1;

  IF v_survey IS NULL THEN RETURN NULL; END IF;

  SELECT json_agg(m ORDER BY m.created_at) INTO v_members
  FROM survey_members m
  WHERE m.survey_id = (v_survey->>'id')::uuid;

  RETURN json_build_object(
    'survey',  v_survey,
    'members', COALESCE(v_members, '[]'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION tf_get_dashboard(text) TO anon;

-- Retourne seulement la liste des membres (pour le polling côté dashboard)
CREATE OR REPLACE FUNCTION tf_refresh_dashboard(p_admin_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid; v_members json;
BEGIN
  SELECT id INTO v_survey_id FROM surveys WHERE token = p_admin_token LIMIT 1;
  IF v_survey_id IS NULL THEN RETURN NULL; END IF;

  SELECT json_agg(m ORDER BY m.created_at) INTO v_members
  FROM survey_members m WHERE m.survey_id = v_survey_id;

  RETURN COALESCE(v_members, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION tf_refresh_dashboard(text) TO anon;

-- Retourne les données du formulaire membre (pour remplissage)
CREATE OR REPLACE FUNCTION tf_get_member_form(p_member_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE result json;
BEGIN
  SELECT json_build_object(
    'id',           m.id,
    'survey_id',    m.survey_id,
    'token',        m.token,
    'first_name',   m.first_name,
    'last_name',    m.last_name,
    'email',        m.email,
    'birth_day',    m.birth_day,
    'birth_month',  m.birth_month,
    'birth_year',   m.birth_year,
    'gender',       m.gender,
    'relation',     m.relation,
    'married',      m.married,
    'spouse_name',  m.spouse_name,
    'wedding_day',  m.wedding_day,
    'wedding_month',m.wedding_month,
    'wedding_year', m.wedding_year,
    'completed',    m.completed,
    'surveys', json_build_object(
      'manager_name',   s.manager_name,
      'team_name',      s.team_name,
      'invite_message', s.invite_message
    )
  ) INTO result
  FROM survey_members m
  JOIN surveys s ON s.id = m.survey_id
  WHERE m.token = p_member_token
  LIMIT 1;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION tf_get_member_form(text) TO anon;

-- Soumet le formulaire membre (idempotent : refuse si déjà complété)
-- Retourne true si OK, false si token invalide ou déjà soumis
CREATE OR REPLACE FUNCTION tf_submit_member_form(
  p_member_token  text,
  p_birth_day     int,
  p_birth_month   int,
  p_birth_year    int,
  p_gender        text,
  p_married       boolean,
  p_spouse_name   text,
  p_wedding_day   int,
  p_wedding_month int,
  p_wedding_year  int
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE rows_updated int;
BEGIN
  UPDATE survey_members SET
    birth_day    = p_birth_day,
    birth_month  = p_birth_month,
    birth_year   = p_birth_year,
    gender       = p_gender,
    married      = p_married,
    spouse_name  = p_spouse_name,
    wedding_day  = p_wedding_day,
    wedding_month= p_wedding_month,
    wedding_year = p_wedding_year,
    completed    = true,
    completed_at = now()
  WHERE token = p_member_token
    AND completed = false;   -- empêche la double soumission

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION tf_submit_member_form(text, int, int, int, text, boolean, text, int, int, int) TO anon;
