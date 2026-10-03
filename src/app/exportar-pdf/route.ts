import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { createElement as h, type ReactElement } from "react";
import { obtenerInstitucion, obtenerNoticia, obtenerPagina, obtenerServicio } from "@/sitio/datos";
import { aSlug } from "@/lib/slug";
import { urlSitio } from "@/config";

export const dynamic = "force-dynamic";

/**
 * Exportar a PDF (A2 2.01.e): genera en el servidor un PDF accesible por texto con el título, la
 * fecha, el contenido y la dirección de origen. Solo contenido publicado.
 */
Font.registerHyphenationCallback((palabra) => [palabra]);

const estilos = StyleSheet.create({
  pagina: { paddingVertical: 48, paddingHorizontal: 56, fontSize: 11, lineHeight: 1.5, fontFamily: "Helvetica", color: "#1f2937" },
  cabecera: { borderBottomWidth: 2, borderBottomColor: "#0f539c", paddingBottom: 8, marginBottom: 18 },
  organismo: { fontSize: 10, color: "#003876", fontFamily: "Helvetica-Bold" },
  titulo: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#003876", marginBottom: 6 },
  meta: { fontSize: 10, color: "#4b5563", marginBottom: 14 },
  parrafo: { marginBottom: 8 },
  h2: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#003876", marginTop: 10, marginBottom: 6 },
  h3: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#003876", marginTop: 8, marginBottom: 4 },
  vineta: { flexDirection: "row", marginBottom: 4, paddingLeft: 8 },
  pie: { position: "absolute", bottom: 24, left: 56, right: 56, fontSize: 8, color: "#4b5563", borderTopWidth: 1, borderTopColor: "#d1d5db", paddingTop: 6 },
});

type Nodo = { type: string; text?: string; tag?: string; listType?: string; children?: Nodo[] };

const textoDe = (n: Nodo): string =>
  n.type === "text" ? (n.text ?? "") : n.type === "linebreak" ? "\n" : (n.children ?? []).map(textoDe).join("");

function bloques(raiz: unknown): ReactElement[] {
  const nodos = ((raiz as { root?: { children?: Nodo[] } })?.root?.children ?? []) as Nodo[];
  return nodos.flatMap((n, i): ReactElement[] => {
    if (n.type === "heading") {
      return [h(Text, { key: i, style: n.tag === "h2" || n.tag === "h1" ? estilos.h2 : estilos.h3 }, textoDe(n))];
    }
    if (n.type === "list") {
      return (n.children ?? []).map((li, j) =>
        h(View, { key: `${i}-${j}`, style: estilos.vineta }, h(Text, { style: { width: 14 } }, n.listType === "number" ? `${j + 1}.` : "•"), h(Text, { style: { flex: 1 } }, textoDe(li))),
      );
    }
    const t = textoDe(n).trim();
    return t ? [h(Text, { key: i, style: estilos.parrafo }, t)] : [];
  });
}

const fecha = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Santo_Domingo" }) : null;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tipo = url.searchParams.get("tipo");
  const slug = url.searchParams.get("slug") ?? "";
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return new Response("Solicitud no válida", { status: 400 });

  let titulo = "";
  let meta: string | null = null;
  let contenido: unknown;
  let ruta = "";
  if (tipo === "noticias") {
    const n = await obtenerNoticia(slug);
    if (!n) return new Response("No encontrado", { status: 404 });
    titulo = n.titulo;
    meta = `${fecha(n.fecha)} · ${n.lugar}${n.fuente?.nombre ? ` · Fuente: ${n.fuente.nombre}` : ""}`;
    contenido = n.contenido;
    ruta = `/noticias/${n.slug}`;
  } else if (tipo === "servicios") {
    const s = await obtenerServicio(slug);
    if (!s) return new Response("No encontrado", { status: 404 });
    titulo = s.nombre;
    meta = s.resumen;
    contenido = s.contenido;
    ruta = `/servicios/${s.slug}`;
  } else if (tipo === "paginas") {
    const p = await obtenerPagina(slug);
    if (!p) return new Response("No encontrado", { status: 404 });
    titulo = p.titulo;
    contenido = p.contenido;
    ruta = p.padre && typeof p.padre === "object" ? `/${p.padre.slug}/${p.slug}` : `/${p.slug}`;
  } else {
    return new Response("Solicitud no válida", { status: 400 });
  }

  const institucion = await obtenerInstitucion();
  const direccion = new URL(ruta, urlSitio()).toString();
  const generado = fecha(new Date().toISOString());

  const documento = h(
    Document,
    { title: titulo, author: institucion.siglas, subject: titulo, language: "es", creator: `Portal ${institucion.siglas}` },
    h(
      Page,
      { size: "LETTER", style: estilos.pagina },
      h(View, { style: estilos.cabecera }, h(Text, { style: estilos.organismo }, `${institucion.nombre} (${institucion.siglas})`)),
      h(Text, { style: estilos.titulo }, titulo),
      meta ? h(Text, { style: estilos.meta }, meta) : null,
      ...bloques(contenido),
      h(Text, { style: estilos.pie, fixed: true }, `${direccion} · Generado el ${generado}`),
    ),
  );

  const pdf = await renderToBuffer(documento as ReactElement<Parameters<typeof renderToBuffer>[0]["props"]>);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${aSlug(titulo, 80) || "documento"}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
