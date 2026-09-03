import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Empresa = {
  id: string;
  trade_name: string;
  legal_name: string | null;
  tax_id: string | null;
  city: string | null;
  province: string | null;
  employees_range: string | null;
  services: string[];
  modules: string[];
};

export function useEmpresa() {
  return useQuery({
    queryKey: ["empresa"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return { profile: null, empresa: null as Empresa | null };

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, role_title, email, company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.company_id) return { profile, empresa: null as Empresa | null };

      const { data: empresa } = await supabase
        .from("companies")
        .select("id, trade_name, legal_name, tax_id, city, province, employees_range, services, modules")
        .eq("id", profile.company_id)
        .maybeSingle();

      return { profile, empresa: (empresa as unknown as Empresa) ?? null };
    },
  });
}
