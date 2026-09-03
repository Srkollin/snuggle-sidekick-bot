import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, Mail, Phone, Plus } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { ClienteForm } from "@/components/clientes/ClienteForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/hooks/useEmpresa";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes | Dehesapool" },
      {
        name: "description",
        content: "Registra particulares, comunidades, administradores de fincas y empresas, y consulta sus datos.",
      },
      { property: "og:title", content: "Clientes | Dehesapool" },
      { property: "og:description", content: "Gestiona la cartera de clientes de tu empresa de piscinas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClientesPage,
});

type Client = {
  id: string;
  client_type: string;
  name: string;
  tax_id: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  province: string | null;
  address: string | null;
  notes: string | null;
  is_draft: boolean;
};

const OBLIGATORIOS: Array<[keyof Client, string]> = [
  ["phone", "Teléfono principal"],
  ["email", "Correo electrónico"],
];

function ClientesPage() {
  const { user } = Route.useRouteContext();
  const { data: empresaData, isLoading: loadingEmpresa } = useEmpresa();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const companyId = empresaData?.empresa?.id;

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Client[];
    },
  });

  if (!loadingEmpresa && !companyId) {
    return (
      <AppShell>
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <h2 className="font-display text-xl font-bold">Completa el registro de tu empresa</h2>
            <Button asChild>
              <Link to="/panel">Ir al panel</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Clientes</h2>
          <p className="text-sm text-muted-foreground">Registra clientes y consulta su ficha completa.</p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!companyId}>
          <Plus className="mr-2 size-4" /> Nuevo cliente
        </Button>
      </div>

      {isLoading || loadingEmpresa ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !clients?.length ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Todavía no hay clientes registrados.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c)}
              className="rounded-xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-display font-semibold">{c.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">{c.client_type}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                {c.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="size-3" /> {c.phone}
                  </span>
                )}
                {c.email && (
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="size-3 shrink-0" /> {c.email}
                  </span>
                )}
              </div>
              {c.is_draft && (
                <span className="mt-3 inline-flex rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs">
                  Borrador
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Nuevo cliente</DialogTitle>
          </DialogHeader>
          {companyId && (
            <ClienteForm
              companyId={companyId}
              userId={user.id}
              onSaved={() => {
                setOpen(false);
                queryClient.invalidateQueries({ queryKey: ["clients", companyId] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid gap-2 text-sm">
              <Row label="Tipo de cliente" value={selected.client_type} />
              <Row label="CIF / NIF / DNI" value={selected.tax_id} />
              <Row label="Persona de contacto" value={selected.contact_person} />
              <Row label="Teléfono" value={selected.phone} />
              <Row label="Correo electrónico" value={selected.email} />
              <Row label="Dirección" value={selected.address} />
              <Row label="Ciudad" value={selected.city} />
              <Row label="Provincia" value={selected.province} />
              <Row label="Notas internas" value={selected.notes} />
              {OBLIGATORIOS.some(([k]) => !selected[k]) && (
                <p className="mt-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  Faltan datos obligatorios:{" "}
                  {OBLIGATORIOS.filter(([k]) => !selected[k])
                    .map(([, l]) => l)
                    .join(", ")}
                  .
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={value ? "text-right font-medium" : "text-right italic text-muted-foreground"}>
        {value || "Sin rellenar"}
      </span>
    </div>
  );
}
