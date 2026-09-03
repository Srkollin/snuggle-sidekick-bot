import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { METODOS_PAGO, TIPOS_CLIENTE } from "@/lib/dehesapool";

export function ClienteForm({
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

  const [tipo, setTipo] = useState<string>("Particular");
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [collegiate, setCollegiate] = useState("");
  const [communities, setCommunities] = useState<string[]>([]);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phone2, setPhone2] = useState("");

  const [address, setAddress] = useState("");
  const [cp, setCp] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");

  const [billingSame, setBillingSame] = useState("si");
  const [bAddress, setBAddress] = useState("");
  const [bCp, setBCp] = useState("");
  const [bCity, setBCity] = useState("");
  const [bProvince, setBProvince] = useState("");

  const [payment, setPayment] = useState("");
  const [iban, setIban] = useState("");
  const [holder, setHolder] = useState("");
  const [requiresInvoice, setRequiresInvoice] = useState("si");
  const [notes, setNotes] = useState("");

  const esParticular = tipo === "Particular";
  const esAdminFincas = tipo === "Administrador de fincas";

  const nombreLabel = esParticular
    ? "Nombre completo"
    : esAdminFincas
      ? "Nombre de la administración"
      : "Nombre / Razón social";

  async function save(isDraft: boolean) {
    if (!isDraft) {
      if (!name.trim()) return toast.error(`Indica el ${nombreLabel.toLowerCase()}.`);
      if (!phone.trim()) return toast.error("El teléfono principal es obligatorio.");
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return toast.error("Indica un correo electrónico válido.");
    } else if (!name.trim()) {
      return toast.error("Indica al menos un nombre para guardar el borrador.");
    }

    setSaving(true);
    try {
      let logoPath: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${companyId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("client-logos")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        logoPath = path;
      }

      const { error } = await supabase.from("clients").insert({
        company_id: companyId,
        created_by: userId,
        client_type: tipo,
        logo_path: logoPath,
        name: name.trim(),
        tax_id: taxId.trim() || null,
        contact_person: contactPerson.trim() || null,
        contact_role: contactRole.trim() || null,
        collegiate_number: esAdminFincas ? collegiate.trim() || null : null,
        managed_communities: esAdminFincas ? communities.filter((c) => c.trim()) : [],
        phone: phone.trim() || null,
        email: email.trim() || null,
        phone_secondary: phone2.trim() || null,
        address: address.trim() || null,
        postal_code: cp.trim() || null,
        city: city.trim() || null,
        province: province.trim() || null,
        billing_same: billingSame === "si",
        billing_address: billingSame === "no" ? bAddress.trim() || null : null,
        billing_postal_code: billingSame === "no" ? bCp.trim() || null : null,
        billing_city: billingSame === "no" ? bCity.trim() || null : null,
        billing_province: billingSame === "no" ? bProvince.trim() || null : null,
        payment_method: payment || null,
        iban: payment === "Domiciliación bancaria" ? iban.trim() || null : null,
        account_holder: payment === "Domiciliación bancaria" ? holder.trim() || null : null,
        requires_invoice: requiresInvoice === "si",
        notes: notes.trim() || null,
        is_draft: isDraft,
      } as never);
      if (error) throw error;
      toast.success(isDraft ? "Borrador guardado." : "Cliente registrado.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se ha podido guardar el cliente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <Label className="mb-2 block text-sm text-muted-foreground">Logo o foto del cliente (opcional)</Label>
        <label className="flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
          {preview ? (
            <img src={preview} alt="Vista previa del logo" className="h-full w-full object-contain" />
          ) : (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImagePlus className="size-5" /> Añadir logo
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
        </label>
      </div>

      <Section title="Tipo de cliente">
        <RadioGroup value={tipo} onValueChange={setTipo} className="grid gap-2">
          {TIPOS_CLIENTE.map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm">
              <RadioGroupItem value={t} /> {t}
            </label>
          ))}
        </RadioGroup>
      </Section>

      <Section title="Datos principales">
        <Field label={`${nombreLabel} *`}>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} />
        </Field>
        <Field label={esParticular ? "DNI / NIE (opcional)" : "CIF / NIF (opcional)"}>
          <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} maxLength={20} />
        </Field>
        {!esParticular && (
          <>
            <Field label="Persona de contacto (opcional)">
              <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </Field>
            {!esAdminFincas && (
              <Field label="Cargo del contacto (opcional)">
                <Input value={contactRole} onChange={(e) => setContactRole(e.target.value)} />
              </Field>
            )}
          </>
        )}
        {esAdminFincas && (
          <>
            <Field label="Nº de colegiado (opcional)">
              <Input value={collegiate} onChange={(e) => setCollegiate(e.target.value)} />
            </Field>
            <div className="grid gap-2">
              <Label className="text-sm text-muted-foreground">Comunidades que gestiona (opcional)</Label>
              {communities.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={c}
                    onChange={(e) => setCommunities(communities.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCommunities(communities.filter((_, j) => j !== i))}
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
                onClick={() => setCommunities([...communities, ""])}
              >
                <Plus className="mr-1 size-4" /> Añadir comunidad
              </Button>
            </div>
          </>
        )}
      </Section>

      <Section title="Datos de contacto">
        <Field label="Teléfono principal *">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
        </Field>
        <Field label="Correo electrónico *">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
        </Field>
        <Field label="Teléfono secundario (opcional)">
          <Input value={phone2} onChange={(e) => setPhone2(e.target.value)} maxLength={20} />
        </Field>
      </Section>

      <Section title="Dirección (opcional)">
        <Field label="Dirección">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Código postal">
            <Input value={cp} onChange={(e) => setCp(e.target.value)} maxLength={10} />
          </Field>
          <Field label="Municipio / ciudad">
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
          <Field label="Provincia">
            <Input value={province} onChange={(e) => setProvince(e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Dirección de facturación (opcional)">
        <YesNo label="¿Es la misma que la dirección anterior?" value={billingSame} onChange={setBillingSame} />
        {billingSame === "no" && (
          <>
            <Field label="Dirección de facturación">
              <Input value={bAddress} onChange={(e) => setBAddress(e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Código postal">
                <Input value={bCp} onChange={(e) => setBCp(e.target.value)} maxLength={10} />
              </Field>
              <Field label="Municipio / ciudad">
                <Input value={bCity} onChange={(e) => setBCity(e.target.value)} />
              </Field>
              <Field label="Provincia">
                <Input value={bProvince} onChange={(e) => setBProvince(e.target.value)} />
              </Field>
            </div>
          </>
        )}
      </Section>

      <Section title="Datos de facturación (opcional)">
        <Field label="Método de pago habitual">
          <Select value={payment} onValueChange={setPayment}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              {METODOS_PAGO.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {payment === "Domiciliación bancaria" && (
          <>
            <Field label="IBAN">
              <Input value={iban} onChange={(e) => setIban(e.target.value)} maxLength={34} />
            </Field>
            <Field label="Titular de la cuenta">
              <Input value={holder} onChange={(e) => setHolder(e.target.value)} />
            </Field>
          </>
        )}
        <YesNo label="¿Requiere factura?" value={requiresInvoice} onChange={setRequiresInvoice} />
      </Section>

      <Section title="Observaciones (opcional)">
        <Field label="Notas internas (visibles solo para el administrador)">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} rows={3} />
        </Field>
      </Section>

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={onSaved} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="outline" onClick={() => save(true)} disabled={saving}>
          Guardar borrador
        </Button>
        <Button onClick={() => save(false)} disabled={saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Registrar cliente
        </Button>
      </div>
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

function YesNo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
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
