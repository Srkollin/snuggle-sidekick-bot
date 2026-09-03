import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ClipboardList, Users, Waves, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MODULOS_BASE, MODULOS_OPCIONALES, JERARQUIA } from "@/lib/dehesapool";
import heroPiscina from "@/assets/hero-piscina.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dehesapool | Gestión para empresas de piscinas" },
      {
        name: "description",
        content:
          "Dehesapool organiza empresas de piscinas: equipo, piscinas, mantenimiento, personal y almacén en una sola plataforma B2B.",
      },
      { property: "og:title", content: "Dehesapool | Gestión para empresas de piscinas" },
      {
        property: "og:description",
        content: "Registra tu empresa de piscinas y organiza equipo, piscinas y operaciones en un único panel.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-display text-lg font-bold tracking-tight">
            Dehesa<span className="text-primary">pool</span>
          </span>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Regístrate</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Plataforma B2B</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
              Organiza tu empresa de piscinas y escala con orden
            </h1>
            <p className="mt-4 text-muted-foreground">
              Dehesapool reúne el registro de tu empresa, la jerarquía del equipo, las piscinas que gestionas y
              sus operaciones diarias en un único panel pensado para el sector.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  Regístrate <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#planes">Ver planes</a>
              </Button>
            </div>
          </div>
          <img
            src={heroPiscina}
            alt="Vista cenital de una piscina comunitaria gestionada por una empresa de mantenimiento"
            width={1600}
            height={1100}
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl"
          />
        </section>

        <section className="border-y border-border/60 bg-muted/40 py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-2xl font-bold">La solución</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Cada empresa registra su estructura y activa solo los módulos que necesita según los servicios que
              presta.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Feature
                icon={<Waves className="size-5 text-primary" />}
                title="Piscinas centralizadas"
                text="Alta de piscinas con foto, dirección, tratamiento del agua, piscina infantil y personal asignado."
              />
              <Feature
                icon={<Users className="size-5 text-primary" />}
                title="Jerarquía definida"
                text="Dirección, operaciones técnicas, logística y personal de piscina con sus roles del sector."
              />
              <Feature
                icon={<Wrench className="size-5 text-primary" />}
                title="Módulos según servicios"
                text="Los módulos opcionales se activan automáticamente según los servicios que marcas al registrarte."
              />
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <ModuleList title="Módulos base" items={MODULOS_BASE} />
              <ModuleList title="Módulos opcionales" items={MODULOS_OPCIONALES} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-2xl font-bold">Estructura de tu empresa en la plataforma</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {JERARQUIA.map((area) => (
              <Card key={area.area}>
                <CardContent className="p-5">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-primary">
                    {area.area}
                  </h3>
                  <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
                    {area.roles.map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="planes" className="border-t border-border/60 bg-muted/40 py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-2xl font-bold">Planes</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Los planes se ajustan al tamaño de la empresa. El precio se confirma tras el registro.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Plan
                name="Autónomo"
                target="Solo trabajo yo"
                features={["Módulos base", "Piscinas ilimitadas", "1 usuario"]}
              />
              <Plan
                name="Equipo"
                target="De 2 a 10 empleados"
                features={["Módulos base y opcionales", "Roles por área", "Gestión de personal de piscina"]}
                highlight
              />
              <Plan
                name="Empresa"
                target="Más de 10 empleados"
                features={["Todos los módulos", "Logística y almacén", "Soporte prioritario"]}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground">
          Dehesapool — plataforma de gestión para empresas de piscinas.
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        {icon}
        <h3 className="font-display font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

function ModuleList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="flex items-center gap-2 font-display font-semibold">
          <ClipboardList className="size-4 text-primary" /> {title}
        </h3>
        <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
          {items.map((m) => (
            <li key={m} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> {m}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function Plan({
  name,
  target,
  features,
  highlight,
}: {
  name: string;
  target: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary shadow-lg" : undefined}>
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className="font-display text-xl font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground">{target}</p>
        </div>
        <p className="font-display text-lg font-semibold text-primary">Precio a consultar</p>
        <ul className="grid gap-1.5 text-sm text-muted-foreground">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> {f}
            </li>
          ))}
        </ul>
        <Button asChild className="w-full" variant={highlight ? "default" : "outline"}>
          <Link to="/auth">Regístrate</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
