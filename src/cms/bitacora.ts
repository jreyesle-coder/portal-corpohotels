import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  Payload,
  PayloadRequest,
} from "payload";
import { usuarioDe } from "./acceso";

/**
 * Bitácora append-only de autenticación, permisos y publicaciones (A8 3.01.5.d, 3.04.3).
 * Solo el servidor escribe en ella (overrideAccess); nadie puede modificarla ni borrarla, ni
 * siquiera desde la base de datos: un disparador de PostgreSQL lo impide (migración inicial).
 * En S8 se envía a Log Analytics.
 */
export const EVENTOS = [
  "inicio_sesion",
  "inicio_sesion_rechazado",
  "cierre_sesion",
  "creacion",
  "modificacion",
  "publicacion",
  "despublicacion",
  "eliminacion",
  "cambio_permisos",
] as const;
export type Evento = (typeof EVENTOS)[number];

export type EntradaBitacora = {
  evento: Evento;
  coleccion?: string;
  documentoId?: string;
  titulo?: string;
  usuarioId?: string;
  usuarioCorreo?: string;
  ip?: string;
  detalle?: Record<string, unknown>;
};

export function ipDe(headers: Headers): string | undefined {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || undefined;
}

export async function registrarEvento(payload: Payload, entrada: EntradaBitacora, req?: PayloadRequest) {
  await payload.create({
    collection: "bitacora",
    data: { ...entrada, fecha: new Date().toISOString() },
    overrideAccess: true,
    req,
  });
}

function tituloDe(doc: Record<string, unknown>): string | undefined {
  // Los casos se identifican por su número: su nombre es un dato personal cifrado y no va a la bitácora.
  const t = doc.numero ?? doc.titulo ?? doc.nombre ?? doc.filename ?? doc.email ?? doc.seccion;
  return typeof t === "string" ? t : undefined;
}

function datosUsuario(req: PayloadRequest) {
  const u = usuarioDe(req);
  return { usuarioId: u ? String(u.id) : undefined, usuarioCorreo: u?.email, ip: ipDe(req.headers) };
}

/** Registra creación, modificación, publicación y despublicación de una colección. */
export const auditarCambios: CollectionAfterChangeHook = async ({ collection, doc, previousDoc, operation, req }) => {
  let evento: Evento = operation === "create" ? "creacion" : "modificacion";
  const antes = previousDoc?._status;
  const ahora = doc?._status;
  if (ahora === "published" && antes !== "published") evento = "publicacion";
  else if (antes === "published" && ahora === "draft" && operation === "update" && !req.query?.draft) {
    evento = "despublicacion";
  }
  await registrarEvento(
    req.payload,
    {
      evento,
      coleccion: collection.slug,
      documentoId: String(doc.id),
      titulo: tituloDe(doc),
      ...datosUsuario(req),
      detalle: ahora ? { estado: ahora } : undefined,
    },
    req,
  );
  return doc;
};

export const auditarEliminacion: CollectionAfterDeleteHook = async ({ collection, doc, req }) => {
  await registrarEvento(
    req.payload,
    {
      evento: "eliminacion",
      coleccion: collection.slug,
      documentoId: String(doc.id),
      titulo: tituloDe(doc),
      ...datosUsuario(req),
    },
    req,
  );
  return doc;
};
