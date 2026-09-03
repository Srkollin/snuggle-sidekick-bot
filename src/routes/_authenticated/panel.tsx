import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Receipt, Users, Waves } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { RegistroWizard } from "@/components/registro/RegistroWizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmpresa } from "@/hooks/useEmpresa";
import { supabase } from "@/integrations/supabase/client";
import { ESTADO_EMPLEADO_LABEL, ESTADOS_EMPLEADO } from "@/lib/dehesapool";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Dashboard | Dehesapool" },
      {
        name: "description",
        content:
          "Resumen de piscinas abiertas y cerradas, estado del equipo, clientes registrados y facturación de tu empresa.",
      },
      { property: "og:title", content: "Dashboard | Dehesapool" },
      { property: "og:description", content: "Gestiona tu empresa de piscinas desde el panel de Dehesapool." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PanelPage,
});

function PanelPage() {
  const { data, isLoading } = useEmpresa();
  const queryClient = useQueryClient();
  const companyId = data?.empresa?.id;

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["dashboard", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const [pools, employees, clients] = await Promise.all([
        supabase.from("pools").select("status").eq("company_id", companyId!),
        supabase.from("employees").select("work_status, approval_status").eq("company_id", companyId!),
        supabase.from("clients").select("id").eq("company_id", companyId!),
      ]);
      const poolRows = (pools.data ?? []) as { status: string }[];
      const empRows = (employees.data ?? []) as { work_status: string; approval_status: string }[];
      return {
        piscinas: {
          total: poolRows.length,
          abiertas: poolRows.filter((p) => p.status?.toLowerCase() === "abierta").length,
          cerradas: poolRows.filter((p) => p.status?.toLowerCase() === "cerrada").length,
        },
        empleados: {
          total: empRows.filter((e) => e.approval_status === "aprobado").length,
          pendientes: empRows.filter((e) => e.approval_status === "pendiente").length,
          porEstado: Object.fromEntries(
            ESTADOS_EMPLEADO.map((s) => [
              s,
              empRows.filter((e) => e.approval_status === "aprobado" && e.work_status === s).length,
            ]),
          ) as Record<string, number>,
        },
        clientes: (clients.data ?? []).length,
      };
    },
  });

  if (isLoading) {
    return (
      <AppShell>
        <Skeleton className="h-64 rounded-xl" />
      </AppShell>
    );
  }

  if (!data?.empresa) {
    return (
      <AppShell>
        <Card>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <header className="space-y-2">
              <h2 className="font-display text-2xl font-bold">Completa el alta de tu empresa</h2>
              <p className="text-sm text-muted-foreground">
                Faltan los datos de la empresa y la configuración de servicios para activar tu cuenta.
              </p>
            </header>
            <RegistroWizard
              mode="company"
              onComplete={() => queryClient.invalidateQueries({ queryKey: ["empresa"] })}
            />
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const { profile } = data;

  return (
    <AppShell>
      <header className="mb-8">
        <h2 className="font-display text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          {profile?.full_name}
          {profile?.role_title ? ` · ${profile.role_title}` : ""}
        </p>
      </header>

      {loadingStats ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Waves} title="Piscinas" to="/piscinas" cta="Ver piscinas">
            <Big value={stats?.piscinas.total ?? 0} label="registradas" />
            <Line label="Abiertas" value={stats?.piscinas.abiertas ?? 0} />
            <Line label="Cerradas" value={stats?.piscinas.cerradas ?? 0} />
          </StatCard>

          <StatCard icon={Users} title="Empleados" to="/empleados" cta="Ver empleados">
            <Big value={stats?.empleados.total ?? 0} label="en plantilla" />
            {ESTADOS_EMPLEADO.map((s) => (
              <Line key={s} label={ESTADO_EMPLEADO_LABEL[s]} value={stats?.empleados.porEstado[s] ?? 0} />
            ))}
            <Line label="Pendientes de aprobar" value={stats?.empleados.pendientes ?? 0} />
          </StatCard>

          <StatCard icon={Building2} title="Clientes" to="/clientes" cta="Ver clientes">
            <Big value={stats?.clientes ?? 0} label="registrados" />
          </StatCard>

          <StatCard icon={Receipt} title="Facturación" to="/facturacion" cta="Ver facturación">
            <p className="text-sm text-muted-foreground">
              El módulo de facturación estará disponible próximamente. Aquí verás lo cobrado, lo pendiente de cobro y el
              total facturado.
            </p>
          </StatCard>
        </div>
      )}
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  title,
  to,
  cta,
  children,
}: {
  icon: React.ElementType;
  title: string;
  to: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex h-full flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-primary">
          <Icon className="size-5" />
          <h3 className="font-display font-semibold text-foreground">{title}</h3>
        </div>
        <div className="flex-1 space-y-1">{children}</div>
        <Button asChild variant="outline" size="sm" className="mt-2 justify-self-start">
          <Link to={to}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Big({ value, label }: { value: number; label: string }) {
  return (
    <p className="font-display text-3xl font-bold">
      {value} <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </p>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
