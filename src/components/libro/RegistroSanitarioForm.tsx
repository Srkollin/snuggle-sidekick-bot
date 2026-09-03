import { useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { calcularAlertas, DESINFECTANTES, PRESENCIA, TIPOS_CONTROL } from "@/lib/libro-sanitario";
import { cn } from "@/lib/utils";

export type Vaso = { poolId: string; vessel: string; label: string; dosing: string | null };

const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));

function Campo({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Seccion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-border p-4">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-primary">{title}</h3>
      {children}
    </section>
  );
}

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function RegistroSanitarioForm({
  companyId,
  userId,
  technicianName,
  vasos,
  onSaved,
}: {
  companyId: string;
  userId: string;
  technicianName: string;
  vasos: Vaso[];
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [firmado, setFirmado] = useState(false);
  const [f, setF] = useState({
    vaso: vasos[0] ? `${vasos[0].poolId}|${vasos[0].vessel}` : "",
    record_date: new Date().toISOString().slice(0, 10),
    record_time: new Date().toTimeString().slice(0, 5),
    control_type: "rutina",
    ph: "",
    free_chlorine: "",
    turbidity: "",
    water_temperature: "",
    transparency: "Correcta",
    disinfectant_type: "Cloro",
    combined_chlorine: "",
    bromine_total: "",
    isocyanuric_acid: "",
    redox: "",
    ecoli: "Ausencia",
    pseudomonas: "Ausencia",
    legionella: "",
    aerobic_count: "",
    total_coliforms: "",
    bathers_count: "",
    water_meter: "",
    recirculation_hours: "",
    has_incident: false,
    incident_description: "",
    corrective_action: "",
    reopening_time: "",
  });
  const [labFile, setLabFile] = useState<File | null>(null);
  const [incidentFile, setIncidentFile] = useState<File | null>(null);

  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  const esBromo = f.disinfectant_type === "Bromo";
  const esPeriodico = f.control_type === "periodico";

  const alertas = useMemo(
    () =>
      calcularAlertas({
        ph: num(f.ph),
        free_chlorine: num(f.free_chlorine),
        turbidity: num(f.turbidity),
        water_temperature: num(f.water_temperature),
        disinfectant_type: f.disinfectant_type,
        bromine_total: num(f.bromine_total),
      }),
    [f.ph, f.free_chlorine, f.turbidity, f.water_temperature, f.disinfectant_type, f.bromine_total],
  );

  const faltanObligatorios =
    f.ph.trim() === "" ||
    f.turbidity.trim() === "" ||
    (esBromo ? f.bromine_total.trim() === "" : f.free_chlorine.trim() === "") ||
    f.vaso === "";

  async function subir(file: File | null, prefix: string) {
    if (!file) return null;
    const path = `${companyId}/${prefix}-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("libro-sanitario").upload(path, file);
    if (error) throw error;
    return path;
  }

  async function guardar() {
    if (faltanObligatorios) {
      toast.error("Faltan pH, desinfectante o turbidez.");
      return;
    }
    if (!firmado) {
      toast.error("Debes firmar el registro antes de guardarlo.");
      return;
    }
    setSaving(true);
    try {
      const [poolId, vessel] = f.vaso.split("|");
      const lab_certificate_path = await subir(labFile, "lab");
      const incident_photo_path = await subir(incidentFile, "incidencia");

      const { error } = await supabase.from("pool_records").insert({
        company_id: companyId,
        created_by: userId,
        pool_id: poolId!,
        vessel: vessel ?? "principal",
        record_date: f.record_date,
        record_time: f.record_time,
        technician_name: technicianName,
        control_type: f.control_type,
        ph: num(f.ph),
        free_chlorine: num(f.free_chlorine),
        turbidity: num(f.turbidity),
        water_temperature: num(f.water_temperature),
        transparency: f.transparency,
        disinfectant_type: f.disinfectant_type,
        combined_chlorine: num(f.combined_chlorine),
        bromine_total: num(f.bromine_total),
        isocyanuric_acid: num(f.isocyanuric_acid),
        redox: num(f.redox),
        ecoli: esPeriodico ? f.ecoli : null,
        pseudomonas: esPeriodico ? f.pseudomonas : null,
        legionella: esPeriodico ? num(f.legionella) : null,
        aerobic_count: esPeriodico ? num(f.aerobic_count) : null,
        total_coliforms: esPeriodico ? num(f.total_coliforms) : null,
        lab_certificate_path,
        bathers_count: num(f.bathers_count),
        water_meter: num(f.water_meter),
        recirculation_hours: num(f.recirculation_hours),
        alerts: alertas,
        vessel_status: alertas.length > 0 ? "cerrado_por_incidencia" : "abierto",
        has_incident: f.has_incident,
        incident_description: f.has_incident ? f.incident_description : null,
        corrective_action: f.has_incident ? f.corrective_action : null,
        reopening_time: f.has_incident && f.reopening_time ? f.reopening_time : null,
        incident_photo_path,
        signed_by: technicianName,
        signed_at: new Date().toISOString(),
      } as never);
      if (error) throw error;
      toast.success("Registro sanitario guardado.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar el registro.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Seccion title="Selección previa">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Piscina / Vaso" required>
            <select className={selectClass} value={f.vaso} onChange={(e) => set("vaso", e.target.value)}>
              <option value="">Seleccionar piscina</option>
              {vasos.map((v) => (
                <option key={`${v.poolId}|${v.vessel}`} value={`${v.poolId}|${v.vessel}`}>
                  {v.label}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Técnico responsable">
            <Input value={technicianName} readOnly className="bg-muted/50" />
          </Campo>
          <Campo label="Fecha del registro">
            <Input type="date" value={f.record_date} onChange={(e) => set("record_date", e.target.value)} />
          </Campo>
          <Campo label="Hora del control">
            <Input type="time" value={f.record_time} onChange={(e) => set("record_time", e.target.value)} />
          </Campo>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {TIPOS_CONTROL.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => set("control_type", t.value)}
              className={cn(
                "rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-secondary",
                f.control_type === t.value && "border-primary bg-primary/10",
              )}
            >
              <span className="block font-medium">{t.label}</span>
              <span className="block text-xs text-muted-foreground">{t.hint}</span>
            </button>
          ))}
        </div>
      </Seccion>

      <Seccion title="Parámetros físico-químicos">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo label="pH" required hint="Rango normal: 7,2 - 8,0">
            <Input inputMode="decimal" value={f.ph} onChange={(e) => set("ph", e.target.value)} />
          </Campo>
          <Campo label="Turbidez (UNF)" required hint="Máximo: 5 UNF">
            <Input inputMode="decimal" value={f.turbidity} onChange={(e) => set("turbidity", e.target.value)} />
          </Campo>
          <Campo label="Tipo de desinfectante">
            <select
              className={selectClass}
              value={f.disinfectant_type}
              onChange={(e) => set("disinfectant_type", e.target.value)}
            >
              {DESINFECTANTES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Campo>

          {esBromo ? (
            <Campo label="Bromo total (mg/L)" required hint="Rango normal: 2 - 5 mg/L">
              <Input inputMode="decimal" value={f.bromine_total} onChange={(e) => set("bromine_total", e.target.value)} />
            </Campo>
          ) : (
            <>
              <Campo label="Cloro libre residual (mg/L)" required hint="Rango normal: 0,5 - 2,0 mg/L">
                <Input inputMode="decimal" value={f.free_chlorine} onChange={(e) => set("free_chlorine", e.target.value)} />
              </Campo>
              <Campo label="Cloro combinado (mg/L)" hint="Máximo: 0,6 mg/L (opcional)">
                <Input
                  inputMode="decimal"
                  value={f.combined_chlorine}
                  onChange={(e) => set("combined_chlorine", e.target.value)}
                />
              </Campo>
            </>
          )}

          <Campo label="Temperatura del agua (°C)" hint="Rango normal: 24 - 30 °C (opcional)">
            <Input
              inputMode="decimal"
              value={f.water_temperature}
              onChange={(e) => set("water_temperature", e.target.value)}
            />
          </Campo>
          <Campo label="Ácido isocianúrico (mg/L)" hint="Máximo: 75 mg/L (opcional)">
            <Input
              inputMode="decimal"
              value={f.isocyanuric_acid}
              onChange={(e) => set("isocyanuric_acid", e.target.value)}
            />
          </Campo>
          <Campo label="Potencial REDOX (mV)" hint="Rango normal: 250 - 900 mV (opcional)">
            <Input inputMode="decimal" value={f.redox} onChange={(e) => set("redox", e.target.value)} />
          </Campo>
          <Campo label="Transparencia">
            <select className={selectClass} value={f.transparency} onChange={(e) => set("transparency", e.target.value)}>
              <option value="Correcta">Correcta - se ve el desagüe de fondo</option>
              <option value="Incorrecta">Incorrecta - no se distingue el fondo</option>
            </select>
          </Campo>
        </div>
      </Seccion>

      {esPeriodico && (
        <Seccion title="Control periódico (laboratorio acreditado)">
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo label="Escherichia coli">
              <select className={selectClass} value={f.ecoli} onChange={(e) => set("ecoli", e.target.value)}>
                {PRESENCIA.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Pseudomonas aeruginosa">
              <select className={selectClass} value={f.pseudomonas} onChange={(e) => set("pseudomonas", e.target.value)}>
                {PRESENCIA.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Legionella spp (UFC/L)" hint="Límite: <100 UFC/L">
              <Input inputMode="decimal" value={f.legionella} onChange={(e) => set("legionella", e.target.value)} />
            </Campo>
            <Campo label="Aerobios a 37 °C (UFC/mL)">
              <Input inputMode="decimal" value={f.aerobic_count} onChange={(e) => set("aerobic_count", e.target.value)} />
            </Campo>
            <Campo label="Coliformes totales (UFC/100mL)">
              <Input
                inputMode="decimal"
                value={f.total_coliforms}
                onChange={(e) => set("total_coliforms", e.target.value)}
              />
            </Campo>
            <Campo label="Certificado de laboratorio">
              <Input type="file" accept="application/pdf,image/*" onChange={(e) => setLabFile(e.target.files?.[0] ?? null)} />
            </Campo>
          </div>
        </Seccion>
      )}

      <Seccion title="Datos operativos (opcional)">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo label="Bañistas en el momento del control">
            <Input inputMode="numeric" value={f.bathers_count} onChange={(e) => set("bathers_count", e.target.value)} />
          </Campo>
          <Campo label="Contador de agua depurada (m³)">
            <Input inputMode="decimal" value={f.water_meter} onChange={(e) => set("water_meter", e.target.value)} />
          </Campo>
          <Campo label="Tiempo de recirculación (h)">
            <Input
              inputMode="decimal"
              value={f.recirculation_hours}
              onChange={(e) => set("recirculation_hours", e.target.value)}
            />
          </Campo>
        </div>
      </Seccion>

      {alertas.length > 0 && (
        <div className="space-y-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          {alertas.map((a) => (
            <p key={a} className="flex items-start gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {a}
            </p>
          ))}
          <p className="text-xs text-destructive">Estado del vaso tras el registro: cerrado por incidencia.</p>
        </div>
      )}

      <Seccion title="Incidencias y medidas correctoras">
        <div className="flex gap-2">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => set("has_incident", v)}
              className={cn(
                "rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary",
                f.has_incident === v && "border-primary bg-primary/10",
              )}
            >
              {v ? "Sí, hubo incidencia" : "No hubo incidencia"}
            </button>
          ))}
        </div>
        {f.has_incident && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Descripción de la incidencia">
              <Textarea
                value={f.incident_description}
                onChange={(e) => set("incident_description", e.target.value)}
                rows={3}
              />
            </Campo>
            <Campo label="Medida correctora aplicada">
              <Textarea value={f.corrective_action} onChange={(e) => set("corrective_action", e.target.value)} rows={3} />
            </Campo>
            <Campo label="Hora de reapertura del vaso">
              <Input type="time" value={f.reopening_time} onChange={(e) => set("reopening_time", e.target.value)} />
            </Campo>
            <Campo label="Foto de la incidencia (opcional)">
              <Input type="file" accept="image/*" onChange={(e) => setIncidentFile(e.target.files?.[0] ?? null)} />
            </Campo>
          </div>
        )}
      </Seccion>

      <Seccion title="Firma digital del técnico">
        <button
          type="button"
          onClick={() => setFirmado((p) => !p)}
          className={cn(
            "w-full rounded-lg border border-dashed border-border p-4 text-sm transition-colors hover:bg-secondary",
            firmado && "border-primary bg-primary/10 font-medium text-primary",
          )}
        >
          {firmado ? `Firmado por ${technicianName}` : "Confirmar y firmar registro"}
        </button>
      </Seccion>

      <Button className="w-full" disabled={faltanObligatorios || saving} onClick={guardar}>
        {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
        Guardar registro sanitario
      </Button>
      {faltanObligatorios && (
        <p className="text-center text-xs text-muted-foreground">
          Necesitas piscina, pH, desinfectante y turbidez para poder guardar.
        </p>
      )}
    </div>
  );
}
