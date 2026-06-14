-- Add photo_url to profiles for cross-device persistence
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
