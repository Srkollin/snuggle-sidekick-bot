ALTER TABLE public.pools ADD COLUMN IF NOT EXISTS assigned_employees jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE public.pool_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  pool_id uuid NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  author_name text,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pool_observations TO authenticated;
GRANT ALL ON public.pool_observations TO service_role;

ALTER TABLE public.pool_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pool_observations_select_company" ON public.pool_observations FOR SELECT TO authenticated
USING (company_id IN (SELECT profiles.company_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "pool_observations_insert_company" ON public.pool_observations FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() AND company_id IN (SELECT profiles.company_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "pool_observations_update_company" ON public.pool_observations FOR UPDATE TO authenticated
USING (company_id IN (SELECT profiles.company_id FROM public.profiles WHERE profiles.id = auth.uid()))
WITH CHECK (company_id IN (SELECT profiles.company_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "pool_observations_delete_company" ON public.pool_observations FOR DELETE TO authenticated
USING (company_id IN (SELECT profiles.company_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE TRIGGER pool_observations_set_updated_at BEFORE UPDATE ON public.pool_observations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX pool_observations_pool_id_idx ON public.pool_observations(pool_id);