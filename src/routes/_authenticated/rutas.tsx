import { createFileRoute } from "@tanstack/react-router";
import { Route as RouteIcon } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/rutas")({
  head: () => ({
    meta: [
      { title: "Rutas | Dehesapool" },
      {
        name: "description",
        content: "Planificación de rutas de mantenimiento para los técnicos de tu empresa de piscinas.",
      },
      { property: "og:title", content: "Rutas | Dehesapool" },
      { property: "og:description", content: "Módulo de rutas de mantenimiento de Dehesapool." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RutasPage,
});

function RutasPage() {
  return (
    <AppShell>
      <h2 className="mb-6 font-display text-2xl font-bold">Rutas</h2>
      <Card>
        <CardContent className="grid place-items-center gap-3 p-12 text-center">
          <RouteIcon className="size-8 text-primary" />
          <p className="font-display font-semibold">Módulo en preparación</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            La planificación de rutas de los técnicos estará disponible próximamente.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
