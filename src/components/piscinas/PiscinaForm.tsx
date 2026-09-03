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

export function PiscinaForm({
  companyId,
  userId,
  onSaved,
}: {
  companyId: string;
  userId: string;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<string>("Abierta");
  const [clientId, setClientId] = useState<string>("");
  const [clientSearch, setClientSearch] = useState("");
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [openingDate, setOpeningDate] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [openAllYear, setOpenAllYear] = useState("no");

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

  const filteredClients = (clients ?? []).filter((c) =>
    c.name.toLowerCase().includes(clientSearch.trim().toLowerCase()),
  );
  const [dosing, setDosing] = useState("Cloro");
  const [dosingOther, setDosingOther] = useState("");

  const [hasKids, setHasKids] = useState("no");
  const [kidsName, setKidsName] = useState("");
  const [kidsDosing, setKidsDosing] = useState("Cloro");
  const [kidsDosingOther, setKidsDosingOther] = useState("");

  const [hasLifeguard, setHasLifeguard] = useState("no");
  const [lifeguards, setLifeguards] = useState(0);
  const [hasDoorman, setHasDoorman] = useState("no");
  const [doormen, setDoormen] = useState(0);
  const [hasOthers, setHasOthers] = useState("no");
  const [others, setOthers] = useState<OtroEmpleado[]>([{ tipo: "", cantidad: 0 }]);

  function pickFile(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
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

      const { error } = await supabase.from("pools").insert({
        company_id: companyId,
        created_by: userId,
        name: name.trim(),
        address: address.trim() || null,
        photo_path: photoPath,
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
        open_all_year: openAllYear === "si",
        opening_date: openAllYear === "si" ? null : openingDate || null,
        closing_date: openAllYear === "si" ? null : closingDate || null,
      } as never);
      if (error) throw error;
      toast.success("Piscina registrada.");
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

      <Button onClick={submit} disabled={saving}>
        {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
        Registrar piscina
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
