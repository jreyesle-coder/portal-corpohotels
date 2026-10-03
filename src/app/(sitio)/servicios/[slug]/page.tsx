import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnlaceExterno } from "@/components/sdd/enlace-externo";
import { PlantillaPagina } from "@/components/sdd/plantilla-pagina";
import { TextoEnriquecido } from "@/components/sdd/texto-enriquecido";
import { CANALES } from "@/cms/colecciones/servicios";
import { obtenerServicio } from "@/sitio/datos";
import { metadatos } from "@/sitio/pagina-cms";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await obtenerServicio((await params).slug);
  return s ? metadatos(s.nombre, s.seo, s.resumen) : {};
}

/**
 * Ficha del servicio con los campos de la NORTIC A5, sección 2.02.1 (A2 4.02.b.i). Solo se muestran
 * los datos cargados: hasta S9 algunos servicios se publican con la información del portal actual.
 */
export default async function Servicio({ params }: Props) {
  const s = await obtenerServicio((await params).slug);
  if (!s) notFound();
  const canales = (s.canales ?? []).map((c) => CANALES.find((x) => x.value === c)?.label ?? c);
  const solicitar = s.acceso?.solicitudEnLinea;
  const plataforma = s.acceso?.url;

  return (
    <PlantillaPagina
      titulo={s.nombre}
      migas={[{ etiqueta: "Servicios", href: "/servicios" }, { etiqueta: s.nombre }]}
      urlPdf={`/exportar-pdf?tipo=servicios&slug=${s.slug}`}
    >
      {s.nombreColoquial && (
        <p className="-mt-2 mb-4 text-texto-suave">
          También conocido como: <strong className="text-texto">{s.nombreColoquial}</strong>
        </p>
      )}
      <p className="mb-6 max-w-3xl text-lg">{s.resumen}</p>

      {(solicitar || plataforma) && (
        <div className="mb-8 flex flex-wrap gap-3">
          {solicitar && (
            <Link
              href={`/servicios/${s.slug}/solicitud`}
              className="inline-flex min-h-11 items-center rounded-md bg-primario px-5 font-semibold text-sobre-primario hover:brightness-110"
            >
              Solicitar en línea
            </Link>
          )}
          {plataforma && (
            // Si el trámite se hace en una plataforma propia del servicio, este es el botón principal.
            <EnlaceExterno
              href={plataforma}
              className={`inline-flex min-h-11 items-center rounded-md px-5 font-semibold ${
                solicitar
                  ? "border-2 border-primario text-primario hover:bg-primario-claro"
                  : "bg-primario text-sobre-primario hover:brightness-110"
              }`}
            >
              {solicitar ? "Ir a la plataforma del servicio" : "Solicitar en línea"}
            </EnlaceExterno>
          )}
        </div>
      )}

      <div className="max-w-3xl space-y-8" data-ficha-servicio>
        <Bloque titulo="Descripción del servicio">
          <TextoEnriquecido datos={s.contenido} />
        </Bloque>

        <dl className="grid gap-x-8 gap-y-5 empty:hidden sm:grid-cols-2">
          {s.dirigidoA && <Dato titulo="A quién va dirigido">{s.dirigidoA}</Dato>}
          {s.areaResponsable && <Dato titulo="Área responsable">{s.areaResponsable}</Dato>}
          {(s.contactoArea?.telefono || s.contactoArea?.correo) && (
            <Dato titulo="Contacto del área">
              {s.contactoArea?.telefono && (
                <>
                  Teléfono:{" "}
                  <a href={`tel:+1${s.contactoArea.telefono.replace(/\D/g, "")}`} className="text-primario underline">
                    {s.contactoArea.telefono}
                  </a>
                  {s.contactoArea.extension && `, ext. ${s.contactoArea.extension}`}
                  <br />
                </>
              )}
              {s.contactoArea?.correo && (
                <>
                  Correo:{" "}
                  <a href={`mailto:${s.contactoArea.correo}`} className="text-primario underline">
                    {s.contactoArea.correo}
                  </a>
                </>
              )}
            </Dato>
          )}
          {s.horario && <Dato titulo="Horario de prestación">{s.horario}</Dato>}
          {s.costo && <Dato titulo="Costo">{s.costo}</Dato>}
          {s.tiempoRespuesta && <Dato titulo="Tiempo de respuesta a la solicitud">{s.tiempoRespuesta}</Dato>}
          {s.tiempoRealizacion && <Dato titulo="Tiempo de realización">{s.tiempoRealizacion}</Dato>}
          {canales.length > 0 && <Dato titulo="Canales de prestación">{canales.join(", ")}</Dato>}
          {(solicitar || plataforma) && (
            <Dato titulo="Acceso al servicio">
              {solicitar && (
                <Link href={`/servicios/${s.slug}/solicitud`} className="text-primario underline">
                  Formulario de solicitud en línea
                </Link>
              )}
              {solicitar && plataforma && <br />}
              {plataforma && (
                <EnlaceExterno href={plataforma} className="text-primario underline">
                  Plataforma del servicio
                </EnlaceExterno>
              )}
            </Dato>
          )}
        </dl>

        {(s.requisitos?.length ?? 0) > 0 && (
          <Bloque titulo="Requisitos">
            <ul className="list-disc space-y-1 pl-6">
              {s.requisitos!.map((r) => (
                <li key={r.id}>{r.texto}</li>
              ))}
            </ul>
          </Bloque>
        )}

        {(s.procedimiento?.length ?? 0) > 0 && (
          <Bloque titulo="Procedimiento">
            <ol className="list-decimal space-y-1 pl-6">
              {s.procedimiento!.map((p) => (
                <li key={p.id}>{p.texto}</li>
              ))}
            </ol>
          </Bloque>
        )}

        {s.informacionAdicional && (
          <Bloque titulo="Información adicional">
            <TextoEnriquecido datos={s.informacionAdicional} />
          </Bloque>
        )}
      </div>
    </PlantillaPagina>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section aria-label={titulo}>
      <h2 className="mb-3 text-xl font-semibold text-titulo">{titulo}</h2>
      {children}
    </section>
  );
}

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-titulo">{titulo}</dt>
      <dd className="whitespace-pre-line">{children}</dd>
    </div>
  );
}
