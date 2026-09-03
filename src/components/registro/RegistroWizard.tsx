import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  CARGOS,
  EMPLEADOS_RANGOS,
  MODULOS_BASE,
  MODULOS_OPCIONALES,
  SERVICIOS,
  SERVICIO_A_MODULO,
} from "@/lib/dehesapool";

type Props = {
  /** "full" = 3 pasos (responsable + empresa + servicios). "company" = sólo empresa y servicios. */
  mode?: "full" | "company";
  onComplete: () => void;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegistroWizard({ mode = "full", onComplete }: Props) {
  const firstStep = mode === "full" ? 1 : 2;
  const [step, setStep] = useState(firstStep);
  const [saving, setSaving] = useState(false);

  // Paso 1
  const [fullName, setFullName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // Paso 2
  const [tradeName, setTradeName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("España");
  const [website, setWebsite] = useState("");
  const [employeesRange, setEmployeesRange] = useState("");

  // Paso 3
  const [services, setServices] = useState<string[]>([]);
  const [servicesOther, setServicesOther] = useState("");
  const [optionalModules, setOptionalModules] = useState<string[]>([]);
  const [confirmAuthorized, setConfirmAuthorized] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const autoModules = useMemo(
    () =>
      Object.entries(SERVICIO_A_MODULO)
        .filter(([servicio]) => services.includes(servicio))
        .map(([, modulo]) => modulo),
    [services],
  );

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  function validateStep1() {
    if (!fullName.trim()) return "Indica tu nombre y apellidos.";
    if (!roleTitle) return "Selecciona tu cargo dentro de la empresa.";
    if (!emailRe.test(email.trim())) return "Introduce un correo electrónico válido.";
    if (!phone.trim()) return "Indica un teléfono de contacto.";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (password !== password2) return "Las contraseñas no coinciden.";
    return null;
  }

  function validateStep2() {
    if (!tradeName.trim()) return "Indica el nombre comercial de la empresa.";
    if (!taxId.trim()) return "Indica el CIF / NIF de la empresa.";
    if (companyEmail && !emailRe.test(companyEmail.trim()))
      return "El email de la empresa no es válido.";
    if (!employeesRange) return "Indica el número aproximado de empleados.";
    return null;
  }

  async function handleSubmit() {
    if (!confirmAuthorized) {
      toast.error("Debes confirmar que estás autorizado.");
      return;
    }
    if (!acceptTerms) {
      toast.error("Debes aceptar los términos y condiciones.");
      return;
    }
    if (!acceptPrivacy) {
      toast.error("Debes aceptar la política de privacidad.");
      return;
    }
    setSaving(true);
    try {
      let userId: string | undefined;

      if (mode === "full") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/panel`,
            data: { full_name: fullName.trim(), role_title: roleTitle, phone: phone.trim() },
          },
        });
        if (error) throw error;
        userId = data.user?.id;
        if (!data.session) {
          const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (signInError) throw signInError;
          userId = signIn.user?.id;
        }
      } else {
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id;
      }

      if (!userId) throw new Error("No se ha podido crear la sesión.");

      const modules = Array.from(new Set([...MODULOS_BASE, ...optionalModules, ...autoModules]));

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          owner_id: userId,
          trade_name: tradeName.trim(),
          legal_name: legalName.trim() || null,
          tax_id: taxId.trim(),
          email: companyEmail.trim() || null,
          phone: companyPhone.trim() || null,
          address: address.trim() || null,
          postal_code: postalCode.trim() || null,
          city: city.trim() || null,
          province: province.trim() || null,
          country,
          website: website.trim() || null,
          employees_range: employeesRange,
          services,
          services_other: servicesOther.trim() || null,
          modules,
          marketing_opt_in: marketing,
        })
        .select("id")
        .single();
      if (companyError) throw companyError;

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        company_id: company.id,
        ...(mode === "full"
          ? {
              full_name: fullName.trim(),
              role_title: roleTitle,
              email: email.trim(),
              phone: phone.trim() || null,
            }
          : {}),
      });

      if (profileError) throw profileError;

      onComplete();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se ha podido crear la cuenta.");
    } finally {
      setSaving(false);
    }
  }

  const totalSteps = mode === "full" ? 3 : 2;
  const shownStep = mode === "full" ? step : step - 1;

  return (
    <div className="space-y-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        Paso {shownStep} de {totalSteps} —{" "}
        {step === 1 ? "Datos del responsable" : step === 2 ? "Datos de la empresa" : "Servicios y configuración"}
      </p>

      {step === 1 && (
        <div className="grid gap-4">
          <Field label="Nombre y apellidos">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} />
          </Field>
          <Field label="Cargo dentro de la empresa">
            <Select value={roleTitle} onValueChange={setRoleTitle}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {CARGOS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Correo electrónico profesional">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
          </Field>
          <Field label="Teléfono">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contraseña">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Field label="Confirmar contraseña">
              <Input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
            </Field>
          </div>
          <Button
            className="mt-2"
            onClick={() => {
              const err = validateStep1();
              if (err) {
                toast.error(err);
                return;
              }
              setStep(2);
            }}
          >
            Continuar
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4">
          <Field label="Nombre comercial de la empresa">
            <Input value={tradeName} onChange={(e) => setTradeName(e.target.value)} maxLength={120} />
          </Field>
          <Field label="Razón social">
            <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} maxLength={120} />
          </Field>
          <Field label="CIF / NIF">
            <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} maxLength={20} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email de la empresa">
              <Input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
            </Field>
            <Field label="Teléfono de la empresa">
              <Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
            </Field>
          </div>
          <Field label="Dirección">
            <Input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Código postal">
              <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} maxLength={10} />
            </Field>
            <Field label="Ciudad">
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <Field label="Provincia">
              <Input value={province} onChange={(e) => setProvince(e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="País">
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["España", "Portugal", "Francia", "Andorra", "Otro"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Página web">
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
            </Field>
          </div>
          <Field label="Número aproximado de empleados">
            <Select value={employeesRange} onValueChange={setEmployeesRange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {EMPLEADOS_RANGOS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="mt-2 flex flex-wrap gap-3">
            {mode === "full" && (
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Volver
              </Button>
            )}
            <Button
              onClick={() => {
                const err = validateStep2();
                if (err) {
                  toast.error(err);
                  return;
                }
                setStep(3);
              }}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-6">
          <section className="grid gap-3">
            <h3 className="font-display text-lg font-semibold">¿Qué servicios ofrece tu empresa?</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {SERVICIOS.map((s) => (
                <CheckRow
                  key={s}
                  label={s}
                  checked={services.includes(s)}
                  onChange={() => toggle(services, setServices, s)}
                />
              ))}
            </div>
            <Field label="Otro">
              <Input
                value={servicesOther}
                onChange={(e) => setServicesOther(e.target.value)}
                placeholder="Especifica otro servicio"
                maxLength={160}
              />
            </Field>
          </section>

          <section className="grid gap-3">
            <h3 className="font-display text-lg font-semibold">¿Qué quieres gestionar desde la plataforma?</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {MODULOS_BASE.map((m) => (
                <CheckRow key={m} label={m} checked disabled onChange={() => {}} />
              ))}
              {MODULOS_OPCIONALES.map((m) => (
                <CheckRow
                  key={m}
                  label={m}
                  checked={optionalModules.includes(m) || autoModules.includes(m)}
                  disabled={autoModules.includes(m)}
                  onChange={() => toggle(optionalModules, setOptionalModules, m)}
                />
              ))}
            </div>
            <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              Los módulos de socorrismo, personal sanitario y control de accesos se activarán automáticamente si has
              indicado que tu empresa ofrece esos servicios. Podrás cambiar esta configuración más adelante.
            </p>
          </section>

          <section className="grid gap-2">
            <h3 className="font-display text-lg font-semibold">Aceptaciones</h3>
            <CheckRow
              label="Confirmo que soy propietario, gerente o una persona autorizada para crear y administrar la cuenta de esta empresa."
              checked={confirmAuthorized}
              onChange={() => setConfirmAuthorized(!confirmAuthorized)}
            />
            <CheckRow
              label="Acepto los términos y condiciones de uso."
              checked={acceptTerms}
              onChange={() => setAcceptTerms(!acceptTerms)}
            />
            <CheckRow
              label="He leído y acepto la política de privacidad."
              checked={acceptPrivacy}
              onChange={() => setAcceptPrivacy(!acceptPrivacy)}
            />
            <CheckRow
              label="Quiero recibir novedades, consejos y comunicaciones comerciales por email. Opcional."
              checked={marketing}
              onChange={() => setMarketing(!marketing)}
            />
          </section>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setStep(2)} disabled={saving}>
              ← Volver
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Crear cuenta de empresa
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border/60 bg-card p-2.5 text-sm">
      <Checkbox checked={checked} disabled={disabled} onCheckedChange={onChange} className="mt-0.5" />
      <span className={disabled ? "text-muted-foreground" : ""}>{label}</span>
    </label>
  );
}
