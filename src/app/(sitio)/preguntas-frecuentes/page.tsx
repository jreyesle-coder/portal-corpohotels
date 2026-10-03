import type { Metadata } from "next";
import { IconoChevron } from "@/components/sdd/iconos";
import { PlantillaPagina } from "@/components/sdd/plantilla-pagina";
import { TextoEnriquecido } from "@/components/sdd/texto-enriquecido";
import { listarPreguntas } from "@/sitio/datos";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Respuestas a las preguntas más comunes sobre CORPHOTELS, sus propiedades y sus servicios.",
};

/** Preguntas frecuentes (A2 4.02), en desplegables nativos operables con teclado. */
export default async function PreguntasFrecuentes() {
  const preguntas = await listarPreguntas();
  return (
    <PlantillaPagina titulo="Preguntas frecuentes" migas={[{ etiqueta: "Preguntas frecuentes" }]}>
      <div className="max-w-3xl divide-y divide-borde border-y border-borde">
        {preguntas.map((p) => (
          <details key={p.id} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-semibold text-titulo">
              <h2 className="text-lg">{p.pregunta}</h2>
              <IconoChevron width={20} height={20} className="shrink-0 group-open:rotate-180" />
            </summary>
            <div className="pb-4">
              <TextoEnriquecido datos={p.respuesta} />
            </div>
          </details>
        ))}
      </div>
    </PlantillaPagina>
  );
}
