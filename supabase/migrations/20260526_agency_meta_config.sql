-- Meta App credentials at agency level (needed for OAuth)
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS meta_app_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_app_secret TEXT;
