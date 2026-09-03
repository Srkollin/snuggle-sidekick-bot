import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Pencil, Plus, Trash2, Waves } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { PiscinaForm } from "@/components/piscinas/PiscinaForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  client_id: string | null;
  opening_date: string | null;
  closing_date: string | null;
  open_all_year: boolean;
  assigned_employees: string[];
};


function PiscinasPage() {
  const { user } = Route.useRouteContext();
  const { data: empresaData, isLoading: loadingEmpresa } = useEmpresa();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <button
              key={pool.id}
              type="button"
              onClick={() => setSelected(pool)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                {pool.photoUrl ? (
                  <img
                    src={pool.photoUrl}
                    alt={`Piscina ${pool.name}`}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-secondary text-muted-foreground">
                    <Waves className="size-10 opacity-60" />
                  </div>
                )}
                <span
                  className={cn(
                    "absolute right-3 top-3 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur",
                    ESTADO_CLASSES[pool.status] ?? "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {pool.status}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 p-4">
                <h2 className="truncate font-display text-base font-semibold">{pool.name}</h2>
                {pool.address && (
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" /> {pool.address}
                  </p>
                )}
                <p className="mt-2 truncate border-t border-border/60 pt-2 text-xs text-muted-foreground">
                  {(pool.dosing_type === "Otros" ? pool.dosing_other : pool.dosing_type) || "Sin dosificación"} ·{" "}
                  {pool.has_kids_pool ? "Con piscina infantil" : "Sin piscina infantil"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
          {selected && (
            <DetallePiscina
              pool={selected}
              companyId={companyId!}
              userId={user.id}
              onUpdated={() => {
                setSelected(null);
                queryClient.invalidateQueries({ queryKey: ["pools", companyId] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function DetallePiscina({
  pool,
  companyId,
  userId,
  onUpdated,
}: {
  pool: Pool & { photoUrl?: string };
  companyId: string;
  userId: string;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: cliente } = useQuery({
    queryKey: ["pool-client", pool.client_id],
    enabled: !!pool.client_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("clients")
        .select("id, name, client_type")
        .eq("id", pool.client_id!)
        .maybeSingle();
      return data as { id: string; name: string; client_type: string } | null;
    },
  });

  const { data: empleados } = useQuery({
    queryKey: ["employees-min", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name, roles")
        .eq("company_id", companyId)
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; full_name: string; roles: string[] }[];
    },
  });

  const asignados = (empleados ?? []).filter((e) => (pool.assigned_employees ?? []).includes(e.id));

  const { data: observaciones } = useQuery({
    queryKey: ["pool-observations", pool.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pool_observations")
        .select("id, content, author_name, created_at")
        .eq("pool_id", pool.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as {
        id: string;
        content: string;
        author_name: string | null;
        created_at: string;
      }[];
    },
  });

  const [nota, setNota] = useState("");
  const [savingNota, setSavingNota] = useState(false);

  async function addObservacion() {
    if (!nota.trim()) {
      toast.error("Escribe una observación.");
      return;
    }
    setSavingNota(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();
      const { error } = await supabase.from("pool_observations").insert({
        company_id: companyId,
        pool_id: pool.id,
        created_by: userId,
        author_name: profile?.full_name ?? null,
        content: nota.trim(),
      } as never);
      if (error) throw error;
      setNota("");
      queryClient.invalidateQueries({ queryKey: ["pool-observations", pool.id] });
      toast.success("Observación añadida.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se ha podido guardar la observación.");
    } finally {
      setSavingNota(false);
    }
  }

  async function borrarObservacion(id: string) {
    const { error } = await supabase.from("pool_observations").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["pool-observations", pool.id] });
  }

  if (editing) {
    return (
      <div className="p-6">
        <DialogHeader className="mb-4 text-left">
          <DialogTitle className="font-display">Editar piscina</DialogTitle>
        </DialogHeader>
        <PiscinaForm
          companyId={companyId}
          userId={userId}
          pool={{ ...pool, assigned_employees: pool.assigned_employees ?? [] }}
          onSaved={onUpdated}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-52 w-full overflow-hidden bg-secondary">
        {pool.photoUrl ? (
          <img src={pool.photoUrl} alt={`Piscina ${pool.name}`} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Waves className="size-12 opacity-60" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-5">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-display text-2xl text-background">{pool.name}</DialogTitle>
            {pool.address && (
              <p className="flex items-center gap-1 text-xs text-background/80">
                <MapPin className="size-3 shrink-0" /> {pool.address}
              </p>
            )}
          </DialogHeader>
        </div>
        <span
          className={cn(
            "absolute right-4 top-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur",
            ESTADO_CLASSES[pool.status] ?? "border-border bg-muted text-muted-foreground",
          )}
        >
          {pool.status}
        </span>
      </div>

      <div className="space-y-6 p-6">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="mr-2 size-4" /> Editar piscina
        </Button>

        <Section title="Cliente">
          <Row
            label="Cliente asociado"
            value={cliente ? `${cliente.name} · ${cliente.client_type}` : "Sin cliente asociado"}
          />
        </Section>

        <Section title="Tratamiento del agua">
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
        </Section>

        <Section title="Personal asignado">
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
          <Row
            label="Empleados asignados"
            value={asignados.length ? asignados.map((e) => e.full_name).join(", ") : "Ninguno"}
          />
        </Section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Observaciones</h3>
          <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <Textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Añade una observación sobre esta piscina"
              rows={3}
            />
            <Button size="sm" className="justify-self-start" onClick={addObservacion} disabled={savingNota}>
              <Plus className="mr-1 size-4" /> Añadir observación
            </Button>

            {observaciones?.length ? (
              <ul className="grid gap-2">
                {observaciones.map((o) => (
                  <li key={o.id} className="rounded-lg border border-border bg-card p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <p className="whitespace-pre-wrap">{o.content}</p>
                      <Button variant="ghost" size="icon" onClick={() => borrarObservacion(o.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {o.author_name ? `${o.author_name} · ` : ""}
                      {new Date(o.created_at).toLocaleString("es-ES")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Todavía no hay observaciones.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">{title}</h3>
      <dl className="divide-y divide-border/60 rounded-xl border border-border bg-muted/30 px-4 text-sm">
        {children}
      </dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
