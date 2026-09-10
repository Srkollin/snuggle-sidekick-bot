import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  ClipboardCheck,
  MapPinned,
  ShieldCheck,
  Users,
  Waves,
} from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import heroPiscina from "@/assets/hero-piscina.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dehesapool | Software para empresas de piscinas" },
      {
        name: "description",
        content:
          "Gestiona piscinas, clientes, personal, libro sanitario, avisos e incidencias desde una plataforma creada para empresas del sector.",
      },
      { property: "og:title", content: "Dehesapool | Software para empresas de piscinas" },
      {
        property: "og:description",
        content: "Centraliza la operativa diaria de tu empresa de piscinas, desde el equipo hasta el control sanitario.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

const capabilities = [
  {
    icon: Waves,
    title: "Piscinas y clientes",
    text: "Cada instalación conserva su ficha, cliente, temporada, horarios, personal asignado y observaciones.",
  },
  {
    icon: BookOpenCheck,
    title: "Libro sanitario por piscina",
    text: "Registra controles de cada vaso, consulta el histórico y exporta la documentación de una instalación.",
  },
  {
    icon: BellRing,
    title: "Avisos e incidencias",
    text: "Detecta mediciones fuera de rango, genera un aviso y deja constancia del técnico que lo atiende.",
  },
  {
    icon: Users,
    title: "Equipo y turnos",
    text: "Organiza categorías, asigna empleados a piscinas y consulta quién está en turno en cada ubicación.",
  },
] as const;

const baseModules = [
  "Clientes e instalaciones",
  "Agenda y órdenes de trabajo",
  "Técnicos y partes de mantenimiento",
  "Incidencias y reparaciones",
  "Presupuestos y contratos",
  "Facturación y cobros",
  "Inventario y productos químicos",
] as const;

const optionalModules = [
  "Gestión de socorristas y turnos",
  "Personal sanitario / ATS",
  "Portería y control de accesos",
  "Portal del cliente",
  "Rutas y geolocalización",
  "Informes avanzados",
] as const;

const plans = [
  {
    name: "Autónomo",
    audience: "Para profesionales que trabajan solos",
    team: "1 usuario",
    description: "La operativa esencial para organizar clientes, piscinas y trabajos sin depender de hojas sueltas.",
    features: [
      "Clientes e instalaciones",
      "Piscinas sin límite indicado",
      "Agenda y órdenes de trabajo",
      "Libro sanitario y registros",
      "Avisos e incidencias",
    ],
    note: "Incluye los módulos base",
  },
  {
    name: "Equipo",
    audience: "Para empresas de 2 a 10 empleados",
    team: "Hasta 10 empleados",
    description: "Coordina la actividad diaria del equipo y activa las áreas específicas que necesite tu servicio.",
    features: [
      "Todo lo incluido en Autónomo",
      "Roles y categorías por empleado",
      "Asignación de personal por piscina",
      "Control de turnos y actuaciones",
      "Módulos opcionales según servicios",
    ],
    note: "La opción más equilibrada",
    featured: true,
  },
  {
    name: "Empresa",
    audience: "Para organizaciones de más de 10 empleados",
    team: "Equipo amplio",
    description: "Una configuración completa para operaciones con más personal, áreas y necesidades de seguimiento.",
    features: [
      "Todo lo incluido en Equipo",
      "Todos los módulos disponibles",
      "Logística y almacén",
      "Rutas e informes avanzados",
      "Soporte prioritario",
    ],
    note: "Configuración completa",
  },
] as const;

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-background/15 bg-foreground/75 text-background backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-display text-xl font-bold" aria-label="Dehesapool, inicio">
            Dehesa<span className="text-primary">pool</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Navegación principal">
            <a className="transition-colors hover:text-primary" href="#plataforma">Plataforma</a>
            <a className="transition-colors hover:text-primary" href="#funcionamiento">Cómo funciona</a>
            <a className="transition-colors hover:text-primary" href="#planes">Planes</a>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="text-background hover:bg-background/10 hover:text-background">
              <Link to="/auth">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-[88svh] items-end overflow-hidden pb-16 pt-28 sm:pb-20 lg:min-h-[92svh] lg:pb-24">
          <img
            src={heroPiscina}
            alt="Piscina comunitaria vista desde arriba"
            width={1600}
            height={1100}
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/35 to-transparent" />
          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase text-primary">
                <span className="h-px w-8 bg-primary" /> Gestión profesional para el sector de piscinas
              </p>
              <h1 className="font-display text-5xl font-bold leading-[1.05] text-background sm:text-6xl lg:text-7xl">
                Dehesapool
              </h1>
              <p className="mt-5 max-w-3xl font-display text-2xl font-semibold leading-tight text-background sm:text-3xl lg:text-4xl">
                Toda tu empresa de piscinas, coordinada desde un único lugar.
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-background/80 sm:text-lg">
                Organiza instalaciones, clientes, equipo, turnos, controles sanitarios e incidencias con una plataforma creada para el trabajo diario del sector.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/auth">Crear mi cuenta <ArrowRight className="size-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-background/35 bg-background/10 text-background hover:bg-background/20 hover:text-background">
                  <a href="#planes">Comparar planes</a>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-background/75">
                {[
                  "Una ficha por piscina",
                  "Registros sanitarios guardados",
                  "Acceso por roles",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="plataforma" className="border-b border-border bg-background py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div>
                <p className="text-sm font-semibold uppercase text-primary">Una plataforma, toda la operación</p>
                <h2 className="mt-3 max-w-xl font-display text-3xl font-bold sm:text-4xl">
                  La información deja de estar repartida entre papeles, mensajes y hojas de cálculo.
                </h2>
                <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
                  Dehesapool conecta cada piscina con su cliente, sus trabajadores, sus controles y las incidencias que requieren seguimiento.
                </p>
              </div>
              <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
                {capabilities.map(({ icon: Icon, title, text }) => (
                  <article key={title} className="bg-card p-6 sm:p-7">
                    <Icon className="size-6 text-primary" aria-hidden="true" />
                    <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="funcionamiento" className="bg-muted/40 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase text-primary">Del alta al seguimiento diario</p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Un flujo sencillo para una operación compleja</h2>
            </div>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              <Step number="01" icon={BriefcaseBusiness} title="Configura tu empresa" text="Indica el tamaño del equipo y los servicios que prestas. La plataforma adapta los módulos a tu actividad." />
              <Step number="02" icon={MapPinned} title="Centraliza instalaciones" text="Crea cada piscina con cliente, temporada, horario, tratamiento, personal y observaciones propias." />
              <Step number="03" icon={ClipboardCheck} title="Controla y actúa" text="Guarda mediciones, recibe avisos sanitarios, asigna técnicos y conserva el historial de cada actuación." />
            </ol>
          </div>
        </section>

        <section className="border-y border-border bg-foreground py-20 text-background sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <ModuleColumn eyebrow="Incluido desde el inicio" title="Módulos base" items={baseModules} />
            <ModuleColumn eyebrow="Actívalos según tus servicios" title="Módulos opcionales" items={optionalModules} />
          </div>
        </section>

        <section id="planes" className="bg-background py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase text-primary">Planes transparentes</p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Elige según el tamaño y la operativa de tu equipo</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Todos los planes parten de la gestión diaria de piscinas. El alcance crece con las personas, los roles y los módulos especializados que necesites.
              </p>
            </div>

            <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
              {plans.map((plan) => <Plan key={plan.name} {...plan} />)}
            </div>

            <div className="mt-8 flex flex-col gap-4 border-y border-border py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p><strong className="text-foreground">¿Por qué el precio es a consultar?</strong> Se ajusta al tamaño del equipo y a los módulos que necesita cada empresa.</p>
              <Button asChild variant="outline" className="shrink-0">
                <Link to="/auth">Solicitar acceso <ChevronRight className="size-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-primary py-16 text-primary-foreground sm:py-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div className="max-w-3xl">
              <ShieldCheck className="size-8" aria-hidden="true" />
              <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">Pon orden en la gestión antes de que empiece la próxima jornada.</h2>
              <p className="mt-4 max-w-2xl text-primary-foreground/80">Registra tu empresa y reúne piscinas, equipo y controles en un espacio común.</p>
            </div>
            <Button asChild size="lg" variant="secondary" className="shrink-0">
              <Link to="/auth">Empezar con Dehesapool <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="font-display text-lg font-bold text-foreground">Dehesa<span className="text-primary">pool</span></p>
            <p className="mt-1">Gestión para empresas y profesionales de piscinas.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#plataforma" className="hover:text-foreground">Plataforma</a>
            <a href="#funcionamiento" className="hover:text-foreground">Cómo funciona</a>
            <a href="#planes" className="hover:text-foreground">Planes</a>
            <Link to="/auth" className="hover:text-foreground">Acceso</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({ number, icon: Icon, title, text }: { number: string; icon: React.ElementType; title: string; text: string }) {
  return (
    <li className="border-t-2 border-primary pt-6">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-bold text-primary">{number}</span>
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mt-8 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </li>
  );
}

function ModuleColumn({ eyebrow, title, items }: { eyebrow: string; title: string; items: readonly string[] }) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-bold">{title}</h2>
      <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 border-b border-background/10 pb-3 text-sm text-background/80">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Plan({
  name,
  audience,
  team,
  description,
  features,
  note,
  featured,
}: {
  name: string;
  audience: string;
  team: string;
  description: string;
  features: readonly string[];
  note: string;
  featured?: boolean;
}) {
  return (
    <article className={`relative flex h-full flex-col rounded-lg border bg-card p-6 shadow-sm sm:p-7 ${featured ? "border-primary ring-1 ring-primary" : "border-border"}`}>
      {featured && <span className="absolute right-5 top-0 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Recomendado</span>}
      <p className="text-xs font-semibold uppercase text-primary">{note}</p>
      <h3 className="mt-3 font-display text-2xl font-bold">{name}</h3>
      <p className="mt-1 text-sm font-medium text-foreground">{audience}</p>
      <p className="mt-5 min-h-20 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="my-6 border-y border-border py-5">
        <p className="text-xs uppercase text-muted-foreground">Capacidad de equipo</p>
        <p className="mt-1 font-display text-lg font-semibold">{team}</p>
      </div>
      <p className="text-sm font-semibold">Qué incluye</p>
      <ul className="mt-4 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> {feature}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <p className="font-display text-lg font-bold">Precio a consultar</p>
        <p className="mt-1 text-xs text-muted-foreground">Configuración según tus necesidades</p>
        <Button asChild className="mt-5 w-full" variant={featured ? "default" : "outline"}>
          <Link to="/auth">Elegir {name}</Link>
        </Button>
      </div>
    </article>
  );
}