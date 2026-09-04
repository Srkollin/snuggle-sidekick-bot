import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";

import { ClienteForm } from "@/components/clientes/ClienteForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { DOSIFICACIONES, ESTADOS_PISCINA, type OtroEmpleado } from "@/lib/dehesapool";

export type PiscinaEditable = {
  id: string;
  name: string;
  address: string | null;
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
  client_id?: string | null;
  opening_date?: string | null;
  closing_date?: string | null;
  open_all_year?: boolean;
  assigned_employees?: string[];
  opening_time?: string | null;
  closing_time?: string | null;
  rest_start?: string | null;
  rest_end?: string | null;
};

export function PiscinaForm({
  companyId,
  userId,
  pool,
  onSaved,
}: {
  companyId: string;
  userId: string;
  pool?: PiscinaEditable;
  onSaved: () => void;
}) {
  const isEdit = !!pool;
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [name, setName] = useState(pool?.name ?? "");
  const [address, setAddress] = useState(pool?.address ?? "");
  const [status, setStatus] = useState<string>(pool?.status ?? "Abierta");
  const [clientId, setClientId] = useState<string>(pool?.client_id ?? "");
  const [clientSearch, setClientSearch] = useState("");
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [openingDate, setOpeningDate] = useState(pool?.opening_date ?? "");
  const [closingDate, setClosingDate] = useState(pool?.closing_date ?? "");
  const [openAllYear, setOpenAllYear] = useState(pool?.open_all_year ? "si" : "no");
  const [openingTime, setOpeningTime] = useState(pool?.opening_time ?? "");
  const [closingTime, setClosingTime] = useState(pool?.closing_time ?? "");
  const [hasRest, setHasRest] = useState(pool?.rest_start || pool?.rest_end ? "si" : "no");
  const [restStart, setRestStart] = useState(pool?.rest_start ?? "");
  const [restEnd, setRestEnd] = useState(pool?.rest_end ?? "");

  const queryClient = useQueryClient();
  const { data: clients } = useQuery({
    queryKey: ["clients", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, client_type")
        .eq("company_id", companyId)
        .order("name");
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; name: string; client_type: string }[];
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

  const [assigned, setAssigned] = useState<string[]>(pool?.assigned_employees ?? []);

  const filteredClients = (clients ?? []).filter((c) =>
    c.name.toLowerCase().includes(clientSearch.trim().toLowerCase()),
  );
  const [dosing, setDosing] = useState(pool?.dosing_type ?? "Cloro");
  const [dosingOther, setDosingOther] = useState(pool?.dosing_other ?? "");

  const [hasKids, setHasKids] = useState(pool?.has_kids_pool ? "si" : "no");
  const [kidsName, setKidsName] = useState(pool?.kids_name ?? "");
  const [kidsDosing, setKidsDosing] = useState(pool?.kids_dosing_type ?? "Cloro");
  const [kidsDosingOther, setKidsDosingOther] = useState(pool?.kids_dosing_other ?? "");

  const [hasLifeguard, setHasLifeguard] = useState(pool?.has_lifeguard ? "si" : "no");
  const [lifeguards, setLifeguards] = useState(pool?.lifeguards_count ?? 0);
  const [hasDoorman, setHasDoorman] = useState(pool?.has_doorman ? "si" : "no");
  const [doormen, setDoormen] = useState(pool?.doormen_count ?? 0);
  const [hasOthers, setHasOthers] = useState(pool?.other_staff?.length ? "si" : "no");
  const [others, setOthers] = useState<OtroEmpleado[]>(
    pool?.other_staff?.length ? pool.other_staff : [{ tipo: "", cantidad: 0 }],
  );


  function pickFile(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  /** Al asignar un empleado a una piscina entra en turno; al desasignarlo sale
   *  si no queda asignado a ninguna otra piscina. */
  async function sincronizarTurnos(poolId: string | null, antes: string[], ahora: string[]) {
    const anadidos = ahora.filter((id) => !antes.includes(id));
    const quitados = antes.filter((id) => !ahora.includes(id));

    if (anadidos.length) {
      await supabase
        .from("employees")
        .update({ work_status: "en_turno" } as never)
        .in("id", anadidos)
        .eq("company_id", companyId)
        .in("work_status", ["fuera_de_turno", "en_turno"]);
    }

    if (quitados.length) {
      const { data: otras } = await supabase
        .from("pools")
        .select("id, assigned_employees")
        .eq("company_id", companyId);
      const sigueAsignado = new Set<string>();
      ((otras ?? []) as unknown as { id: string; assigned_employees: string[] }[]).forEach((p) => {
        if (poolId && p.id === poolId) return;
        (p.assigned_employees ?? []).forEach((id) => sigueAsignado.add(id));
      });
      const liberar = quitados.filter((id) => !sigueAsignado.has(id));
      if (liberar.length) {
        await supabase
          .from("employees")
          .update({ work_status: "fuera_de_turno" } as never)
          .in("id", liberar)
          .eq("company_id", companyId)
          .eq("work_status", "en_turno");
      }
    }
  }

  async function submit() {
    if (!name.trim()) {
      toast.error("Indica el nombre de la piscina.");
      return;
    }
    setSaving(true);
    try {
      let photoPath: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${companyId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("pool-photos").upload(path, file, {
          upsert: false,
          contentType: file.type,
        });
        if (upErr) throw upErr;
        photoPath = path;
      }

      const payload = {
        name: name.trim(),
        address: address.trim() || null,
        status,
        dosing_type: dosing,
        dosing_other: dosing === "Otros" ? dosingOther.trim() || null : null,
        has_kids_pool: hasKids === "si",
        kids_name: hasKids === "si" ? kidsName.trim() || null : null,
        kids_dosing_type: hasKids === "si" ? kidsDosing : null,
        kids_dosing_other: hasKids === "si" && kidsDosing === "Otros" ? kidsDosingOther.trim() || null : null,
        has_lifeguard: hasLifeguard === "si",
        lifeguards_count: hasLifeguard === "si" ? lifeguards : 0,
        has_doorman: hasDoorman === "si",
        doormen_count: hasDoorman === "si" ? doormen : 0,
        other_staff:
          hasOthers === "si" ? others.filter((o) => o.tipo.trim()).map((o) => ({ ...o, tipo: o.tipo.trim() })) : [],
        client_id: clientId || null,
        assigned_employees: assigned,
        open_all_year: openAllYear === "si",
        opening_date: openAllYear === "si" ? null : openingDate || null,
        closing_date: openAllYear === "si" ? null : closingDate || null,
        opening_time: openingTime || null,
        closing_time: closingTime || null,
        rest_start: hasRest === "si" ? restStart || null : null,
        rest_end: hasRest === "si" ? restEnd || null : null,
      };

      if (isEdit) {
        const { error } = await supabase
          .from("pools")
          .update({ ...payload, ...(photoPath ? { photo_path: photoPath } : {}) } as never)
          .eq("id", pool!.id);
        if (error) throw error;
        await sincronizarTurnos(pool!.id, pool?.assigned_employees ?? [], assigned);
        toast.success("Piscina actualizada.");
      } else {
        const { data: creada, error } = await supabase
          .from("pools")
          .insert({ ...payload, company_id: companyId, created_by: userId, photo_path: photoPath } as never)
          .select("id")
          .single();
        if (error) throw error;
        await sincronizarTurnos((creada as { id: string } | null)?.id ?? null, [], assigned);
        toast.success("Piscina registrada.");
      }
      onSaved();

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se ha podido registrar la piscina.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <Label className="mb-2 block text-sm text-muted-foreground">Foto de la piscina</Label>
        <label className="flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
          {preview ? (
            <img src={preview} alt="Vista previa de la piscina" className="h-full w-full object-cover" />
          ) : (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImagePlus className="size-5" /> Añadir foto
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <Section title="Datos principales">
        <Field label="Nombre de la piscina">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        </Field>
        <Field label="Dirección">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} />
        </Field>
        <Field label="Estado">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_PISCINA.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Section title="Cliente">
        <Field label="Buscar cliente">
          <Input
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="Escribe para filtrar"
          />
        </Field>
        <Field label="Cliente asociado">
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Sin cliente asociado" />
            </SelectTrigger>
            <SelectContent>
              {filteredClients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} · {c.client_type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => setNewClientOpen(true)}
        >
          <Plus className="mr-1 size-4" /> Crear cliente nuevo
        </Button>
      </Section>

      <Section title="Temporada">
        <YesNo label="¿Está abierta todo el año?" value={openAllYear} onChange={setOpenAllYear} />
        {openAllYear === "no" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Fecha de apertura">
              <Input type="date" value={openingDate} onChange={(e) => setOpeningDate(e.target.value)} />
            </Field>
            <Field label="Fecha de cierre">
              <Input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} />
            </Field>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Hora de apertura">
            <Input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} />
          </Field>
          <Field label="Hora de cierre">
            <Input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} />
          </Field>
        </div>
        <YesNo label="¿Tiene descanso?" value={hasRest} onChange={setHasRest} />
        {hasRest === "si" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Inicio del descanso">
              <Input type="time" value={restStart} onChange={(e) => setRestStart(e.target.value)} />
            </Field>
            <Field label="Fin del descanso">
              <Input type="time" value={restEnd} onChange={(e) => setRestEnd(e.target.value)} />
            </Field>
          </div>
        )}
      </Section>

      <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Nuevo cliente</DialogTitle>
          </DialogHeader>
          <ClienteForm
            companyId={companyId}
            userId={userId}
            onSaved={() => {
              setNewClientOpen(false);
              queryClient.invalidateQueries({ queryKey: ["clients", companyId] });
            }}
          />
        </DialogContent>
      </Dialog>

      <Section title="Tratamiento principal">
        <Field label="Tipo de dosificación">
          <Select value={dosing} onValueChange={setDosing}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOSIFICACIONES.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {dosing === "Otros" && (
          <Field label="Especificar sistema">
            <Input value={dosingOther} onChange={(e) => setDosingOther(e.target.value)} />
          </Field>
        )}
      </Section>

      <Section title="Piscina infantil">
        <YesNo label="¿Tiene piscina infantil?" value={hasKids} onChange={setHasKids} />
        {hasKids === "si" && (
          <>
            <Field label="Nombre o identificación">
              <Input value={kidsName} onChange={(e) => setKidsName(e.target.value)} />
            </Field>
            <Field label="Tipo de dosificación infantil">
              <Select value={kidsDosing} onValueChange={setKidsDosing}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOSIFICACIONES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {kidsDosing === "Otros" && (
              <Field label="Especificar sistema infantil">
                <Input value={kidsDosingOther} onChange={(e) => setKidsDosingOther(e.target.value)} />
              </Field>
            )}
          </>
        )}
      </Section>

      <Section title="Personal asignado">
        <YesNo label="¿Tiene socorrista?" value={hasLifeguard} onChange={setHasLifeguard} />
        {hasLifeguard === "si" && (
          <Field label="Número de socorristas">
            <Input
              type="number"
              min={0}
              value={lifeguards}
              onChange={(e) => setLifeguards(Number(e.target.value) || 0)}
            />
          </Field>
        )}
        <YesNo label="¿Tiene portero?" value={hasDoorman} onChange={setHasDoorman} />
        {hasDoorman === "si" && (
          <Field label="Número de porteros">
            <Input type="number" min={0} value={doormen} onChange={(e) => setDoormen(Number(e.target.value) || 0)} />
          </Field>
        )}
        <YesNo label="¿Tiene otros empleados?" value={hasOthers} onChange={setHasOthers} />
        {hasOthers === "si" && (
          <div className="grid gap-3">
            {others.map((o, i) => (
              <div key={i} className="flex items-end gap-2">
                <Field label="Tipo de empleado">
                  <Input
                    value={o.tipo}
                    placeholder="Limpieza"
                    onChange={(e) =>
                      setOthers(others.map((x, j) => (j === i ? { ...x, tipo: e.target.value } : x)))
                    }
                  />
                </Field>
                <div className="w-28">
                  <Field label="Cantidad">
                    <Input
                      type="number"
                      min={0}
                      value={o.cantidad}
                      onChange={(e) =>
                        setOthers(
                          others.map((x, j) => (j === i ? { ...x, cantidad: Number(e.target.value) || 0 } : x)),
                        )
                      }
                    />
                  </Field>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setOthers(others.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-self-start"
              onClick={() => setOthers([...others, { tipo: "", cantidad: 0 }])}
            >
              <Plus className="mr-1 size-4" /> Añadir otro empleado
            </Button>
          </div>
        )}
      </Section>

      <Section title="Empleados asignados">
        {!empleados?.length ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay empleados registrados en tu empresa.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {empleados.map((e) => {
              const checked = assigned.includes(e.id);
              return (
                <label
                  key={e.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={checked}
                    onChange={() =>
                      setAssigned(checked ? assigned.filter((id) => id !== e.id) : [...assigned, e.id])
                    }
                  />
                  <span className="min-w-0 truncate">
                    {e.full_name}
                    {e.roles?.length ? (
                      <span className="text-muted-foreground"> · {e.roles.join(", ")}</span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </Section>

      <Button onClick={submit} disabled={saving}>
        {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
        {isEdit ? "Guardar cambios" : "Registrar piscina"}
      </Button>

    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 rounded-xl border border-border/70 bg-card p-4">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-primary">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid flex-1 gap-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <RadioGroup value={value} onValueChange={onChange} className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <RadioGroupItem value="si" /> Sí
        </label>
        <label className="flex items-center gap-2 text-sm">
          <RadioGroupItem value="no" /> No
        </label>
      </RadioGroup>
    </div>
  );
}
