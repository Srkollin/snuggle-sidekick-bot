import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Plus, Waves } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { PiscinaForm } from "@/components/piscinas/PiscinaForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/hooks/useEmpresa";
import { ESTADO_CLASSES, type OtroEmpleado } from "@/lib/dehesapool";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/piscinas")({
  head: () => ({
    meta: [
      { title: "Piscinas registradas | Dehesapool" },
      {
        name: "description",
        content: "Registra piscinas y consulta el estado, el tratamiento del agua y el personal asignado.",
      },
      { property: "og:title", content: "Piscinas registradas | Dehesapool" },
      { property: "og:description", content: "Alta y consulta de piscinas de tu empresa en Dehesapool." },
    ],
  }),
  component: PiscinasPage,
});

type Pool = {
  id: string;
  name: string;
  address: string | null;
  photo_path: string | null;
  status: string;
  dosing_type: string | null;
  dosing_other: string | null;
  has_kids_pool: boolean;
  kids_name: string | null;
  kids_dosing_type: string | null;
  kids_dosing_other: string | null;
  has_lifeguard: boolean;
  lifeguards_count: number;
  has_doorman: boolean;
  doormen_count: number;
  other_staff: OtroEmpleado[];
};

function PiscinasPage() {
  const { user } = Route.useRouteContext();
  const { data: empresaData, isLoading: loadingEmpresa } = useEmpresa();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Pool | null>(null);

  const companyId = empresaData?.empresa?.id;

  const { data: pools, isLoading } = useQuery({
    queryKey: ["pools", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pools")
        .select("*")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const list = (data ?? []) as unknown as Pool[];
      const paths = list.map((p) => p.photo_path).filter(Boolean) as string[];
      const urls = new Map<string, string>();
      if (paths.length) {
        const { data: signed } = await supabase.storage.from("pool-photos").createSignedUrls(paths, 3600);
        signed?.forEach((s) => s.signedUrl && s.path && urls.set(s.path, s.signedUrl));
      }
      return list.map((p) => ({ ...p, photoUrl: p.photo_path ? urls.get(p.photo_path) : undefined }));
    },
  });

  if (!loadingEmpresa && !companyId) {
    return (
      <AppShell>
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <h1 className="font-display text-xl font-bold">Completa el registro de tu empresa</h1>
            <p className="text-sm text-muted-foreground">
              Necesitas una empresa registrada para dar de alta piscinas.
            </p>
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
          <h1 className="font-display text-3xl font-bold">Piscinas</h1>
          <p className="text-sm text-muted-foreground">
            Registra piscinas y consulta las que ya están dadas de alta.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={!companyId}>
              <Plus className="mr-2 size-4" /> Registrar piscina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">Registrar piscina</DialogTitle>
            </DialogHeader>
            {companyId && (
              <PiscinaForm
                companyId={companyId}
                userId={user.id}
                onSaved={() => {
                  setOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["pools", companyId] });
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading || loadingEmpresa ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : !pools?.length ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Todavía no hay piscinas registradas.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <button
              key={pool.id}
              type="button"
              onClick={() => setSelected(pool)}
              className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-lg"
            >
              <div className="flex gap-4 p-3">
                <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {pool.photoUrl ? (
                    <img
                      src={pool.photoUrl}
                      alt={`Piscina ${pool.name}`}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <Waves className="size-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display font-semibold">{pool.name}</h2>
                  {pool.address && (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" /> {pool.address}
                    </p>
                  )}
                  <span
                    className={cn(
                      "mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      ESTADO_CLASSES[pool.status] ?? "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {pool.status}
                  </span>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {pool.dosing_type === "Otros" ? pool.dosing_other : pool.dosing_type} ·{" "}
                    {pool.has_kids_pool ? "Con piscina infantil" : "Sin piscina infantil"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selected && <DetallePiscina pool={selected} />}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function DetallePiscina({ pool }: { pool: Pool & { photoUrl?: string } }) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">{pool.name}</DialogTitle>
      </DialogHeader>
      {pool.photoUrl && (
        <img src={pool.photoUrl} alt={`Piscina ${pool.name}`} className="h-48 w-full rounded-xl object-cover" />
      )}
      <span
        className={cn(
          "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
          ESTADO_CLASSES[pool.status] ?? "border-border bg-muted text-muted-foreground",
        )}
      >
        {pool.status}
      </span>
      <dl className="grid gap-2 text-sm">
        <Row label="Dirección" value={pool.address ?? "—"} />
        <Row
          label="Tipo de dosificación"
          value={pool.dosing_type === "Otros" ? pool.dosing_other || "Otros" : pool.dosing_type || "—"}
        />
        <Row label="Piscina infantil" value={pool.has_kids_pool ? pool.kids_name || "Sí" : "No"} />
        {pool.has_kids_pool && (
          <Row
            label="Dosificación infantil"
            value={
              pool.kids_dosing_type === "Otros" ? pool.kids_dosing_other || "Otros" : pool.kids_dosing_type || "—"
            }
          />
        )}
        <Row label="Socorristas" value={pool.has_lifeguard ? String(pool.lifeguards_count) : "No"} />
        <Row label="Porteros" value={pool.has_doorman ? String(pool.doormen_count) : "No"} />
        <Row
          label="Otros empleados"
          value={
            pool.other_staff?.length
              ? pool.other_staff.map((o) => `${o.tipo} (${o.cantidad})`).join(", ")
              : "No"
          }
        />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
