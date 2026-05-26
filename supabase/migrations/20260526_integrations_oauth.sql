ALTER TABLE public.integrations
  ADD COLUMN IF NOT EXISTS access_token       TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS external_account_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_data          JSONB;
