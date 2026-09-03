export const TIPOS_CONTROL = [
  { value: "inicial", label: "Control inicial", hint: "Antes de la apertura de temporada" },
  { value: "rutina", label: "Control de rutina", hint: "Diario, antes de abrir al público" },
  { value: "periodico", label: "Control periódico", hint: "Mensual, análisis más completo" },
] as const;

export const DESINFECTANTES = ["Cloro", "Sal-Cloro", "Bromo", "Otros"] as const;

export const PRESENCIA = ["Ausencia", "Presencia"] as const;

export type Medicion = {
  ph: number | null;
  free_chlorine: number | null;
  turbidity: number | null;
  water_temperature: number | null;
  disinfectant_type: string;
  bromine_total: number | null;
};

/** Alertas automáticas según RD 742/2013. */
export function calcularAlertas(m: Medicion): string[] {
  const alertas: string[] = [];
  const esBromo = m.disinfectant_type === "Bromo";

  if (m.ph !== null && (m.ph < 6 || m.ph > 9)) {
    alertas.push("Vaso fuera de rango de pH. Cierre obligatorio hasta normalización.");
  }
  if (!esBromo && m.free_chlorine !== null && (m.free_chlorine === 0 || m.free_chlorine > 5)) {
    alertas.push("Cierre obligatorio del vaso hasta normalización del desinfectante.");
  }
  if (esBromo && m.bromine_total !== null && (m.bromine_total === 0 || m.bromine_total > 10)) {
    alertas.push("Cierre obligatorio del vaso hasta normalización del desinfectante.");
  }
  if (m.turbidity !== null && m.turbidity > 5) {
    alertas.push("Agua turbia. Revisar filtración. Riesgo de cierre del vaso.");
  }
  if (m.water_temperature !== null && m.water_temperature > 40) {
    alertas.push("Cierre obligatorio hasta normalización de la temperatura.");
  }
  return alertas;
}
