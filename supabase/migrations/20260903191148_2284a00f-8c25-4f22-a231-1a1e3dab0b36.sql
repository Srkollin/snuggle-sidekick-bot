ALTER TABLE public.pool_records
  ADD COLUMN IF NOT EXISTS attention_status text NOT NULL DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS attended_by uuid,
  ADD COLUMN IF NOT EXISTS attended_by_name text,
  ADD COLUMN IF NOT EXISTS attended_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS attention_notes text;

CREATE INDEX IF NOT EXISTS pool_records_attention_idx
  ON public.pool_records (company_id, attention_status);