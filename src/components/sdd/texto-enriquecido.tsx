import {
  type JSXConvertersFunction,
  RichText,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import Link from "next/link";
import { Prosa } from "./base";
import { EnlaceExterno } from "./enlace-externo";

const RUTAS: Partial<Record<string, (slug: string) => string>> = {
  noticias: (s) => `/noticias/${s}`,
  servicios: (s) => `/servicios/${s}`,
  paginas: (s) => `/${s}`,
};

type NodoEnlace = {
  fields: { url?: string; linkType?: string; doc?: { relationTo: string; value: unknown } };
};

function destino(nodo: NodoEnlace): string {
  const { fields } = nodo;
  if (fields.linkType === "internal" && fields.doc) {
    const valor = fields.doc.value as { slug?: string } | null;
    const ruta = RUTAS[fields.doc.relationTo];
    return ruta && valor?.slug ? ruta(valor.slug) : "/";
  }
  return fields.url ?? "#";
}

const esInterno = (href: string) => href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/api/");

/**
 * Contenido del CMS con los estilos del SDD. Los enlaces externos y las descargas se abren en
 * pestaña nueva y lo anuncian (A2 2.01.g); los internos navegan dentro del portal.
 */
const conversores: JSXConvertersFunction = ({ defaultConverters }) => {
  const enlace = ({ node, nodesToJSX }: { node: NodoEnlace & { children: unknown[] }; nodesToJSX: (a: { nodes: unknown[] }) => React.ReactNode[] }) => {
    const href = destino(node);
    const hijos = nodesToJSX({ nodes: node.children });
    return esInterno(href) ? <Link href={href}>{hijos}</Link> : <EnlaceExterno href={href}>{hijos}</EnlaceExterno>;
  };
  return {
    ...defaultConverters,
    link: enlace as never,
    autolink: enlace as never,
  };
};

export function TextoEnriquecido({ datos }: { datos: SerializedEditorState | null | undefined }) {
  if (!datos) return null;
  return (
    <Prosa>
      <RichText data={datos} converters={conversores} disableContainer />
    </Prosa>
  );
}
