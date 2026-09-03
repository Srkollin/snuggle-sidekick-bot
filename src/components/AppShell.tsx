import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Receipt,
  Route as RouteIcon,
  Settings,
  Users,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/hooks/useEmpresa";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/panel", label: "Dashboard", icon: LayoutDashboard },
  { to: "/piscinas", label: "Piscinas", icon: Waves },
  { to: "/empleados", label: "Empleados", icon: Users },
  { to: "/rutas", label: "Rutas", icon: RouteIcon },
  { to: "/clientes", label: "Clientes", icon: Building2 },
  { to: "/facturacion", label: "Facturación", icon: Receipt },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useEmpresa();

  const empresaNombre = data?.empresa?.trade_name ?? "Tu empresa";
  const iniciales = (data?.profile?.full_name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((p: string) => p.charAt(0).toUpperCase())
    .join("");

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background md:flex">
        <Link to="/panel" className="flex items-center gap-2 border-b border-border px-5 py-4 font-display text-lg font-bold">
          <Waves className="size-5 text-primary" /> Dehesapool
        </Link>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                pathname === item.to && "bg-primary/10 text-primary",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            to="/configuracion"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              pathname === "/configuracion" && "bg-primary/10 text-primary",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
              {iniciales}
            </span>
            <span className="flex items-center gap-2">
              <Settings className="size-4" /> Configuración
            </span>
          </Link>
          <Button variant="ghost" size="sm" className="mt-1 w-full justify-start" onClick={signOut}>
            <LogOut className="mr-2 size-4" /> Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Panel de administración</p>
          <h1 className="font-display text-lg font-bold">{empresaNombre}</h1>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-background/95 backdrop-blur md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground",
              pathname === item.to && "text-primary",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
