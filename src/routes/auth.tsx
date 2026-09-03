import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Waves } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegistroWizard } from "@/components/registro/RegistroWizard";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Crea la cuenta de tu empresa | Dehesapool" },
      {
        name: "description",
        content:
          "Registra tu empresa de piscinas en Dehesapool y gestiona clientes, instalaciones, mantenimientos, técnicos y facturación desde un único lugar.",
      },
      { property: "og:title", content: "Crea la cuenta de tu empresa | Dehesapool" },
      {
        property: "og:description",
        content: "Alta de empresas de piscinas en la plataforma B2B Dehesapool.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  if (done) return <Confirmacion onGo={() => navigate({ to: "/panel" })} />;

  return (
    <main className="min-h-screen bg-gradient-to-b from-secondary/60 to-background px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 font-display text-lg font-bold">
          <Waves className="size-5 text-primary" />
          <span>
            <span className="text-primary">Dehesa</span>
            <span className="text-foreground">pool</span>
          </span>
        </Link>

        <Tabs defaultValue="registro">
          <TabsList className="mb-6">
            <TabsTrigger value="registro">Registrarme</TabsTrigger>
            <TabsTrigger value="acceso">Ya tengo cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="registro">
            <Card>
              <CardContent className="space-y-6 p-6 sm:p-8">
                <header className="space-y-2">
                  <h1 className="font-display text-2xl font-bold sm:text-3xl">Crea la cuenta de tu empresa</h1>
                  <p className="text-sm text-muted-foreground">
                    Registra tu empresa de piscinas y empieza a gestionar clientes, instalaciones, mantenimientos,
                    técnicos, socorristas, turnos, incidencias y facturación desde un único lugar.
                  </p>
                  <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    Este registro está dirigido exclusivamente a propietarios, gerentes o responsables autorizados de
                    empresas de piscinas. Una vez creada la cuenta, podrás invitar a tu equipo desde el panel de
                    administración.
                  </p>
                </header>

                <GoogleButton label="Registrarme con Google" />
                <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> o con email <span className="h-px flex-1 bg-border" />
                </div>

                <RegistroWizard onComplete={() => setDone(true)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acceso">
            <LoginCard />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function GoogleButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin,
        });
        if (result.error) {
          setLoading(false);
          toast.error("No se ha podido iniciar sesión con Google.");
          return;
        }
        if (result.redirected) return;
        window.location.href = "/panel";
      }}
    >
      {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}

function LoginCard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Card>
      <CardContent className="space-y-4 p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold">Accede a tu cuenta</h2>
        <GoogleButton label="Entrar con Google" />
        <div className="grid gap-1.5">
          <Label>Correo electrónico</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label>Contraseña</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button
          className="w-full"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            setLoading(false);
            if (error) {
              toast.error("Email o contraseña incorrectos.");
              return;
            }
            navigate({ to: "/panel" });
          }}
        >
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Entrar
        </Button>
      </CardContent>
    </Card>
  );
}

function Confirmacion({ onGo }: { onGo: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary/60 to-background px-4 py-12">
      <Card className="max-w-xl">
        <CardContent className="space-y-5 p-8">
          <CheckCircle2 className="size-10 text-primary" />
          <h1 className="font-display text-2xl font-bold">¡Tu cuenta de empresa ha sido creada correctamente!</h1>
          <p className="text-sm text-muted-foreground">
            Ya puedes acceder al panel de administración. Desde ahí podrás:
          </p>
          <ul className="grid gap-1.5 text-sm text-muted-foreground">
            {[
              "Completar el perfil de empresa.",
              "Crear clientes e instalaciones.",
              "Añadir piscinas y equipos.",
              "Invitar a técnicos, personal de oficina, supervisores y comerciales.",
              "Crear turnos para socorristas, personal sanitario y porteros.",
              "Configurar servicios, tarifas, facturación e inventario.",
              "Crear órdenes de trabajo y planificar mantenimientos.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-primary">•</span> {t}
              </li>
            ))}
          </ul>
          <Button onClick={onGo}>Acceder al panel de administración</Button>
        </CardContent>
      </Card>
    </main>
  );
}
