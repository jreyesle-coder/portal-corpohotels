import type { Metadata } from "next";
import Link from "next/link";
import { EnlaceExterno } from "@/components/sdd/enlace-externo";
import { TextoEnriquecido } from "@/components/sdd/texto-enriquecido";
import { PORTALES, RUTA_TRANSPARENCIA, SECCIONES } from "@/contenido/transparencia";
import { recientesTransparencia, textoTransparencia } from "@/sitio/datos";
import { PlantillaTransparencia } from "@/sitio/transparencia";

export const metadata: Metadata = {
  title: "Transparencia",
  description:
    "Sección de transparencia de CORPHOTELS: base legal, OAI, presupuesto, recursos humanos, compras, finanzas y más, según la Ley 200-04 y la Resolución DIGEIG 002-2021.",
};

const ACCESOS = [
  { enlace: PORTALES.saip, detalle: "Solicite información pública a la institución." },
  { enlace: PORTALES.p311, detalle: "Presente quejas, reclamaciones, sugerencias y denuncias." },
  { enlace: PORTALES.datosAbiertos, detalle: "Descargue datos del Gobierno en formatos abiertos." },
];

/** Inicio Transparencia (A2 4.03.b.i, 5.01.b): portada de la sección en corphotels.gob.do/transparencia. */
export default async function Transparencia() {
  const [texto, recientes] = await Promise.all([textoTransparencia("inicio"), recientesTransparencia()]);
  return (
    <PlantillaTransparencia titulo="Transparencia" ruta={RUTA_TRANSPARENCIA} migas={[{ etiqueta: "Transparencia" }]}>
      <div className="max-w-3xl space-y-4">
        {texto ? (
          <TextoEnriquecido datos={texto.contenido} />
        ) : (
          <p className="text-lg">
            En cumplimiento de la Ley 200-04 General de Libre Acceso a la Información Pública y de la Resolución DIGEIG
            002-2021, CORPHOTELS publica en esta sección la información sobre su base legal, organización, presupuesto,
            recursos humanos, compras y contrataciones, finanzas y demás datos de interés público.
          </p>
        )}
      </div>

      {/* Enlace al Portal Único de Transparencia del Estado (A2 4.03.d). */}
      <EnlaceExterno
        href={PORTALES.portalUnico.url}
        className="my-8 flex max-w-3xl flex-col gap-1 rounded-lg bg-oscuro p-5 text-sobre-oscuro hover:brightness-110"
        data-portal-unico
      >
        <span className="text-lg font-semibold">{PORTALES.portalUnico.texto}</span>
        <span className="text-sobre-oscuro-suave">transparencia.gob.do</span>
      </EnlaceExterno>

      <section aria-labelledby="accesos" className="mb-10">
        <h2 id="accesos" className="mb-3 text-xl font-semibold text-titulo">
          Accesos directos
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {ACCESOS.map(({ enlace, detalle }) => (
            <li key={enlace.url}>
              <EnlaceExterno href={enlace.url} className="flex h-full flex-col gap-1 rounded-lg border border-borde p-4 hover:border-primario">
                <span className="font-semibold text-primario">{enlace.texto}</span>
                <span className="text-sm">{detalle}</span>
              </EnlaceExterno>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="secciones" className="mb-10">
        <h2 id="secciones" className="mb-3 text-xl font-semibold text-titulo">
          Secciones
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {SECCIONES.map((s) => (
            <li key={s.clave}>
              <Link
                href={`${RUTA_TRANSPARENCIA}/${s.clave}`}
                className="flex h-full flex-col gap-1 rounded-lg border border-borde p-4 hover:border-primario"
              >
                <span className="font-semibold text-primario">{s.titulo}</span>
                <span className="text-sm">{s.descripcion}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {recientes.length > 0 && (
        <section aria-labelledby="recientes">
          <h2 id="recientes" className="mb-3 text-xl font-semibold text-titulo">
            Publicado recientemente
          </h2>
          <ul className="max-w-3xl divide-y divide-borde">
            {recientes.map((d) => (
              <li key={d.id} className="py-2">
                <Link href={`${RUTA_TRANSPARENCIA}/${d.seccionTransparencia}`} className="text-primario underline">
                  {d.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PlantillaTransparencia>
  );
}
