-- CLIENTES
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  client_type text NOT NULL,
  logo_path text,
  name text NOT NULL,
  tax_id text,
  contact_person text,
  contact_role text,
  collegiate_number text,
  managed_communities jsonb NOT NULL DEFAULT '[]'::jsonb,
  phone text,
  email text,
  phone_secondary text,
  address text,
  postal_code text,
  city text,
  province text,
  billing_same boolean NOT NULL DEFAULT true,
  billing_address text,
  billing_postal_code text,
  billing_city text,
  billing_province text,
  payment_method text,
  iban text,
  account_holder text,
  requires_invoice boolean NOT NULL DEFAULT true,
  notes text,
  is_draft boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY clients_select_company ON public.clients FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY clients_insert_company ON public.clients FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY clients_update_company ON public.clients FOR UPDATE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY clients_delete_company ON public.clients FOR DELETE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE TRIGGER clients_set_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PISCINAS: cliente y temporada
ALTER TABLE public.pools
  ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN opening_date date,
  ADD COLUMN closing_date date,
  ADD COLUMN open_all_year boolean NOT NULL DEFAULT false;

-- ENLACES DE INVITACIÓN A EMPLEADOS
CREATE TABLE public.employee_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  token text NOT NULL UNIQUE,
  roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  roles_other text,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_invites TO authenticated;
GRANT ALL ON public.employee_invites TO service_role;
ALTER TABLE public.employee_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY invites_select_company ON public.employee_invites FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY invites_insert_company ON public.employee_invites FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY invites_update_company ON public.employee_invites FOR UPDATE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE TRIGGER invites_set_updated_at BEFORE UPDATE ON public.employee_invites FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- EMPLEADOS
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invite_id uuid REFERENCES public.employee_invites(id) ON DELETE SET NULL,
  roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  roles_other text,
  photo_path text,
  full_name text NOT NULL,
  birth_date date,
  national_id text,
  phone text,
  email text,
  address text,
  city text,
  postal_code text,
  id_front_path text,
  id_back_path text,
  work_permit_path text,
  has_ssn boolean NOT NULL DEFAULT false,
  ssn text,
  nationality text,
  birth_place text,
  birth_province text,
  father_name text,
  mother_name text,
  marital_status text,
  education_level text,
  first_job_in_spain boolean,
  iban text,
  account_holder text,
  lifeguard_cert_path text,
  lifeguard_issued_at date,
  lifeguard_expires_at date,
  ats_cert_path text,
  ats_issued_at date,
  ats_expires_at date,
  technician_cert_path text,
  approval_status text NOT NULL DEFAULT 'pendiente',
  pending_ssn boolean NOT NULL DEFAULT false,
  work_status text NOT NULL DEFAULT 'fuera_de_turno',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY employees_select_company ON public.employees FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY employees_insert_company ON public.employees FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY employees_update_company ON public.employees FOR UPDATE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY employees_delete_company ON public.employees FOR DELETE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE TRIGGER employees_set_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ALMACENAMIENTO privado para clientes y empleados
CREATE POLICY "client_logos_company_all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'client-logos') WITH CHECK (bucket_id = 'client-logos');
CREATE POLICY "employee_docs_company_all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'employee-docs') WITH CHECK (bucket_id = 'employee-docs');
CREATE POLICY "employee_docs_public_insert" ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'employee-docs');