-- RLS sur admin_notifications : les utilisateurs ne voient que les notifications
-- qui leur sont destinées. La lecture de target_uid ciblé est bloquée serveur-side.

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- SELECT : authentifié peut voir les notifs "all", "free", "premium"
-- et les notifs "user" uniquement si target_uid correspond à son uid
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

-- INSERT/UPDATE/DELETE : bloqué pour tous — seule la service_role (Netlify function) peut écrire
-- (pas besoin de policy, RLS sans policy = deny by default)
