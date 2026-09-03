export const CARGOS = [
  "Propietario",
  "Gerente",
  "Administrador autorizado",
  "Autónomo",
  "Otro responsable autorizado",
] as const;

export const EMPLEADOS_RANGOS = [
  "Solo trabajo yo",
  "De 2 a 5 empleados",
  "De 6 a 10 empleados",
  "De 11 a 25 empleados",
  "Más de 25 empleados",
] as const;

export const SERVICIOS = [
  "Mantenimiento de piscinas",
  "Limpieza de piscinas",
  "Tratamiento y control del agua",
  "Reparación de averías",
  "Reparación de bombas y depuradoras",
  "Instalación de equipos",
  "Construcción o reforma de piscinas",
  "Venta de productos químicos",
  "Gestión de comunidades",
  "Gestión de instalaciones deportivas",
  "Gestión de hoteles o complejos turísticos",
  "Gestión de socorristas",
  "Personal sanitario / ATS",
  "Portería o control de accesos",
  "Gestión integral de instalaciones",
] as const;

export const MODULOS_BASE = [
  "Clientes e instalaciones",
  "Agenda y órdenes de trabajo",
  "Técnicos y partes de mantenimiento",
  "Incidencias y reparaciones",
  "Presupuestos y contratos",
  "Facturación y cobros",
  "Inventario y productos químicos",
] as const;

export const MODULOS_OPCIONALES = [
  "Gestión de socorristas y turnos",
  "Personal sanitario / ATS",
  "Portería y control de accesos",
  "Portal del cliente",
  "Rutas y geolocalización",
  "Informes avanzados",
] as const;

/** Servicios que activan automáticamente un módulo opcional. */
export const SERVICIO_A_MODULO: Record<string, string> = {
  "Gestión de socorristas": "Gestión de socorristas y turnos",
  "Personal sanitario / ATS": "Personal sanitario / ATS",
  "Portería o control de accesos": "Portería y control de accesos",
};

export const DOSIFICACIONES = ["Cloro", "Sal", "Bromo", "Otros"] as const;

export const ESTADOS_PISCINA = [
  "Abierta",
  "Cerrada",
  "Invernando",
  "En obra",
  "Avería",
] as const;

export type EstadoPiscina = (typeof ESTADOS_PISCINA)[number];

export const ESTADO_CLASSES: Record<string, string> = {
  Abierta: "bg-primary/15 text-primary border-primary/30",
  Cerrada: "bg-muted text-muted-foreground border-border",
  Invernando: "bg-accent/20 text-accent-foreground border-accent/40",
  "En obra": "bg-chart-4/20 text-foreground border-chart-4/40",
  Avería: "bg-destructive/15 text-destructive border-destructive/30",
};

export type OtroEmpleado = { tipo: string; cantidad: number };

/** Jerarquía de roles de la plataforma (organización interna del cliente). */
export const JERARQUIA = [
  {
    area: "Dirección y administración",
    roles: ["Administrador principal", "Gerente", "Oficina / administración", "Comercial"],
  },
  {
    area: "Operaciones técnicas",
    roles: [
      "Supervisor técnico",
      "Técnico de mantenimiento",
      "Técnico de reparación",
      "Instalador",
      "Operario / ayudante",
    ],
  },
  {
    area: "Logística y almacén",
    roles: ["Responsable de almacén", "Compras y proveedores", "Reparto / vehículos"],
  },
  {
    area: "Personal de piscina",
    roles: ["Coordinador de personal", "Socorrista", "ATS / personal sanitario", "Portero / controlador de acceso"],
  },
];

/** Cargos que un administrador puede asignar a un empleado invitado. */
export const CARGOS_EMPLEADO = [
  "Administrador",
  "Encargado / Supervisor",
  "Técnico de mantenimiento",
  "Socorrista",
  "ATS (Asistencia Técnico-Sanitaria)",
  "Portero / Conserje",
  "Limpieza",
  "Jardinería",
] as const;

export const USOS_ENLACE = [
  { label: "1 uso", value: "1" },
  { label: "5 usos", value: "5" },
  { label: "10 usos", value: "10" },
  { label: "Ilimitado", value: "ilimitado" },
] as const;

export const CADUCIDAD_ENLACE = [
  { label: "24 horas", value: "24" },
  { label: "48 horas", value: "48" },
  { label: "7 días", value: "168" },
  { label: "30 días", value: "720" },
] as const;

export const ESTADOS_EMPLEADO: Record<string, string> = {
  en_turno: "En turno",
  fuera_de_turno: "Fuera de turno",
  baja: "De baja",
  despedido: "Despedido",
};

export const ESTADO_CIVIL = ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Otro"] as const;

export const NIVEL_ESTUDIOS = [
  "Sin estudios",
  "Primaria",
  "ESO",
  "Bachillerato",
  "FP",
  "Universitario",
] as const;

export const TIPOS_CLIENTE = [
  "Particular",
  "Comunidad de propietarios",
  "Administrador de fincas",
  "Empresa / Negocio",
  "Ayuntamiento / Entidad pública",
] as const;

export const METODOS_PAGO = [
  "Transferencia",
  "Domiciliación bancaria",
  "Efectivo",
  "Otro",
] as const;
