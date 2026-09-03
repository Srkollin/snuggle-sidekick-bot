import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/hooks/useEmpresa";

export const Route = createFileRoute("/_authenticated/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración | Dehesapool" },
      {
        name: "description",
        content: "Actualiza tus datos de responsable y la información básica de tu empresa de piscinas.",
      },
      { property: "og:title", content: "Configuración | Dehesapool" },
      { property: "og:description", content: "Ajustes de perfil y empresa en Dehesapool." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  const { user } = Route.useRouteContext();
  const { data, isLoading } = useEmpresa();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [phone, setPhone] = useState("");

  const profile = data?.profile as { full_name?: string; role_title?: string; phone?: string } | null | undefined;

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setRoleTitle(profile.role_title ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  async function save() {
    if (fullName.trim().length < 2) { toast.error("Indica tu nombre y apellidos."); return; }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), role_title: roleTitle.trim() || null, phone: phone.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Datos actualizados.");
    queryClient.invalidateQueries({ queryKey: ["empresa"] });
  }

  return (
    <AppShell>
      <h2 className="mb-6 font-display text-2xl font-bold">Configuración</h2>
      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="grid gap-4 p-6">
              <h3 className="font-display font-semibold">Tu perfil</h3>
              <div className="grid gap-1.5">
                <Label className="text-sm text-muted-foreground">Nombre y apellidos</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-sm text-muted-foreground">Cargo</Label>
                <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} maxLength={80} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-sm text-muted-foreground">Teléfono</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-sm text-muted-foreground">Correo de acceso</Label>
                <Input value={user.email ?? ""} readOnly disabled />
              </div>
              <Button onClick={save} disabled={saving} className="justify-self-start">
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                Guardar cambios
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-2 p-6 text-sm">
              <h3 className="font-display font-semibold">Tu empresa</h3>
              <Row label="Nombre comercial" value={data?.empresa?.trade_name} />
              <Row label="Razón social" value={data?.empresa?.legal_name} />
              <Row label="CIF / NIF" value={data?.empresa?.tax_id} />
              <Row label="Ciudad" value={data?.empresa?.city} />
              <Row label="Provincia" value={data?.empresa?.province} />
              <Row label="Empleados" value={data?.empresa?.employees_range} />
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={value ? "text-right font-medium" : "text-right italic text-muted-foreground"}>
        {value || "Sin rellenar"}
      </span>
    </div>
  );
}
