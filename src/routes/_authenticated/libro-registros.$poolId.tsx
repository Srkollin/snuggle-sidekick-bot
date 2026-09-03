import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, FileDown, HelpCircle, Plus } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { GuiaMedicion } from "@/components/libro/GuiaMedicion";
import { RegistroSanitarioForm, type Vaso } from "@/components/libro/RegistroSanitarioForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmpresa } from "@/hooks/useEmpresa";
import { supabase } from "@/integrations/supabase/client";
import { TIPOS_CONTROL } from "@/lib/libro-sanitario";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/libro-registros/$poolId")({
  head: () => ({
    meta: [
      { title: "Libro sanitario de la piscina | Dehesapool" },
      {
        name: "description",
        content:
          "Historial de controles sanitarios de esta piscina: pH, cloro, turbidez, incidencias y exportación en PDF.",
      },
      { property: "og:title", content: "Libro sanitario de la piscina | Dehesapool" },
      { property: "og:description", content: "Registros de control de agua vaso por vaso, guardados y exportables." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LibroPiscina,
});

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

type Registro = {
  id: string;
  pool_id: string;
  vessel: string;
  record_date: string;
  record_time: string;
  technician_name: string | null;
  control_type: string;
  ph: number;
  free_chlorine: number | null;
  bromine_total: number | null;
  turbidity: number;
  vessel_status: string;
};

function LibroPiscina() {
  const { poolId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: empresaData, isLoading: loadingEmpresa } = useEmpresa();
  const queryClient = useQueryClient();
  const companyId = empresaData?.empresa?.id;
  const empresaNombre = empresaData?.empresa?.trade_name ?? "";
  const tecnico = empresaData?.profile?.full_name ?? empresaData?.profile?.email ?? "Técnico";

  const [guiaAbierta, setGuiaAbierta] = useState(false);
  const [formAbierto, setFormAbierto] = useState(false);
  const [filtros, setFiltros] = useState({ vaso: "", tipo: "", desde: "", hasta: "" });

  const { data: pool } = useQuery({
    queryKey: ["pool-libro", poolId],
    queryFn: async () => {
      const { data } = await supabase
        .from("pools")
        .select("id, name, address, has_kids_pool, kids_name, dosing_type, kids_dosing_type")
        .eq("id", poolId)
        .maybeSingle();
      return data;
    },
  });

  const vasos: Vaso[] = useMemo(() => {
    if (!pool) return [];
    const list: Vaso[] = [
      { poolId: pool.id, vessel: "principal", label: "Vaso principal", dosing: pool.dosing_type },
    ];
    if (pool.has_kids_pool) {
      list.push({
        poolId: pool.id,
        vessel: "infantil",
        label: pool.kids_name || "Vaso infantil",
        dosing: pool.kids_dosing_type,
      });
    }
    return list;
  }, [pool]);

  const { data: registros, isLoading } = useQuery({
    queryKey: ["pool-records", poolId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase
        .from("pool_records")
        .select(
          "id, pool_id, vessel, record_date, record_time, technician_name, control_type, ph, free_chlorine, bromine_total, turbidity, vessel_status",
        )
        .eq("pool_id", poolId)
        .order("record_date", { ascending: false })
        .order("record_time", { ascending: false });
      return (data ?? []) as unknown as Registro[];
    },
  });

  const nombreVaso = (r: Registro) => vasos.find((v) => v.vessel === r.vessel)?.label ?? r.vessel;

  const filtrados = (registros ?? []).filter((r) => {
    if (filtros.vaso && r.vessel !== filtros.vaso) return false;
    if (filtros.tipo && r.control_type !== filtros.tipo) return false;
    if (filtros.desde && r.record_date < filtros.desde) return false;
    if (filtros.hasta && r.record_date > filtros.hasta) return false;
    return true;
  });

  function exportarPdf() {
    const filas = filtrados
      .map(
        (r) => `<tr>
          <td>${r.record_date}</td><td>${r.record_time}</td><td>${nombreVaso(r)}</td>
          <td>${r.technician_name ?? ""}</td><td>${r.control_type}</td>
          <td>${r.ph}</td><td>${r.free_chlorine ?? r.bromine_total ?? "-"}</td><td>${r.turbidity}</td>
          <td>${r.vessel_status === "abierto" ? "Abierto" : "Cerrado por incidencia"}</td>
        </tr>`,
      )
      .join("");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8">
      <title>Libro sanitario · ${pool?.name ?? ""}</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:18px}
      table{width:100%;border-collapse:collapse;font-size:11px;margin-top:12px}
      th,td{border:1px solid #bbb;padding:5px;text-align:left}th{background:#eef4f8}</style></head><body>
      <h1>Libro sanitario · ${pool?.name ?? ""}</h1>
      <p>${empresaNombre} · Documento generado el ${new Date().toLocaleDateString("es-ES")}</p>
      <table><thead><tr><th>Fecha</th><th>Hora</th><th>Vaso</th><th>Técnico</th><th>Control</th>
      <th>pH</th><th>Desinfectante mg/L</th><th>Turbidez UNF</th><th>Estado</th></tr></thead>
      <tbody>${filas}</tbody></table></body></html>`);
    win.document.close();
    win.focus();
    win.print();
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
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to="/libro-registros">
          <ArrowLeft className="mr-2 size-4" /> Todos los libros
        </Link>
      </Button>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Libro de {pool?.name ?? "la piscina"}</h2>
          <p className="text-sm text-muted-foreground">
            {pool?.address || "Registros sanitarios según el Real Decreto 742/2013."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setGuiaAbierta(true)}>
            <HelpCircle className="mr-2 size-4" /> Guía de medición
          </Button>
          <Button variant="outline" onClick={exportarPdf} disabled={filtrados.length === 0}>
            <FileDown className="mr-2 size-4" /> Exportar a PDF
          </Button>
          <Button
            onClick={() => {
              if (typeof window !== "undefined" && !localStorage.getItem("guia-medicion-vista")) {
                localStorage.setItem("guia-medicion-vista", "1");
                setGuiaAbierta(true);
                return;
              }
              setFormAbierto(true);
            }}
            disabled={vasos.length === 0}
          >
            <Plus className="mr-2 size-4" /> Nuevo registro
          </Button>
        </div>
      </header>

      <Card className="mb-6">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-4">
          <select
            className={selectClass}
            value={filtros.vaso}
            onChange={(e) => setFiltros((p) => ({ ...p, vaso: e.target.value }))}
          >
            <option value="">Todos los vasos</option>
            {vasos.map((v) => (
              <option key={v.vessel} value={v.vessel}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={filtros.tipo}
            onChange={(e) => setFiltros((p) => ({ ...p, tipo: e.target.value }))}
          >
            <option value="">Todos los controles</option>
            {TIPOS_CONTROL.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <Input type="date" value={filtros.desde} onChange={(e) => setFiltros((p) => ({ ...p, desde: e.target.value }))} />
          <Input type="date" value={filtros.hasta} onChange={(e) => setFiltros((p) => ({ ...p, hasta: e.target.value }))} />
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : filtrados.length === 0 ? (
        <Card>
          <CardContent className="grid place-items-center gap-3 p-12 text-center">
            <BookOpen className="size-8 text-primary" />
            <p className="font-display font-semibold">Todavía no hay registros en este libro</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Crea el primer control de rutina antes de abrir la piscina al público.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {["Fecha", "Hora", "Vaso", "Técnico", "pH", "Cloro/Bromo", "Turbidez", "Estado"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{new Date(r.record_date).toLocaleDateString("es-ES")}</td>
                  <td className="px-4 py-3">{r.record_time}</td>
                  <td className="px-4 py-3">{nombreVaso(r)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.technician_name}</td>
                  <td className="px-4 py-3">{r.ph}</td>
                  <td className="px-4 py-3">{r.free_chlorine ?? r.bromine_total ?? "-"}</td>
                  <td className="px-4 py-3">{r.turbidity}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-medium",
                        r.vessel_status === "abierto"
                          ? "border-primary/30 bg-primary/15 text-primary"
                          : "border-destructive/30 bg-destructive/15 text-destructive",
                      )}
                    >
                      {r.vessel_status === "abierto" ? "Abierto" : "Cerrado por incidencia"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Dialog open={guiaAbierta} onOpenChange={setGuiaAbierta}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Guía rápida de medición</DialogTitle>
          </DialogHeader>
          <GuiaMedicion
            onClose={() => {
              setGuiaAbierta(false);
              setFormAbierto(true);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={formAbierto} onOpenChange={setFormAbierto}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Nuevo registro sanitario</DialogTitle>
          </DialogHeader>
          {companyId && (
            <RegistroSanitarioForm
              companyId={companyId}
              userId={user.id}
              technicianName={tecnico}
              vasos={vasos}
              onSaved={() => {
                setFormAbierto(false);
                queryClient.invalidateQueries({ queryKey: ["pool-records", poolId] });
                queryClient.invalidateQueries({ queryKey: ["pools-libro-index", companyId] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
