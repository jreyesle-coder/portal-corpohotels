import { tamanoLegible, tipoLegible } from "@/cms/archivos";
import type { Documento } from "@/payload-types";
import { EnlaceExterno } from "./enlace-externo";

const fecha = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }) : "—";

/**
 * Descarga de documento con descripción, tamaño, fecha de creación y tipo (A2 2.01.b.xiii);
 * se abre en pestaña nueva (A2 2.01.g).
 */
export function Descarga({ documento }: { documento: Documento }) {
  const tipo = tipoLegible(documento.mimeType);
  const tamano = tamanoLegible(documento.filesize);
  return (
    <article className="rounded-lg border border-borde bg-fondo p-4" data-descarga>
      <h3 className="text-lg font-semibold text-titulo">{documento.titulo}</h3>
      <p className="mt-1 text-texto" data-meta="descripcion">
        {documento.descripcion}
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="font-semibold">Tipo:</dt>
        <dd data-meta="tipo">{tipo}</dd>
        <dt className="font-semibold">Tamaño:</dt>
        <dd data-meta="tamano">{tamano}</dd>
        <dt className="font-semibold">Fecha de creación:</dt>
        <dd data-meta="fecha">{fecha(documento.fechaCreacion)}</dd>
      </dl>
      {documento.url && (
        <EnlaceExterno
          href={documento.url.replace(/^https?:\/\/[^/]+(?=\/api\/)/, "")}
          className="mt-3 inline-flex min-h-11 items-center rounded-md bg-primario px-4 font-semibold text-sobre-primario"
        >
          Descargar {documento.titulo} ({tipo}, {tamano})
        </EnlaceExterno>
      )}
    </article>
  );
}
