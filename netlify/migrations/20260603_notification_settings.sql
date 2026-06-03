alter table public.profiles
  add column if not exists notification_settings jsonb default '{"enabled":false,"daysBefore":1,"time":"09:00","festivalsEnabled":false}'::jsonb;
