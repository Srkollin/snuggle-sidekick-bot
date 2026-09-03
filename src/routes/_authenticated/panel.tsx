import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Users, Waves } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { RegistroWizard } from "@/components/registro/RegistroWizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmpresa } from "@/hooks/useEmpresa";
import { JERARQUIA } from "@/lib/dehesapool";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Panel de administración | Dehesapool" },
      {
        name: "description",
        content: "Panel de administración de tu empresa de piscinas: datos, módulos activos, equipo y piscinas.",
      },
      { property: "og:title", content: "Panel de administración | Dehesapool" },
      { property: "og:description", content: "Gestiona tu empresa de piscinas desde el panel de Dehesapool." },
    ],
  }),
  component: PanelPage,
});

function PanelPage() {
  const { data, isLoading } = useEmpresa();
  const queryClient = useQueryClient();

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
              <h1 className="font-display text-2xl font-bold">Completa el alta de tu empresa</h1>
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

  const { empresa, profile } = data;

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Panel de administración</p>
        <h1 className="font-display text-3xl font-bold">{empresa.trade_name}</h1>
        <p className="text-sm text-muted-foreground">
          {profile?.full_name} · {profile?.role_title}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-5">
            <Building2 className="size-5 text-primary" />
            <h2 className="font-display font-semibold">Datos de empresa</h2>
            <p className="text-sm text-muted-foreground">
              {empresa.legal_name || empresa.trade_name}
              {empresa.tax_id ? ` · ${empresa.tax_id}` : ""}
              {empresa.city ? ` · ${empresa.city}` : ""}
            </p>
            <p className="text-sm text-muted-foreground">{empresa.employees_range}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-5">
            <Waves className="size-5 text-primary" />
            <h2 className="font-display font-semibold">Piscinas</h2>
            <p className="text-sm text-muted-foreground">Da de alta piscinas y consulta su estado.</p>
            <Button asChild size="sm">
              <Link to="/piscinas">Ir a piscinas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-5">
            <Users className="size-5 text-primary" />
            <h2 className="font-display font-semibold">Módulos activos</h2>
            <ul className="text-sm text-muted-foreground">
              {empresa.modules?.slice(0, 5).map((m) => <li key={m}>· {m}</li>)}
              {empresa.modules?.length > 5 && <li>· y {empresa.modules.length - 5} más</li>}
            </ul>
          </CardContent>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Estructura del equipo</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Roles disponibles para invitar a tu equipo desde el panel.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {JERARQUIA.map((area) => (
            <Card key={area.area}>
              <CardContent className="p-5">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-primary">
                  {area.area}
                </h3>
                <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
                  {area.roles.map((r) => (
                    <li key={r}>· {r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
