import Image from "next/image";
import Link from "next/link";
import { Descarga } from "@/components/sdd/descarga";
import { EnlaceExterno } from "@/components/sdd/enlace-externo";
import { MenuTransparencia, MenuTransparenciaMovil } from "@/components/sdd/menu-transparencia";
import { PlantillaPagina } from "@/components/sdd/plantilla-pagina";
import type { Miga } from "@/components/sdd/rastro-navegacion";
import { TextoEnriquecido } from "@/components/sdd/texto-enriquecido";
import {
  type Destino,
  type Enlace,
  etiquetaPeriodo,
  ordenPeriodo,
  PORTALES,
  RUTA_TRANSPARENCIA,
  type SeccionTransparencia,
} from "@/contenido/transparencia";
import type { Documento } from "@/payload-types";
import {
  comoMedio,
  conteoTransparencia,
  documentosMarcoLegal,
  documentosTransparencia,
  listarServicios,
  obtenerPagina,
  textoTransparencia,
} from "./datos";

const MIGA_INICIO: Miga = { etiqueta: "Transparencia", href: RUTA_TRANSPARENCIA };

/** Plantilla común: rastro de navegación, menú vertical a la izquierda y menú móvil en 5 grupos. */
export function PlantillaTransparencia({
  titulo,
  ruta,
  migas,
  children,
}: {
  titulo: string;
  ruta: string;
  migas: Miga[];
  children: React.ReactNode;
}) {
  return (
    <PlantillaPagina
      titulo={titulo}
      migas={migas}
      lateral={<MenuTransparencia actual={ruta} />}
      antesDelTitulo={<MenuTransparenciaMovil actual={ruta} />}
    >
      {children}
    </PlantillaPagina>
  );
}

export function BotonExterno({ enlace }: { enlace: Enlace }) {
  return (
    <EnlaceExterno
      href={enlace.url}
      className="inline-flex min-h-11 items-center rounded-md bg-primario px-5 font-semibold text-sobre-primario hover:brightness-110"
    >
      {enlace.texto}
    </EnlaceExterno>
  );
}

async function Texto({ clave }: { clave: string }) {
  const texto = await textoTransparencia(clave);
  if (!texto) return null;
  return (
    <div className="mb-6 max-w-3xl" data-texto-transparencia>
      <TextoEnriquecido datos={texto.contenido} />
    </div>
  );
}

