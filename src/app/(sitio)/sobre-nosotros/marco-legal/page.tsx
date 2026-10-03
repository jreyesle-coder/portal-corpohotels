import type { Metadata } from "next";
import { Descarga } from "@/components/sdd/descarga";
import { documentosMarcoLegal } from "@/sitio/datos";
import { metadatosPagina, PaginaCms, seccionSobreNosotros } from "@/sitio/pagina-cms";

export const generateMetadata = (): Promise<Metadata> => metadatosPagina("marco-legal");

const TIPOS: [string, string][] = [
  ["constitucion", "Constitución"],
  ["ley", "Leyes"],
  ["decreto", "Decretos"],
  ["resolucion", "Resoluciones"],
  ["reglamento", "Reglamentos"],
  ["normativa", "Normativas"],
  ["otra", "Otras normas"],
];

/** Marco legal descargable, agrupado por tipo de norma y ordenado por fecha (A2 4.02). */
export default async function MarcoLegal() {
  const documentos = await documentosMarcoLegal();
  const grupos = TIPOS.map(([tipo, titulo]) => ({ titulo, docs: documentos.filter((d) => d.tipoNorma === tipo) })).filter(
    (g) => g.docs.length > 0,
  );
  return (
    <PaginaCms
      slug="marco-legal"
      migas={[{ etiqueta: "Sobre nosotros", href: "/sobre-nosotros" }]}
      seccion={await seccionSobreNosotros("/sobre-nosotros/marco-legal")}
      despues={
        <div className="mt-8 max-w-3xl space-y-8">
          {grupos.map((g) => (
            <section key={g.titulo} aria-labelledby={`tipo-${g.titulo}`} className="space-y-3">
              <h2 id={`tipo-${g.titulo}`} className="text-xl font-semibold text-titulo">
                {g.titulo}
              </h2>
              {g.docs.map((d) => (
                <Descarga key={d.id} documento={d} />
              ))}
            </section>
          ))}
        </div>
      }
    />
  );
}
