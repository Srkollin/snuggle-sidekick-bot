CREATE TABLE public.pool_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null,
  pool_id uuid not null references public.pools(id) on delete cascade,
  vessel text not null default 'principal',
  record_date date not null,
  record_time text not null,
  technician_name text,
  control_type text not null default 'rutina',
  ph numeric not null,
  free_chlorine numeric,
  turbidity numeric not null,
  water_temperature numeric,
  transparency text,
  disinfectant_type text,
  combined_chlorine numeric,
  bromine_total numeric,
  isocyanuric_acid numeric,
  redox numeric,
  ecoli text,
  pseudomonas text,
  legionella numeric,
  aerobic_count numeric,
  total_coliforms numeric,
  lab_certificate_path text,
  bathers_count integer,
  water_meter numeric,
  recirculation_hours numeric,
  alerts jsonb not null default '[]'::jsonb,
  vessel_status text not null default 'abierto',
  has_incident boolean not null default false,
  incident_description text,
  corrective_action text,
  reopening_time text,
  incident_photo_path text,
  signed_by text,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pool_records TO authenticated;
GRANT ALL ON public.pool_records TO service_role;

ALTER TABLE public.pool_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY pool_records_select_company ON public.pool_records FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY pool_records_insert_company ON public.pool_records FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY pool_records_update_company ON public.pool_records FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY pool_records_delete_company ON public.pool_records FOR DELETE TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE TRIGGER pool_records_set_updated_at BEFORE UPDATE ON public.pool_records
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "libro_sanitario_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'libro-sanitario');
CREATE POLICY "libro_sanitario_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'libro-sanitario');
CREATE POLICY "libro_sanitario_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'libro-sanitario');