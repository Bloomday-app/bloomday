-- Team-Form : synchroniser l'import BLOOMDAY entre admin et co-admin(s).
--
-- Avant ce fix : tfImportMember()/tfSyncBloomday() écrivent les contacts
-- uniquement dans le compte Bloomday de la personne qui clique (user_id =
-- session courante), alors que survey_members.imported_at (qui grise le
-- bouton "Importer") est un statut PARTAGÉ entre tous les admins du survey.
-- Résultat : si la co-admin importe un membre, l'admin voit le bouton
-- grisé sans jamais recevoir les contacts dans son propre compte (et
-- inversement).
--
-- Ce fix n'enlève rien à l'existant : il ajoute une mirroring RPC appelée
-- en plus de l'insert direct déjà en place, qui réplique les mêmes
-- contacts chez les autres admins liés au survey (surveys.user_id +
-- surveys.co_admin_user_ids).

-- Insère (si absent) les fiches Bloomday d'un survey_member chez un
-- utilisateur cible donné. Pas de vérification d'autorisation ici :
-- fonction interne, appelée uniquement par tf_mirror_import_to_coadmins
-- (RPC publique, qui vérifie l'autorisation) et par le script de
-- rattrapage ci-dessous. Ne JAMAIS accorder EXECUTE dessus à
-- anon/authenticated : p_target_user n'est pas validé en interne.
CREATE OR REPLACE FUNCTION tf_ensure_import_row(
  p_team_name text,
  p_member survey_members,
  p_target_user uuid
)
RETURNS int
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_group_id text;
  v_full_name text;
  v_note text;
  v_inserted int := 0;
  v_exists boolean;
BEGIN
  SELECT id INTO v_group_id FROM groups
  WHERE user_id = p_target_user AND name = p_team_name
  LIMIT 1;

  IF v_group_id IS NULL THEN
    v_group_id := gen_random_uuid()::text;
    INSERT INTO groups (id, user_id, name, icon, mode)
    VALUES (v_group_id, p_target_user, p_team_name, '👥', 'biz');
  END IF;

  v_full_name := trim(p_member.first_name || ' ' || coalesce(p_member.last_name, ''));
  v_note := CASE WHEN p_member.relation IS NOT NULL AND p_member.relation <> ''
                 THEN 'Relation : ' || p_member.relation ELSE '' END;

  IF p_member.birth_day IS NOT NULL AND p_member.birth_month IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM members
      WHERE user_id = p_target_user AND group_id = v_group_id
        AND name = v_full_name AND day = p_member.birth_day AND month = p_member.birth_month
        AND type = 'birthday'
    ) INTO v_exists;
    IF NOT v_exists THEN
      INSERT INTO members (id, user_id, group_id, name, day, month, year, phone, note, type, gender, incomplete)
      VALUES (gen_random_uuid()::text, p_target_user, v_group_id, v_full_name, p_member.birth_day, p_member.birth_month,
              p_member.birth_year, '', v_note, 'birthday', coalesce(p_member.gender, ''), false);
      v_inserted := v_inserted + 1;
    END IF;
  END IF;

  IF p_member.married AND p_member.wedding_day IS NOT NULL AND p_member.wedding_month IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM members
      WHERE user_id = p_target_user AND group_id = v_group_id
        AND name = v_full_name || ' (mariage avec ' || coalesce(p_member.spouse_name, '?') || ')'
        AND day = p_member.wedding_day AND month = p_member.wedding_month AND type = 'wedding'
    ) INTO v_exists;
    IF NOT v_exists THEN
      INSERT INTO members (id, user_id, group_id, name, day, month, year, phone, note, type, gender, incomplete)
      VALUES (gen_random_uuid()::text, p_target_user, v_group_id,
              v_full_name || ' (mariage avec ' || coalesce(p_member.spouse_name, '?') || ')',
              p_member.wedding_day, p_member.wedding_month, p_member.wedding_year, '', v_note, 'wedding', '', false);
      v_inserted := v_inserted + 1;
    END IF;
  END IF;

  RETURN v_inserted;
END;
$$;

REVOKE EXECUTE ON FUNCTION tf_ensure_import_row(text, survey_members, uuid) FROM PUBLIC, anon, authenticated;

-- RPC publique : réplique l'import d'un ou plusieurs membres (déjà
-- importés par l'appelant via l'insert direct existant) chez TOUS les
-- AUTRES admins liés au même survey (propriétaire + co-admin(s)).
CREATE OR REPLACE FUNCTION tf_mirror_import_to_coadmins(p_tokens text[])
RETURNS int
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_member survey_members%ROWTYPE;
  v_survey surveys%ROWTYPE;
  v_target uuid;
  v_targets uuid[];
  v_total int := 0;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 0; END IF;

  FOR v_member IN SELECT * FROM survey_members WHERE token = ANY(p_tokens) LOOP
    SELECT * INTO v_survey FROM surveys WHERE id = v_member.survey_id;
    IF NOT FOUND THEN CONTINUE; END IF;

    -- L'appelant doit être admin (propriétaire ou co-admin) de ce survey.
    IF NOT (auth.uid() = v_survey.user_id OR v_survey.co_admin_user_ids @> to_jsonb(auth.uid()::text)) THEN
      CONTINUE;
    END IF;

    v_targets := ARRAY(
      SELECT DISTINCT x FROM unnest(
        ARRAY[v_survey.user_id] || ARRAY(SELECT jsonb_array_elements_text(v_survey.co_admin_user_ids))::uuid[]
      ) AS x
      WHERE x IS DISTINCT FROM auth.uid()
    );

    FOREACH v_target IN ARRAY v_targets LOOP
      v_total := v_total + tf_ensure_import_row(v_survey.team_name, v_member, v_target);
    END LOOP;
  END LOOP;

  RETURN v_total;
END;
$$;

GRANT EXECUTE ON FUNCTION tf_mirror_import_to_coadmins(text[]) TO authenticated;

-- ── RATTRAPAGE ponctuel ──
-- Pour chaque membre déjà marqué importé (imported_at IS NOT NULL) sur un
-- survey qui a au moins un co-admin, s'assure que TOUS les admins liés
-- (propriétaire + co-admins) ont bien les fiches dans leur compte.
DO $$
DECLARE
  v_row RECORD;
  v_member survey_members%ROWTYPE;
  v_target uuid;
  v_targets uuid[];
BEGIN
  FOR v_row IN
    SELECT sm.id, sm.token, s.team_name, s.user_id AS owner_id, s.co_admin_user_ids
    FROM survey_members sm
    JOIN surveys s ON s.id = sm.survey_id
    WHERE sm.imported_at IS NOT NULL
      AND jsonb_array_length(s.co_admin_user_ids) > 0
  LOOP
    SELECT * INTO v_member FROM survey_members WHERE id = v_row.id;

    v_targets := ARRAY(
      SELECT DISTINCT x FROM unnest(
        ARRAY[v_row.owner_id] || ARRAY(SELECT jsonb_array_elements_text(v_row.co_admin_user_ids))::uuid[]
      ) AS x
    );

    FOREACH v_target IN ARRAY v_targets LOOP
      PERFORM tf_ensure_import_row(v_row.team_name, v_member, v_target);
    END LOOP;
  END LOOP;
END $$;
