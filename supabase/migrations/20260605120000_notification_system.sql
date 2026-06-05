-- 1. Étendre admin_notifications
ALTER TABLE admin_notifications
  ADD COLUMN IF NOT EXISTS title        text,
  ADD COLUMN IF NOT EXISTS type         text NOT NULL DEFAULT 'announce',
  ADD COLUMN IF NOT EXISTS target_type  text NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS target_uid   uuid;

-- 2. Créer user_notification_reads
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
