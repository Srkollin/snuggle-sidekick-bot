import { Droplets, FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GuiaMedicion({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-secondary/40 p-4">
        <h3 className="flex items-center gap-2 font-display font-semibold">
          <Droplets className="size-4 text-primary" /> Cómo medir el pH
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Sumerge la tira reactiva o toma una muestra de agua a 30 cm de profundidad.</li>
          <li>Espera unos segundos y compara el color con la escala del envase.</li>
          <li>Anota el valor más cercano (7,2 - 8,0).</li>
        </ol>
      </section>

      <section className="rounded-xl border border-border bg-secondary/40 p-4">
        <h3 className="flex items-center gap-2 font-display font-semibold">
          <FlaskConical className="size-4 text-primary" /> Cómo medir el cloro libre
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Añade el reactivo (OTO) a la muestra o usa la tira reactiva correspondiente.</li>
          <li>Compara el color resultante con la escala del envase.</li>
          <li>Anota el valor más cercano (0,5 - 2,0 mg/L).</li>
        </ol>
      </section>

      <Button className="w-full" onClick={onClose}>
        Entendido, continuar al registro
      </Button>
    </div>
  );
}
