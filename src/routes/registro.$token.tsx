import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ImagePlus, Loader2, Waves } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { getInvitePublic, submitEmployeeRegistration } from "@/lib/invites.functions";
import { ESTADO_CIVIL, NIVEL_ESTUDIOS, TITULACION_POR_ROL } from "@/lib/dehesapool";

export const Route = createFileRoute("/registro/$token")({
  head: () => ({
    meta: [
      { title: "Alta de empleado | Dehesapool" },
      {
        name: "description",
        content: "Completa tus datos personales y documentación para incorporarte al equipo de la empresa.",
      },
      { property: "og:title", content: "Alta de empleado | Dehesapool" },
      { property: "og:description", content: "Formulario de registro de empleado en Dehesapool." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegistroEmpleadoPage,
});

const MOTIVOS: Record<string, string> = {
  "no-existe": "Este enlace de registro no existe.",
  inactivo: "Este enlace ha sido desactivado por la empresa.",
  caducado: "Este enlace ha caducado.",
  "sin-usos": "Este enlace ya ha alcanzado el número máximo de usos.",
};

function RegistroEmpleadoPage() {
  const { token } = Route.useParams();
  const getInvite = useServerFn(getInvitePublic);
  const submit = useServerFn(submitEmployeeRegistration);

  const { data: invite, isLoading } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => getInvite({ data: { token } }),
  });

  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [workPermit, setWorkPermit] = useState<File | null>(null);
  const [lifeguardCert, setLifeguardCert] = useState<File | null>(null);
  const [atsCert, setAtsCert] = useState<File | null>(null);
  const [technicianCert, setTechnicianCert] = useState<File | null>(null);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [cp, setCp] = useState("");

  const [hasSsn, setHasSsn] = useState("si");
  const [ssn, setSsn] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthProvince, setBirthProvince] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [marital, setMarital] = useState("");
  const [education, setEducation] = useState("");
  const [firstJob, setFirstJob] = useState("no");

  const [iban, setIban] = useState("");
  const [holder, setHolder] = useState("");
  const [lgIssued, setLgIssued] = useState("");
  const [lgExpires, setLgExpires] = useState("");
  const [atsIssued, setAtsIssued] = useState("");
  const [atsExpires, setAtsExpires] = useState("");

  const roles = invite?.valid ? invite.roles : [];
  const titulaciones = new Set(roles.map((r) => TITULACION_POR_ROL[r]).filter(Boolean));

  async function upload(file: File | null, folder: string) {
    if (!file) return null;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${token}/${folder}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("employee-docs")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    return path;
  }

  async function send() {
    if (fullName.trim().length < 2) return toast.error("Indica tu nombre y apellidos.");
    if (!nationalId.trim()) return toast.error("Indica tu DNI o NIE.");
    if (!phone.trim()) return toast.error("Indica tu teléfono.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return toast.error("Indica un correo electrónico válido.");
    if (hasSsn === "si" && !ssn.trim()) return toast.error("Indica tu número de la Seguridad Social.");
    if (!iban.trim()) return toast.error("Indica el IBAN para el pago de la nómina.");

    setSaving(true);
    try {
      const [photo_path, id_front_path, id_back_path, work_permit_path, lifeguard_cert_path, ats_cert_path, technician_cert_path] =
        await Promise.all([
          upload(photo, "foto"),
          upload(idFront, "dni-frontal"),
          upload(idBack, "dni-trasero"),
          upload(workPermit, "permiso-trabajo"),
          upload(lifeguardCert, "titulo-socorrista"),
          upload(atsCert, "titulo-ats"),
          upload(technicianCert, "titulo-tecnico"),
        ]);

      await submit({
        data: {
          token,
          photo_path,
          full_name: fullName.trim(),
          birth_date: birthDate || null,
          national_id: nationalId.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim() || null,
          city: city.trim() || null,
          postal_code: cp.trim() || null,
          id_front_path,
          id_back_path,
          work_permit_path,
          has_ssn: hasSsn === "si",
          ssn: hasSsn === "si" ? ssn.trim() : null,
          nationality: nationality.trim() || null,
          birth_place: birthPlace.trim() || null,
          birth_province: birthProvince.trim() || null,
          father_name: fatherName.trim() || null,
          mother_name: motherName.trim() || null,
          marital_status: marital || null,
          education_level: education || null,
          first_job_in_spain: firstJob === "si",
          iban: iban.trim(),
          account_holder: holder.trim() || null,
          lifeguard_cert_path,
          lifeguard_issued_at: lgIssued || null,
          lifeguard_expires_at: lgExpires || null,
          ats_cert_path,
          ats_issued_at: atsIssued || null,
          ats_expires_at: atsExpires || null,
          technician_cert_path,
        },
      });
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se ha podido enviar el registro.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Skeleton className="h-64 rounded-xl" />
      </main>
    );
  }

  if (!invite?.valid) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <Card>
          <CardContent className="space-y-3 p-8 text-center">
            <h1 className="font-display text-xl font-bold">Enlace no disponible</h1>
            <p className="text-sm text-muted-foreground">
              {MOTIVOS[invite?.reason ?? "no-existe"] ?? "Este enlace no es válido."}
            </p>
            <p className="text-sm text-muted-foreground">Pide a la empresa que te envíe uno nuevo.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (done) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <Card>
          <CardContent className="space-y-3 p-8 text-center">
            <CheckCircle2 className="mx-auto size-10 text-primary" />
            <h1 className="font-display text-xl font-bold">Registro enviado</h1>
            <p className="text-sm text-muted-foreground">
              Tu registro está pendiente de aprobación por parte de {invite.companyName || "la empresa"}. Te avisarán
              cuando sea validado.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6 text-center">
        <p className="flex items-center justify-center gap-2 font-display text-lg font-bold">
          <Waves className="size-5 text-primary" /> Dehesapool
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold">Alta de empleado</h1>
        <p className="text-sm text-muted-foreground">
          {invite.companyName ? `${invite.companyName} · ` : ""}
          {[...roles, invite.rolesOther].filter(Boolean).join(", ")}
        </p>
      </header>

      <div className="grid gap-6">
        <div>
          <Label className="mb-2 block text-sm text-muted-foreground">Foto de perfil (opcional)</Label>
          <label className="flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
            {photoPreview ? (
              <img src={photoPreview} alt="Vista previa de la foto" className="h-full w-full object-cover" />
            ) : (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImagePlus className="size-5" /> Añadir foto
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setPhoto(f);
                setPhotoPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
          </label>
        </div>

        <Section title="Datos personales">
          <Field label="Nombre y apellidos *">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} />
          </Field>
          <Field label="Fecha de nacimiento">
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </Field>
          <Field label="DNI / NIE *">
            <Input value={nationalId} onChange={(e) => setNationalId(e.target.value)} maxLength={20} />
          </Field>
          <Field label="Teléfono *">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
          </Field>
          <Field label="Correo electrónico *">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
          </Field>
          <Field label="Dirección">
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Municipio">
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <Field label="Código postal">
              <Input value={cp} onChange={(e) => setCp(e.target.value)} maxLength={10} />
            </Field>
          </div>
        </Section>

        <Section title="Documentación">
          <FileField label="Foto del DNI / NIE (frontal)" onPick={setIdFront} file={idFront} />
          <FileField label="Foto del DNI / NIE (trasera)" onPick={setIdBack} file={idBack} />
          <FileField label="Permiso de trabajo (si aplica)" onPick={setWorkPermit} file={workPermit} />
        </Section>

        <Section title="Seguridad Social">
          <YesNo label="¿Tienes número de la Seguridad Social?" value={hasSsn} onChange={setHasSsn} />
          {hasSsn === "si" ? (
            <Field label="Número de la Seguridad Social *">
              <Input value={ssn} onChange={(e) => setSsn(e.target.value)} maxLength={20} />
            </Field>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Necesitamos estos datos para tramitar tu alta en la Seguridad Social.
              </p>
              <Field label="Nacionalidad">
                <Input value={nationality} onChange={(e) => setNationality(e.target.value)} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Lugar de nacimiento">
                  <Input value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />
                </Field>
                <Field label="Provincia de nacimiento">
                  <Input value={birthProvince} onChange={(e) => setBirthProvince(e.target.value)} />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre del padre">
                  <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
                </Field>
                <Field label="Nombre de la madre">
                  <Input value={motherName} onChange={(e) => setMotherName(e.target.value)} />
                </Field>
              </div>
              <Field label="Estado civil">
                <Select value={marital} onValueChange={setMarital}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADO_CIVIL.map((x) => (
                      <SelectItem key={x} value={x}>
                        {x}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Nivel de estudios">
                <Select value={education} onValueChange={setEducation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVEL_ESTUDIOS.map((x) => (
                      <SelectItem key={x} value={x}>
                        {x}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <YesNo label="¿Es tu primer trabajo en España?" value={firstJob} onChange={setFirstJob} />
            </>
          )}
        </Section>

        <Section title="Datos de pago">
          <Field label="IBAN *">
            <Input value={iban} onChange={(e) => setIban(e.target.value)} maxLength={34} />
          </Field>
          <Field label="Titular de la cuenta">
            <Input value={holder} onChange={(e) => setHolder(e.target.value)} />
          </Field>
        </Section>

        {titulaciones.has("socorrista") && (
          <Section title="Titulación de socorrista">
            <FileField label="Título de socorrista" onPick={setLifeguardCert} file={lifeguardCert} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Fecha de expedición">
                <Input type="date" value={lgIssued} onChange={(e) => setLgIssued(e.target.value)} />
              </Field>
              <Field label="Fecha de caducidad">
                <Input type="date" value={lgExpires} onChange={(e) => setLgExpires(e.target.value)} />
              </Field>
            </div>
          </Section>
        )}

        {titulaciones.has("ats") && (
          <Section title="Titulación sanitaria / ATS">
            <FileField label="Título de ATS o personal sanitario" onPick={setAtsCert} file={atsCert} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Fecha de expedición">
                <Input type="date" value={atsIssued} onChange={(e) => setAtsIssued(e.target.value)} />
              </Field>
              <Field label="Fecha de caducidad">
                <Input type="date" value={atsExpires} onChange={(e) => setAtsExpires(e.target.value)} />
              </Field>
            </div>
          </Section>
        )}

        {titulaciones.has("tecnico") && (
          <Section title="Titulación técnica">
            <FileField label="Certificado o título técnico" onPick={setTechnicianCert} file={technicianCert} />
          </Section>
        )}

        <Button onClick={send} disabled={saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Enviar registro
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Tu registro quedará pendiente de aprobación por parte de la empresa.
        </p>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 rounded-xl border border-border/70 bg-card p-4">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-primary">{title}</h2>
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

function FileField({
  label,
  file,
  onPick,
}: {
  label: string;
  file: File | null;
  onPick: (f: File | null) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
      {file && <span className="text-xs text-muted-foreground">{file.name}</span>}
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
