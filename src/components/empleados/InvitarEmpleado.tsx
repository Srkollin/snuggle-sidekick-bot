import { useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { JERARQUIA } from "@/lib/dehesapool";

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function InvitarEmpleado({
  companyId,
  userId,
  onCreated,
}: {
  companyId: string;
  userId: string;
  onCreated: () => void;
}) {
  const [roles, setRoles] = useState<string[]>([]);
  const [rolesOther, setRolesOther] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [days, setDays] = useState(7);
  const [saving, setSaving] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  function toggle(role: string) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  async function create() {
    if (!roles.length && !rolesOther.trim()) {
      toast.error("Selecciona al menos un cargo para la invitación.");
      return;
    }
    if (maxUses < 1 || maxUses > 100) {
      toast.error("El número de usos debe estar entre 1 y 100.");
      return;
    }
    if (days < 1 || days > 90) {
      toast.error("La caducidad debe estar entre 1 y 90 días.");
      return;
    }
    setSaving(true);
    try {
      const token = newToken();
      const expires = new Date(Date.now() + days * 86_400_000).toISOString();
      const { error } = await supabase.from("employee_invites").insert({
        company_id: companyId,
        created_by: userId,
        token,
        roles,
        roles_other: rolesOther.trim() || null,
        max_uses: maxUses,
        expires_at: expires,
      } as never);
      if (error) throw error;
      setLink(`${window.location.origin}/registro/${token}`);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se ha podido crear la invitación.");
    } finally {
      setSaving(false);
    }
  }

  if (link) {
    return (
      <div className="grid gap-3">
        <p className="text-sm text-muted-foreground">
          Comparte este enlace con el empleado. Al completarlo, su registro quedará pendiente de tu aprobación.
        </p>
        <div className="flex gap-2">
          <Input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast.success("Enlace copiado.");
            }}
          >
            <Copy className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3">
        <Label className="text-sm text-muted-foreground">Cargo o cargos que tendrá el empleado</Label>
        {JERARQUIA.map((area) => (
          <div key={area.area} className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{area.area}</p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {area.roles.map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={roles.includes(r)} onCheckedChange={() => toggle(r)} /> {r}
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="grid gap-1.5">
          <Label className="text-sm text-muted-foreground">Otro cargo (opcional)</Label>
          <Input value={rolesOther} onChange={(e) => setRolesOther(e.target.value)} maxLength={100} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label className="text-sm text-muted-foreground">Usos permitidos</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value) || 1)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-sm text-muted-foreground">Caduca en (días)</Label>
          <Input type="number" min={1} max={90} value={days} onChange={(e) => setDays(Number(e.target.value) || 1)} />
        </div>
      </div>

      <Button onClick={create} disabled={saving}>
        {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
        Generar enlace de registro
      </Button>
    </div>
  );
}
