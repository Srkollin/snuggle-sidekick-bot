import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string().trim().min(8).max(64) });

type InviteRow = {
  id: string;
  company_id: string;
  roles: string[];
  roles_other: string | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string;
  is_active: boolean;
};

async function loadInvite(token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("employee_invites")
    .select("id, company_id, roles, roles_other, max_uses, used_count, expires_at, is_active")
    .eq("token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const invite = data as unknown as InviteRow | null;
  if (!invite) return { invite: null as InviteRow | null, reason: "no-existe" as const };
  if (!invite.is_active) return { invite, reason: "inactivo" as const };
  if (new Date(invite.expires_at).getTime() < Date.now()) return { invite, reason: "caducado" as const };
  if (invite.max_uses !== null && invite.used_count >= invite.max_uses)
    return { invite, reason: "sin-usos" as const };
  return { invite, reason: null };
}

export const getInvitePublic = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { invite, reason } = await loadInvite(data.token);
    if (!invite || reason) return { valid: false as const, reason: reason ?? "no-existe" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("trade_name")
      .eq("id", invite.company_id)
      .maybeSingle();

    return {
      valid: true as const,
      roles: invite.roles ?? [],
      rolesOther: invite.roles_other,
      companyName: (company as { trade_name?: string } | null)?.trade_name ?? "",
      remaining: invite.max_uses === null ? null : invite.max_uses - invite.used_count,
    };
  });

const employeeSchema = z.object({
  token: z.string().trim().min(8).max(64),
  photo_path: z.string().max(300).nullable().optional(),
  full_name: z.string().trim().min(2).max(120),
  birth_date: z.string().max(20).nullable().optional(),
  national_id: z.string().trim().max(40).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  email: z.string().trim().email().max(255).nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  postal_code: z.string().trim().max(10).nullable().optional(),
  id_front_path: z.string().max(300).nullable().optional(),
  id_back_path: z.string().max(300).nullable().optional(),
  work_permit_path: z.string().max(300).nullable().optional(),
  has_ssn: z.boolean(),
  ssn: z.string().trim().max(40).nullable().optional(),
  nationality: z.string().trim().max(80).nullable().optional(),
  birth_place: z.string().trim().max(100).nullable().optional(),
  birth_province: z.string().trim().max(100).nullable().optional(),
  father_name: z.string().trim().max(120).nullable().optional(),
  mother_name: z.string().trim().max(120).nullable().optional(),
  marital_status: z.string().trim().max(40).nullable().optional(),
  education_level: z.string().trim().max(40).nullable().optional(),
  first_job_in_spain: z.boolean().nullable().optional(),
  iban: z.string().trim().max(40).nullable().optional(),
  account_holder: z.string().trim().max(120).nullable().optional(),
  lifeguard_cert_path: z.string().max(300).nullable().optional(),
  lifeguard_issued_at: z.string().max(20).nullable().optional(),
  lifeguard_expires_at: z.string().max(20).nullable().optional(),
  ats_cert_path: z.string().max(300).nullable().optional(),
  ats_issued_at: z.string().max(20).nullable().optional(),
  ats_expires_at: z.string().max(20).nullable().optional(),
  technician_cert_path: z.string().max(300).nullable().optional(),
});

export const submitEmployeeRegistration = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => employeeSchema.parse(data))
  .handler(async ({ data }) => {
    const { token, ...payload } = data;
    const { invite, reason } = await loadInvite(token);
    if (!invite || reason) throw new Error("Enlace caducado o sin usos disponibles.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const clean = Object.fromEntries(
      Object.entries(payload).map(([k, v]) => [k, v === "" ? null : v]),
    );

    const { error } = await supabaseAdmin.from("employees").insert({
      ...clean,
      company_id: invite.company_id,
      invite_id: invite.id,
      roles: invite.roles ?? [],
      roles_other: invite.roles_other,
      approval_status: "pendiente",
      pending_ssn: !payload.has_ssn,
      work_status: "fuera_de_turno",
    } as never);
    if (error) throw new Error(error.message);

    const { error: upErr } = await supabaseAdmin
      .from("employee_invites")
      .update({ used_count: invite.used_count + 1 } as never)
      .eq("id", invite.id);
    if (upErr) throw new Error(upErr.message);

    return { ok: true as const };
  });
