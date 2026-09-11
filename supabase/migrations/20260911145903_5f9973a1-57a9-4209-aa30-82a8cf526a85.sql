
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO anon, authenticated;

CREATE OR REPLACE FUNCTION private.is_valid_invite_token(_token text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employee_invites i
    WHERE i.token = _token AND i.is_active AND i.expires_at > now()
      AND (i.max_uses IS NULL OR i.used_count < i.max_uses)
  )
$$;

CREATE OR REPLACE FUNCTION private.invite_token_in_my_company(_token text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employee_invites i
    JOIN public.profiles p ON p.company_id = i.company_id
    WHERE i.token = _token AND p.id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION private.is_my_company_folder(_folder text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.company_id IS NOT NULL AND p.company_id::text = _folder
  )
$$;

REVOKE ALL ON FUNCTION private.is_valid_invite_token(text) FROM public;
REVOKE ALL ON FUNCTION private.invite_token_in_my_company(text) FROM public;
REVOKE ALL ON FUNCTION private.is_my_company_folder(text) FROM public;
GRANT EXECUTE ON FUNCTION private.is_valid_invite_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.invite_token_in_my_company(text) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_my_company_folder(text) TO authenticated;

DROP POLICY IF EXISTS client_logos_company_all ON storage.objects;
CREATE POLICY client_logos_company_all ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'client-logos' AND private.is_my_company_folder((storage.foldername(name))[1]))
WITH CHECK (bucket_id = 'client-logos' AND private.is_my_company_folder((storage.foldername(name))[1]));

DROP POLICY IF EXISTS pool_photos_company_all ON storage.objects;
CREATE POLICY pool_photos_company_all ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'pool-photos' AND private.is_my_company_folder((storage.foldername(name))[1]))
WITH CHECK (bucket_id = 'pool-photos' AND private.is_my_company_folder((storage.foldername(name))[1]));

DROP POLICY IF EXISTS libro_sanitario_company_all ON storage.objects;
CREATE POLICY libro_sanitario_company_all ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'libro-sanitario' AND private.is_my_company_folder((storage.foldername(name))[1]))
WITH CHECK (bucket_id = 'libro-sanitario' AND private.is_my_company_folder((storage.foldername(name))[1]));

DROP POLICY IF EXISTS employee_docs_company_all ON storage.objects;
CREATE POLICY employee_docs_company_all ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'employee-docs' AND private.invite_token_in_my_company((storage.foldername(name))[1]))
WITH CHECK (bucket_id = 'employee-docs' AND private.invite_token_in_my_company((storage.foldername(name))[1]));

DROP POLICY IF EXISTS employee_docs_invite_insert ON storage.objects;
CREATE POLICY employee_docs_invite_insert ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'employee-docs' AND private.is_valid_invite_token((storage.foldername(name))[1]));

DROP FUNCTION IF EXISTS public.is_valid_invite_token(text);
DROP FUNCTION IF EXISTS public.invite_token_in_my_company(text);
DROP FUNCTION IF EXISTS public.is_my_company_folder(text);
