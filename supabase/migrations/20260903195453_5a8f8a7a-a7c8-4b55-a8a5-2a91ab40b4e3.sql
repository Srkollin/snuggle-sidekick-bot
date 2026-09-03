ALTER TABLE public.pool_records
  ADD COLUMN IF NOT EXISTS opening_time text,
  ADD COLUMN IF NOT EXISTS closing_time text,
  ADD COLUMN IF NOT EXISTS rest_start text,
  ADD COLUMN IF NOT EXISTS rest_end text;