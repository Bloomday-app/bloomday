alter table public.members
  add column if not exists incomplete boolean default false;
