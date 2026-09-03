DROP POLICY "companies_select_own" ON public.companies;
CREATE POLICY "companies_select_own" ON public.companies FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY "pools_select_company" ON public.pools;
CREATE POLICY "pools_select_company" ON public.pools FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY "pools_insert_company" ON public.pools;
CREATE POLICY "pools_insert_company" ON public.pools FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY "pools_update_company" ON public.pools;
CREATE POLICY "pools_update_company" ON public.pools FOR UPDATE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY "pools_delete_company" ON public.pools;
CREATE POLICY "pools_delete_company" ON public.pools FOR DELETE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP FUNCTION IF EXISTS public.current_company_id();