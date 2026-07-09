-- Ajout du suivi d'import pour éviter les doublons (Team-Form → Bloomday).
-- Nullable : les lignes existantes restent "non importées" (imported_at IS NULL).
ALTER TABLE survey_members
  ADD COLUMN IF NOT EXISTS imported_at timestamptz;
