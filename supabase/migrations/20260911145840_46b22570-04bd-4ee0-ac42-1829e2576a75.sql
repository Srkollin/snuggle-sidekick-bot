
-- Helper: is a folder name a valid, usable invite token?
CREATE OR REPLACE FUNCTION public.is_valid_invite_token(_token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employee_invites i
    WHERE i.token = _token
      AND i.is_active
      AND i.expires_at > now()
      AND (i.max_uses IS NULL OR i.used_count < i.max_uses)
  )
$$;

-- Helper: does the invite folder belong to the caller's company?
CREATE OR REPLACE FUNCTION public.invite_token_in_my_company(_token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employee_invites i
    JOIN public.profiles p ON p.company_id = i.company_id
    WHERE i.token = _token AND p.id = auth.uid()
  )
$$;

-- Helper: is this folder my company id?
CREATE OR REPLACE FUNCTION public.is_my_company_folder(_folder text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.company_id IS NOT NULL
      AND p.company_id::text = _folder
  )
$$;

REVOKE ALL ON FUNCTION public.is_valid_invite_token(text) FROM public;
REVOKE ALL ON FUNCTION public.invite_token_in_my_company(text) FROM public;
REVOKE ALL ON FUNCTION public.is_my_company_folder(text) FROM public;
GRANT EXECUTE ON FUNCTION public.is_valid_invite_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.invite_token_in_my_company(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_my_company_folder(text) TO authenticated;

-- client-logos
DROP POLICY IF EXISTS client_logos_company_all ON storage.objects;
CREATE POLICY client_logos_company_all ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'client-logos' AND public.is_my_company_folder((storage.foldername(name))[1]))
WITH CHECK (bucket_id = 'client-logos' AND public.is_my_company_folder((storage.foldername(name))[1]));

-- pool-photos
DROP POLICY IF EXISTS pool_photos_read ON storage.objects;
DROP POLICY IF EXISTS pool_photos_insert ON storage.objects;
DROP POLICY IF EXISTS pool_photos_update ON storage.objects;
DROP POLICY IF EXISTS pool_photos_delete ON storage.objects;
CREATE POLICY pool_photos_company_all ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'pool-photos' AND public.is_my_company_folder((storage.foldername(name))[1]))
WITH CHECK (bucket_id = 'pool-photos' AND public.is_my_company_folder((storage.foldername(name))[1]));

-- libro-sanitario (incl. delete)
DROP POLICY IF EXISTS libro_sanitario_select ON storage.objects;
DROP POLICY IF EXISTS libro_sanitario_insert ON storage.objects;
DROP POLICY IF EXISTS libro_sanitario_update ON storage.objects;
CREATE POLICY libro_sanitario_company_all ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'libro-sanitario' AND public.is_my_company_folder((storage.foldername(name))[1]))
WITH CHECK (bucket_id = 'libro-sanitario' AND public.is_my_company_folder((storage.foldername(name))[1]));

-- employee-docs
DROP POLICY IF EXISTS employee_docs_company_all ON storage.objects;
DROP POLICY IF EXISTS employee_docs_public_insert ON storage.objects;
CREATE POLICY employee_docs_company_all ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'employee-docs' AND public.invite_token_in_my_company((storage.foldername(name))[1]))
WITH CHECK (bucket_id = 'employee-docs' AND public.invite_token_in_my_company((storage.foldername(name))[1]));

CREATE POLICY employee_docs_invite_insert ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'employee-docs' AND public.is_valid_invite_token((storage.foldername(name))[1]));
