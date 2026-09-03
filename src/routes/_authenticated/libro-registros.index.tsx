import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight, HelpCircle } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { GuiaMedicion } from "@/components/libro/GuiaMedicion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmpresa } from "@/hooks/useEmpresa";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/libro-registros/")({
  head: () => ({
    meta: [
      { title: "Libro de registros sanitarios | Dehesapool" },
      {
        name: "description",
        content:
          "Cada piscina con su propio libro sanitario digital: controles de pH, cloro y turbidez, alertas automáticas e historial exportable.",
      },
      { property: "og:title", content: "Libro de registros sanitarios | Dehesapool" },
      { property: "og:description", content: "Un libro de registro independiente para cada piscina." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LibroIndex,
});

function LibroIndex() {
  const { data: empresaData, isLoading: loadingEmpresa } = useEmpresa();
  const companyId = empresaData?.empresa?.id;
  const [guiaAbierta, setGuiaAbierta] = useState(false);

  const { data: pools, isLoading } = useQuery({
    queryKey: ["pools-libro-index", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const [{ data: piscinas }, { data: registros }] = await Promise.all([
        supabase.from("pools").select("id, name, address, status").eq("company_id", companyId!).order("name"),
        supabase.from("pool_records").select("pool_id, record_date, record_time").eq("company_id", companyId!),
      ]);
      return (piscinas ?? []).map((p) => {
        const propios = (registros ?? []).filter((r) => r.pool_id === p.id);
        const ultimo = propios
          .slice()
          .sort((a, b) => `${b.record_date}${b.record_time}`.localeCompare(`${a.record_date}${a.record_time}`))[0];
        return { ...p, total: propios.length, ultimo };
      });
    },
  });

  if (loadingEmpresa || isLoading) {
    return (
      <AppShell>
        <Skeleton className="h-64 rounded-xl" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Libro de registros</h2>
          <p className="text-sm text-muted-foreground">
            Cada piscina tiene su propio libro sanitario según el Real Decreto 742/2013.
          </p>
        </div>
        <Button variant="outline" onClick={() => setGuiaAbierta(true)}>
          <HelpCircle className="mr-2 size-4" /> Ver guía de medición
        </Button>
      </header>

      {(pools ?? []).length === 0 ? (
        <Card>
          <CardContent className="grid place-items-center gap-3 p-12 text-center">
            <BookOpen className="size-8 text-primary" />
            <p className="font-display font-semibold">Todavía no hay piscinas</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Registra primero una piscina para abrir su libro de registros.
            </p>
            <Button asChild variant="outline">
              <Link to="/piscinas">Ir a Piscinas</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(pools ?? []).map((p) => (
            <Link key={p.id} to="/libro-registros/$poolId" params={{ poolId: p.id }} className="group">
              <Card className="h-full transition hover:border-primary/50 hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg font-semibold">{p.name}</p>
                      {p.address && <p className="text-xs text-muted-foreground">{p.address}</p>}
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <div className="mt-auto flex items-center gap-4 text-sm">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                      {p.total} {p.total === 1 ? "registro" : "registros"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {p.ultimo
                        ? `Último: ${new Date(p.ultimo.record_date).toLocaleDateString("es-ES")} ${p.ultimo.record_time}`
                        : "Sin controles anotados"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={guiaAbierta} onOpenChange={setGuiaAbierta}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Guía rápida de medición</DialogTitle>
          </DialogHeader>
          <GuiaMedicion onClose={() => setGuiaAbierta(false)} />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
