import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/facturacion")({
  head: () => ({
    meta: [
      { title: "Facturación | Dehesapool" },
      {
        name: "description",
        content: "Control de facturas cobradas, pendientes de cobro y total facturado por tu empresa de piscinas.",
      },
      { property: "og:title", content: "Facturación | Dehesapool" },
      { property: "og:description", content: "Módulo de facturación de Dehesapool." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FacturacionPage,
});

function FacturacionPage() {
  return (
    <AppShell>
      <h2 className="mb-6 font-display text-2xl font-bold">Facturación</h2>
      <Card>
        <CardContent className="grid place-items-center gap-3 p-12 text-center">
          <Receipt className="size-8 text-primary" />
          <p className="font-display font-semibold">Módulo en preparación</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            La emisión y el seguimiento de facturas estarán disponibles próximamente.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
