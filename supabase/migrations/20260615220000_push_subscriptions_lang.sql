ALTER TABLE public.push_subscriptions
ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'fr';
