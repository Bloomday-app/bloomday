-- Ajout des colonnes téléphone dans survey_members
ALTER TABLE survey_members ADD COLUMN IF NOT EXISTS phone_code   text;
ALTER TABLE survey_members ADD COLUMN IF NOT EXISTS phone_number text;

-- Suppression de l'ancienne signature (paramètres différents = nouvel overload sinon)
DROP FUNCTION IF EXISTS tf_submit_member_form(text, int, int, int, text, boolean, text, int, int, int);

-- Nouvelle version : accepte first_name, last_name, phone_code, phone_number en plus
CREATE OR REPLACE FUNCTION tf_submit_member_form(
  p_member_token  text,
  p_first_name    text,
  p_last_name     text,
  p_birth_day     int,
  p_birth_month   int,
  p_birth_year    int,
  p_gender        text,
  p_married       boolean,
  p_spouse_name   text,
  p_wedding_day   int,
  p_wedding_month int,
  p_wedding_year  int,
  p_phone_code    text DEFAULT NULL,
  p_phone_number  text DEFAULT NULL
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE rows_updated int;
BEGIN
  UPDATE survey_members SET
    first_name    = COALESCE(NULLIF(TRIM(p_first_name), ''), first_name),
    last_name     = COALESCE(NULLIF(TRIM(p_last_name),  ''), last_name),
    phone_code    = COALESCE(NULLIF(TRIM(p_phone_code),   ''), phone_code),
    phone_number  = COALESCE(NULLIF(TRIM(p_phone_number), ''), phone_number),
    birth_day     = p_birth_day,
    birth_month   = p_birth_month,
    birth_year    = p_birth_year,
    gender        = p_gender,
    married       = p_married,
    spouse_name   = p_spouse_name,
    wedding_day   = p_wedding_day,
    wedding_month = p_wedding_month,
    wedding_year  = p_wedding_year,
    completed     = true,
    completed_at  = now()
  WHERE token = p_member_token
    AND completed = false;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION tf_submit_member_form(text, text, text, int, int, int, text, boolean, text, int, int, int, text, text) TO anon;
