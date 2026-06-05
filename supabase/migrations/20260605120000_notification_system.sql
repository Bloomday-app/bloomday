-- Créer admin_notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message     text NOT NULL,
  title       text,
  type        text NOT NULL DEFAULT 'announce',
  target_type text NOT NULL DEFAULT 'all',
  target_uid  uuid,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- Créer user_notification_reads
CREATE TABLE IF NOT EXISTS user_notification_reads (
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id uuid NOT NULL REFERENCES admin_notifications(id) ON DELETE CASCADE,
  read_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, notification_id)
);

ALTER TABLE user_notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reads_own_select" ON user_notification_reads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reads_own_insert" ON user_notification_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_unr_notification_id
  ON user_notification_reads (notification_id);

-- RLS sur admin_notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_own" ON admin_notifications
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND active = true
    AND (
      target_type IN ('all', 'free', 'premium')
      OR (target_type = 'user' AND target_uid = auth.uid())
    )
  );
