CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  team_name text NOT NULL,
  manager_name text NOT NULL DEFAULT '',
  relation_labels jsonb NOT NULL DEFAULT '["Collègue","Manager","Directeur·rice","Stagiaire","Ami(e)","Autre"]',
  invite_message text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS survey_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL DEFAULT '',
  email text,
  birth_day int,
  birth_month int,
  birth_year int,
  gender text,
  relation text,
  married boolean DEFAULT false,
  spouse_name text,
  wedding_day int,
  wedding_month int,
  wedding_year int,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "surveys_public" ON surveys FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE survey_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "survey_members_public" ON survey_members FOR ALL USING (true) WITH CHECK (true);
