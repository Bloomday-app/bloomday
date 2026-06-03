alter table public.members
  add column if not exists notif_days_before integer default null,
  add column if not exists notif_time text default null;