/** Sección con subsecciones: presentación y menú de archivos interno (A2 3.02.h.c, figura 3.17). */
export async function PaginaSeccion({ seccion }: { seccion: SeccionTransparencia }) {
  const ruta = `${RUTA_TRANSPARENCIA}/${seccion.clave}`;
  const conteo = await conteoTransparencia();
  return (
    <PlantillaTransparencia titulo={seccion.titulo} ruta={ruta} migas={[MIGA_INICIO, { etiqueta: seccion.titulo }]}>
      <p className="mb-6 max-w-3xl text-lg">{seccion.descripcion}</p>
      <Texto clave={seccion.clave} />
      <nav aria-label={`Subsecciones de ${seccion.titulo}`} data-menu-archivos>
        <ul className="grid max-w-3xl gap-3">
          {seccion.subsecciones!.map((sub) => {
            const cantidad = conteo.get(`${seccion.clave}/${sub.clave}`) ?? 0;
            return (
              <li key={sub.clave}>
                <Link
                  href={`${ruta}/${sub.clave}`}
                  className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-lg border border-borde bg-fondo px-4 py-3 hover:border-primario hover:text-primario"
                >
                  <span className="font-semibold">{sub.titulo}</span>
                  <span className="text-sm text-texto-suave">
                    {sub.enlace ? "Enlace a plataforma externa" : cantidad === 1 ? "1 documento" : `${cantidad} documentos`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </PlantillaTransparencia>
  );
}

const TIPO_NORMA_A_SUBSECCION: Record<string, string> = {
  constitucion: "constitucion",
  ley: "leyes",
  decreto: "decretos",
  resolucion: "resoluciones",
  reglamento: "otras-normativas",
  normativa: "otras-normativas",
  otra: "otras-normativas",
};

/**
 * Contenido que ya existe en el portal institucional y se reutiliza para no duplicar archivos:
 * las normas del Marco legal de «Sobre nosotros» en la Base legal, el organigrama en la Estructura
 * orgánica y el catálogo de servicios en la Información básica sobre servicios públicos.
 */
async function ContenidoRelacionado({ destino }: { destino: Destino }) {
  if (destino.seccion.clave === "base-legal" && destino.subseccion) {
    const normas = (await documentosMarcoLegal()).filter((d) => TIPO_NORMA_A_SUBSECCION[d.tipoNorma ?? ""] === destino.subseccion!.clave);
    return normas.length ? <ListaDocumentos documentos={normas} /> : null;
  }
  if (destino.valor === "estructura-organica") {
    const pagina = await obtenerPagina("organigrama");
    if (!pagina) return null;
    const imagen = comoMedio(pagina.imagen);
    const documentos = (pagina.documentos ?? []).filter((d): d is Documento => typeof d === "object" && d !== null);
    return (
      <div className="space-y-4">
        {imagen?.url && (
          <figure>
            <Image
              src={imagen.url}
              alt={imagen.alt}
              width={imagen.width ?? 1200}
              height={imagen.height ?? 800}
              sizes="(min-width: 801px) 900px, 100vw"
              className="h-auto w-full max-w-3xl rounded-lg border border-borde"
            />
          </figure>
        )}
        <ListaDocumentos documentos={documentos} />
      </div>
    );
  }
  if (destino.valor === "servicios") {
    const servicios = await listarServicios();
    if (!servicios.length) return null;
    return (
      <section aria-labelledby="catalogo" className="max-w-3xl">
        <h2 id="catalogo" className="mb-3 text-xl font-semibold text-titulo">
          Catálogo de servicios
        </h2>
        <p className="mb-3">Cada ficha detalla requisitos, procedimiento, costo, horario y tiempo de realización del servicio.</p>
        <ul className="list-disc space-y-1 pl-6">
          {servicios.map((s) => (
            <li key={s.id}>
              <Link href={`/servicios/${s.slug}`} className="text-primario underline">
                {s.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  return null;
}

function ListaDocumentos({ documentos, periodica = false }: { documentos: Documento[]; periodica?: boolean }) {
  return (
    <div className="max-w-3xl space-y-3">
      {documentos.map((d) => (
        <Descarga key={d.id} documento={d} periodo={periodica ? (etiquetaPeriodo(d.periodo) ?? undefined) : undefined} />
      ))}
    </div>
  );
}

/**
 * Lugar de publicación (sección sin subsecciones o subsección). Las de publicación periódica se
 * presentan por año (menú de archivos por año, el más reciente primero); las demás, completas.
 */
export async function PaginaDestino({ destino, anio }: { destino: Destino; anio?: string }) {
  const { seccion, subseccion } = destino;
  const migas: Miga[] = subseccion
    ? [MIGA_INICIO, { etiqueta: seccion.titulo, href: `${RUTA_TRANSPARENCIA}/${seccion.clave}` }, { etiqueta: subseccion.titulo }]
    : [MIGA_INICIO, { etiqueta: seccion.titulo }];
  const enlace = subseccion ? subseccion.enlace : seccion.enlace;
  const documentos = await documentosTransparencia(destino.valor);

  const anios = [...new Set(documentos.map((d) => d.anio).filter((a): a is number => typeof a === "number"))].sort((a, b) => b - a);
  const elegido = destino.periodica ? (anios.find((a) => String(a) === anio) ?? anios[0]) : undefined;
  const visibles = destino.periodica
    ? documentos
        .filter((d) => d.anio === elegido)
        .sort((a, b) => ordenPeriodo(b.periodo) - ordenPeriodo(a.periodo) || (b.fechaCreacion ?? "").localeCompare(a.fechaCreacion ?? ""))
    : documentos;
  const relacionado = await ContenidoRelacionado({ destino });

  return (
    <PlantillaTransparencia titulo={destino.titulo} ruta={destino.ruta} migas={migas}>
      {!subseccion && <p className="mb-6 max-w-3xl text-lg">{seccion.descripcion}</p>}
      <Texto clave={destino.valor} />
      {enlace && (
        <div className="mb-8">
          <BotonExterno enlace={enlace} />
        </div>
      )}
      {relacionado && <div className="mb-8">{relacionado}</div>}

      {destino.periodica && anios.length > 0 && (
        <nav aria-label="Años" className="mb-6" data-menu-anios>
          <ul className="flex flex-wrap gap-2">
            {anios.map((a) => (
              <li key={a}>
                <Link
                  href={`${destino.ruta}?anio=${a}`}
                  aria-current={a === elegido ? "page" : undefined}
                  className={`inline-flex min-h-11 min-w-16 items-center justify-center rounded-md border px-3 font-semibold ${
                    a === elegido ? "border-primario bg-primario text-sobre-primario" : "border-borde text-primario hover:border-primario"
                  }`}
                >
                  {a}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {visibles.length > 0 ? (
        <section aria-label={elegido ? `Documentos de ${elegido}` : "Documentos"}>
          {elegido && <h2 className="mb-3 text-xl font-semibold text-titulo">Documentos de {elegido}</h2>}
          <ListaDocumentos documentos={visibles} periodica={destino.periodica} />
        </section>
      ) : (
        !relacionado &&
        !enlace && (
          <p className="max-w-3xl rounded-lg border border-borde bg-superficie p-4" data-sin-documentos>
            Esta sección aún no tiene documentos publicados. Puede solicitar la información a la Oficina de Libre Acceso
            a la Información por medio del{" "}
            <EnlaceExterno href={PORTALES.saip.url} className="text-primario underline">
              portal SAIP
            </EnlaceExterno>
            .
          </p>
        )
      )}
    </PlantillaTransparencia>
  );
}
