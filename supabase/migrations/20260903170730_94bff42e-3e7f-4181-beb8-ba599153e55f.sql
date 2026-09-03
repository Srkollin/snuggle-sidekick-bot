CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  trade_name text NOT NULL,
  legal_name text,
  tax_id text,
  email text,
  phone text,
  address text,
  postal_code text,
  city text,
  province text,
  country text NOT NULL DEFAULT 'España',
  website text,
  employees_range text,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  services_other text,
  modules jsonb NOT NULL DEFAULT '[]'::jsonb,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  full_name text,
  role_title text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  name text NOT NULL,
  address text,
  photo_path text,
  status text NOT NULL DEFAULT 'abierta',
  dosing_type text,
  dosing_other text,
  has_kids_pool boolean NOT NULL DEFAULT false,
  kids_name text,
  kids_dosing_type text,
  kids_dosing_other text,
  has_lifeguard boolean NOT NULL DEFAULT false,
  lifeguards_count integer NOT NULL DEFAULT 0,
  has_doorman boolean NOT NULL DEFAULT false,
  doormen_count integer NOT NULL DEFAULT 0,
  other_staff jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pools TO authenticated;
GRANT ALL ON public.pools TO service_role;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE POLICY "companies_select_own" ON public.companies FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR id = public.current_company_id());
CREATE POLICY "companies_insert_own" ON public.companies FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "companies_update_own" ON public.companies FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "companies_delete_own" ON public.companies FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "pools_select_company" ON public.pools FOR SELECT TO authenticated
  USING (company_id = public.current_company_id());
CREATE POLICY "pools_insert_company" ON public.pools FOR INSERT TO authenticated
  WITH CHECK (company_id = public.current_company_id() AND created_by = auth.uid());
CREATE POLICY "pools_update_company" ON public.pools FOR UPDATE TO authenticated
  USING (company_id = public.current_company_id()) WITH CHECK (company_id = public.current_company_id());
CREATE POLICY "pools_delete_company" ON public.pools FOR DELETE TO authenticated
  USING (company_id = public.current_company_id());

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER pools_updated_at BEFORE UPDATE ON public.pools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role_title, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'role_title',
    NEW.raw_user_meta_data ->> 'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "pool_photos_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pool-photos');
CREATE POLICY "pool_photos_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pool-photos');
CREATE POLICY "pool_photos_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'pool-photos');
CREATE POLICY "pool_photos_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pool-photos');