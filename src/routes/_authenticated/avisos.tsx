import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, BellRing, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useEmpresa } from "@/hooks/useEmpresa";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/avisos")({
  head: () => ({
    meta: [
      { title: "Avisos e incidencias | Dehesapool" },
      {
        name: "description",
        content:
          "Canal de avisos de Dehesapool: incidencias y piscinas fuera de los estándares sanitarios, con seguimiento y atención por parte del técnico.",
      },
      { property: "og:title", content: "Avisos e incidencias | Dehesapool" },
      { property: "og:description", content: "Detecta piscinas fuera de norma y asigna su atención a un técnico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AvisosPage,
});

type Aviso = {
  id: string;
  pool_id: string;
  vessel: string;
  record_date: string;
  record_time: string;
  technician_name: string | null;
  ph: number;
  free_chlorine: number | null;
  bromine_total: number | null;
  turbidity: number;
  alerts: string[];
  vessel_status: string;
  has_incident: boolean;
  incident_description: string | null;
  corrective_action: string | null;
  attention_status: string;
  attended_by_name: string | null;
  attended_at: string | null;
  attention_notes: string | null;
};

const ESTADOS = [
  { value: "pendiente", label: "Pendiente", cls: "border-destructive/30 bg-destructive/15 text-destructive" },
  { value: "en_curso", label: "En curso", cls: "border-amber-500/30 bg-amber-500/15 text-amber-600" },
  { value: "resuelta", label: "Resuelta", cls: "border-primary/30 bg-primary/15 text-primary" },
] as const;

function AvisosPage() {
  const { user } = Route.useRouteContext();
  const { data: empresaData, isLoading: loadingEmpresa } = useEmpresa();
  const queryClient = useQueryClient();
  const companyId = empresaData?.empresa?.id;
  const tecnico = empresaData?.profile?.full_name ?? empresaData?.profile?.email ?? "Técnico";

  const [filtro, setFiltro] = useState<string>("pendiente");
  const [atendiendo, setAtendiendo] = useState<Aviso | null>(null);
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);

  const { data: piscinas } = useQuery({
    queryKey: ["pools-avisos", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase.from("pools").select("id, name").eq("company_id", companyId!);
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  const { data: avisos, isLoading } = useQuery({
    queryKey: ["avisos", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pool_records")
        .select(
          "id, pool_id, vessel, record_date, record_time, technician_name, ph, free_chlorine, bromine_total, turbidity, alerts, vessel_status, has_incident, incident_description, corrective_action, attention_status, attended_by_name, attended_at, attention_notes",
        )
        .eq("company_id", companyId!)
        .order("record_date", { ascending: false })
        .order("record_time", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as unknown as Aviso[]).filter(
        (a) => (Array.isArray(a.alerts) && a.alerts.length > 0) || a.has_incident,
      );
    },
  });

  const nombrePiscina = (id: string) => piscinas?.find((p) => p.id === id)?.name ?? "Piscina";
  const lista = (avisos ?? []).filter((a) => (filtro ? a.attention_status === filtro : true));
  const pendientes = (avisos ?? []).filter((a) => a.attention_status === "pendiente").length;

  async function actualizar(aviso: Aviso, estado: string, notasTexto?: string) {
    setGuardando(true);
    const { error } = await supabase
      .from("pool_records")
      .update({
        attention_status: estado,
        attended_by: user.id,
        attended_by_name: tecnico,
        attended_at: new Date().toISOString(),
        ...(notasTexto !== undefined ? { attention_notes: notasTexto } : {}),
      })
      .eq("id", aviso.id);
    setGuardando(false);
    if (error) {
      toast.error("No se pudo actualizar el aviso");
      return;
    }
    toast.success(estado === "resuelta" ? "Incidencia resuelta" : "Incidencia en curso");
    setAtendiendo(null);
    setNotas("");
    queryClient.invalidateQueries({ queryKey: ["avisos", companyId] });
  }

  if (loadingEmpresa) {
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
          <h2 className="font-display text-2xl font-bold">Avisos</h2>
          <p className="text-sm text-muted-foreground">
            Incidencias y piscinas fuera de los estándares sanitarios. {pendientes} pendiente
            {pendientes === 1 ? "" : "s"} de atender.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[{ value: "", label: "Todos" }, ...ESTADOS].map((e) => (
            <Button
              key={e.value || "todos"}
              size="sm"
              variant={filtro === e.value ? "default" : "outline"}
              onClick={() => setFiltro(e.value)}
            >
              {e.label}
            </Button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : lista.length === 0 ? (
        <Card>
          <CardContent className="grid place-items-center gap-3 p-12 text-center">
            <ShieldCheck className="size-8 text-primary" />
            <p className="font-display font-semibold">No hay avisos en este estado</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Los avisos se generan automáticamente cuando un control sanitario queda fuera de rango o se anota una
              incidencia en el libro de registros.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lista.map((a) => {
            const estado = ESTADOS.find((e) => e.value === a.attention_status) ?? ESTADOS[0];
            return (
              <Card key={a.id} className={cn(a.attention_status === "pendiente" && "border-destructive/40")}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-destructive/10">
                        <AlertTriangle className="size-4 text-destructive" />
                      </span>
                      <div>
                        <p className="font-display font-semibold">
                          {nombrePiscina(a.pool_id)} · {a.vessel === "infantil" ? "Vaso infantil" : "Vaso principal"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.record_date).toLocaleDateString("es-ES")} · {a.record_time} ·{" "}
                          {a.technician_name ?? "Sin técnico"}
                        </p>
                      </div>
                    </div>
                    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", estado.cls)}>
                      {estado.label}
                    </span>
                  </div>

                  <ul className="space-y-1 text-sm">
                    {(Array.isArray(a.alerts) ? a.alerts : []).map((al, i) => (
                      <li key={i} className="rounded-md bg-destructive/10 px-3 py-2 text-destructive">
                        {al}
                      </li>
                    ))}
                    {a.has_incident && a.incident_description && (
                      <li className="rounded-md bg-muted px-3 py-2">Incidencia: {a.incident_description}</li>
                    )}
                    {a.corrective_action && (
                      <li className="rounded-md bg-muted px-3 py-2">Acción correctora: {a.corrective_action}</li>
                    )}
                  </ul>

                  <p className="text-xs text-muted-foreground">
                    pH {a.ph} · Desinfectante {a.free_chlorine ?? a.bromine_total ?? "-"} mg/L · Turbidez {a.turbidity}{" "}
                    UNF · Vaso {a.vessel_status === "abierto" ? "abierto" : "cerrado por incidencia"}
                  </p>

                  {a.attention_status !== "pendiente" && (
                    <p className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground">
                      Atendida por {a.attended_by_name ?? "—"}
                      {a.attended_at ? ` el ${new Date(a.attended_at).toLocaleString("es-ES")}` : ""}
                      {a.attention_notes ? ` · ${a.attention_notes}` : ""}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {a.attention_status === "pendiente" && (
                      <Button size="sm" variant="outline" onClick={() => actualizar(a, "en_curso")} disabled={guardando}>
                        <BellRing className="mr-2 size-4" /> Atender ahora
                      </Button>
                    )}
                    {a.attention_status !== "resuelta" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setAtendiendo(a);
                          setNotas(a.attention_notes ?? "");
                        }}
                        disabled={guardando}
                      >
                        <CheckCircle2 className="mr-2 size-4" /> Marcar como resuelta
                      </Button>
                    )}
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/libro-registros/$poolId" params={{ poolId: a.pool_id }}>
                        Ver libro
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!atendiendo} onOpenChange={(o) => !o && setAtendiendo(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Resolver incidencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-sm">Actuación realizada por {tecnico}</Label>
            <Textarea
              rows={4}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Describe la corrección aplicada y la comprobación posterior."
            />
            <Button
              className="w-full"
              disabled={guardando || notas.trim().length < 5}
              onClick={() => atendiendo && actualizar(atendiendo, "resuelta", notas.trim())}
            >
              {guardando && <Loader2 className="mr-2 size-4 animate-spin" />} Confirmar resolución
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
