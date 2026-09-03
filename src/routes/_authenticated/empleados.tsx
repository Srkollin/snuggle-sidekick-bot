import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Copy, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { InvitarEmpleado } from "@/components/empleados/InvitarEmpleado";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/hooks/useEmpresa";
import { ESTADOS_EMPLEADO, ESTADO_EMPLEADO_LABEL } from "@/lib/dehesapool";

export const Route = createFileRoute("/_authenticated/empleados")({
  head: () => ({
    meta: [
      { title: "Empleados | Dehesapool" },
      {
        name: "description",
        content: "Invita a tu equipo con un enlace de registro, aprueba altas y controla el estado de cada empleado.",
      },
      { property: "og:title", content: "Empleados | Dehesapool" },
      { property: "og:description", content: "Gestiona el equipo de tu empresa de piscinas en Dehesapool." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmpleadosPage,
});

type Employee = {
  id: string;
  full_name: string;
  roles: string[];
  roles_other: string | null;
  phone: string | null;
  email: string | null;
  national_id: string | null;
  city: string | null;
  has_ssn: boolean;
  ssn: string | null;
  pending_ssn: boolean;
  approval_status: string;
  work_status: string;
  iban: string | null;
  nationality: string | null;
};

type Invite = {
  id: string;
  token: string;
  roles: string[];
  max_uses: number | null;
  used_count: number;
  expires_at: string;
  is_active: boolean;
};

function EmpleadosPage() {
  const { user } = Route.useRouteContext();
  const { data: empresaData, isLoading: loadingEmpresa } = useEmpresa();
  const queryClient = useQueryClient();
  const companyId = empresaData?.empresa?.id;
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Employee[];
    },
  });

  const { data: invites } = useQuery({
    queryKey: ["employee_invites", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_invites")
        .select("id, token, roles, max_uses, used_count, expires_at, is_active")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Invite[];
    },
  });

  async function updateEmployee(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from("employees").update(patch as never).eq("id", id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["employees", companyId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", companyId] });
    setSelected(null);
  }

  const pendientes = employees?.filter((e) => e.approval_status === "pendiente") ?? [];
  const aprobados = employees?.filter((e) => e.approval_status === "aprobado") ?? [];

  if (!loadingEmpresa && !companyId) {
    return (
      <AppShell>
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <h2 className="font-display text-xl font-bold">Completa el registro de tu empresa</h2>
            <Button asChild>
              <Link to="/panel">Ir al panel</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Empleados</h2>
          <p className="text-sm text-muted-foreground">
            Invita a tu equipo, aprueba altas y controla su estado laboral.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} disabled={!companyId}>
          <UserPlus className="mr-2 size-4" /> Invitar empleado
        </Button>
      </div>

      {isLoading || loadingEmpresa ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : (
        <div className="grid gap-8">
          <section>
            <h3 className="mb-3 font-display font-semibold">Pendientes de aprobación ({pendientes.length})</h3>
            {!pendientes.length ? (
              <p className="text-sm text-muted-foreground">No hay registros pendientes.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pendientes.map((e) => (
                  <EmpleadoCard key={e.id} e={e} onClick={() => setSelected(e)} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 font-display font-semibold">Plantilla ({aprobados.length})</h3>
            {!aprobados.length ? (
              <p className="text-sm text-muted-foreground">Todavía no hay empleados aprobados.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {aprobados.map((e) => (
                  <EmpleadoCard key={e.id} e={e} onClick={() => setSelected(e)} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 font-display font-semibold">Enlaces de invitación</h3>
            {!invites?.length ? (
              <p className="text-sm text-muted-foreground">Todavía no has generado enlaces.</p>
            ) : (
              <div className="grid gap-2">
                {invites.map((i) => {
                  const caducado = new Date(i.expires_at).getTime() < Date.now();
                  const agotado = i.max_uses !== null && i.used_count >= i.max_uses;
                  return (
                    <div
                      key={i.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{i.roles.join(", ") || "Sin cargo asignado"}</p>
                        <p className="text-xs text-muted-foreground">
                          {i.used_count}/{i.max_uses ?? "∞"} usos · caduca el{" "}
                          {new Date(i.expires_at).toLocaleDateString("es-ES")}
                          {caducado ? " · caducado" : agotado ? " · sin usos" : ""}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/registro/${i.token}`);
                          toast.success("Enlace copiado.");
                        }}
                      >
                        <Copy className="mr-1 size-3.5" /> Copiar
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Invitar empleado</DialogTitle>
          </DialogHeader>
          {companyId && (
            <InvitarEmpleado
              companyId={companyId}
              userId={user.id}
              onCreated={() => queryClient.invalidateQueries({ queryKey: ["employee_invites", companyId] })}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{selected?.full_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid gap-3 text-sm">
              <Row label="Cargos" value={[...selected.roles, selected.roles_other].filter(Boolean).join(", ")} />
              <Row label="DNI / NIE" value={selected.national_id} />
              <Row label="Teléfono" value={selected.phone} />
              <Row label="Correo" value={selected.email} />
              <Row label="Ciudad" value={selected.city} />
              <Row label="Nacionalidad" value={selected.nationality} />
              <Row label="Nº Seguridad Social" value={selected.has_ssn ? selected.ssn : "Pendiente de alta"} />
              <Row label="IBAN" value={selected.iban} />

              <div className="grid gap-1.5">
                <span className="text-muted-foreground">Estado laboral</span>
                <Select
                  value={selected.work_status}
                  onValueChange={(v) => updateEmployee(selected.id, { work_status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_EMPLEADO.map((s) => (
                      <SelectItem key={s} value={s}>
                        {ESTADO_EMPLEADO_LABEL[s] ?? s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selected.approval_status === "pendiente" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => updateEmployee(selected.id, { approval_status: "aprobado" })}
                  >
                    <Check className="mr-1 size-4" /> Aprobar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateEmployee(selected.id, { approval_status: "rechazado" })}
                  >
                    <X className="mr-1 size-4" /> Rechazar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function EmpleadoCard({ e, onClick }: { e: Employee; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-lg"
    >
      <h4 className="truncate font-display font-semibold">{e.full_name}</h4>
      <p className="truncate text-xs text-muted-foreground">
        {[...e.roles, e.roles_other].filter(Boolean).join(", ") || "Sin cargo"}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full border border-border bg-muted px-2 py-0.5">
          {ESTADO_EMPLEADO_LABEL[e.work_status] ?? e.work_status}
        </span>
        {e.pending_ssn && (
          <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-destructive">
            Sin nº SS
          </span>
        )}
      </div>
    </button>
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
