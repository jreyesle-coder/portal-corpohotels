"use server";

import config from "@payload-config";
import { sql } from "@payloadcms/db-postgres";
import { headers } from "next/headers";
import { getPayload } from "payload";
import { obtenerConfig } from "@/config";
import { obtenerInstitucion, obtenerServicio } from "@/sitio/datos";
import {
  camposDe,
  type ErroresCampos,
  FORMULARIOS,
  TEXTO_CONSENTIMIENTO,
  type TipoFormulario,
  validarCampo,
} from "./definiciones";
import { correoAtencion, correoCiudadano } from "./correos";

/**
 * Recepción de formularios (A2 2.01.b.x–xi, 5.05.d–e, 5.05.h):
 * - Solo POST: es una acción de servidor; Next.js rechaza las de otro origen (protección CSRF).
 * - Validación definitiva en el servidor con las mismas reglas del navegador.
 * - Sin saltos de línea ni caracteres de control en campos de una línea (inyección de encabezados
 *   de correo); el mensaje solo se guarda y se envía como texto.
 * - Campo trampa y límite por dirección IP contra envíos automatizados.
 * - Datos personales cifrados en la base de datos (colección «Casos»).
 */
export type ResultadoEnvio =
  | { estado: "inicial" }
  | { estado: "error"; mensaje: string; errores: ErroresCampos; valores: Record<string, string> }
  | {
      estado: "enviado";
      numero: string;
      tipo: TipoFormulario;
      tiempo: string;
      correo: string;
      correoEnviado: boolean;
      servicio?: { id: number; nombre: string; slug: string };
    };

const TIPOS: TipoFormulario[] = ["contacto", "sugerencia", "solicitud"];
const VENTANA_MS = 10 * 60 * 1000;
const envios = new Map<string, number[]>();

function excedeLimite(ip: string): boolean {
  const ahora = Date.now();
  const recientes = (envios.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  recientes.push(ahora);
  envios.set(ip, recientes);
  if (envios.size > 5000) envios.clear();
  return recientes.length > obtenerConfig().LIMITE_ENVIOS_POR_IP;
}

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const limpiar = (v: string, multilinea: boolean) =>
  (multilinea ? v.replace(/\r\n?/g, "\n") : v.replace(/[\r\n]+/g, " ")).replace(CONTROL, "").trim();

export async function enviarFormulario(_previo: ResultadoEnvio, datos: FormData): Promise<ResultadoEnvio> {
  const tipo = String(datos.get("tipo") ?? "") as TipoFormulario;
  if (!TIPOS.includes(tipo)) return { estado: "error", mensaje: "Formulario no válido.", errores: {}, valores: {} };

  const valores: Record<string, string> = {};
  const errores: ErroresCampos = {};
  for (const campo of camposDe(tipo)) {
    const valor = limpiar(String(datos.get(campo.nombre) ?? ""), campo.tipo === "textarea");
    valores[campo.nombre] = valor;
    const error = validarCampo(campo, valor);
    if (error) errores[campo.nombre] = error;
  }
  const consentimiento = datos.get("consentimiento") === "si";
  if (!consentimiento) errores.consentimiento = "Debe aceptar el uso de sus datos para que podamos atender su caso.";

  let servicio: { id: number; nombre: string; slug: string; tiempoRespuesta?: string | null } | undefined;
  if (tipo === "solicitud") {
    const s = await obtenerServicio(String(datos.get("servicio") ?? ""));
    if (!s?.acceso?.solicitudEnLinea) return { estado: "error", mensaje: "Este servicio no admite solicitudes en línea.", errores: {}, valores };
    servicio = { id: s.id, nombre: s.nombre, slug: s.slug, tiempoRespuesta: s.tiempoRespuesta ?? s.tiempoRealizacion };
  }

  if (Object.keys(errores).length > 0) {
    return { estado: "error", mensaje: "Revise los campos señalados.", errores, valores };
  }

  const cabeceras = await headers();
  const ip = cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  // Campo trampa: invisible para las personas; los robots lo llenan.
  if (String(datos.get("sitio_web") ?? "") !== "" || excedeLimite(ip)) {
    return {
      estado: "error",
      mensaje: "No pudimos recibir su envío. Espere unos minutos e inténtelo de nuevo, o comuníquese por teléfono.",
      errores: {},
      valores,
    };
  }

  const payload = await getPayload({ config });
  const institucion = await obtenerInstitucion();
  const consecutivo = await payload.db.drizzle.execute(sql`SELECT nextval('casos_consecutivo_seq') AS n`);
  const n = Number((consecutivo.rows[0] as { n: string }).n);
  const numero = `CPH-${new Date().getFullYear()}-${String(n).padStart(6, "0")}`;

  const asunto =
    tipo === "contacto"
      ? valores.asunto
      : tipo === "sugerencia"
        ? `${FORMULARIOS.sugerencia.pasos[1].campos[0].opciones?.find((o) => o.valor === valores.tipoComentario)?.etiqueta ?? "Comentario"} sobre el portal o los servicios`
        : `Solicitud: ${servicio?.nombre}`;

  await payload.create({
    collection: "casos",
    overrideAccess: true,
    data: {
      numero,
      tipo,
      estado: "recibido",
      servicio: servicio?.id,
      asunto: asunto.slice(0, 150),
      nombre: valores.nombre,
      correo: valores.correo,
      telefono: valores.telefono || undefined,
      cedula: valores.cedula || undefined,
      mensaje: valores.mensaje,
      consentimiento: { aceptado: true, fecha: new Date().toISOString(), texto: TEXTO_CONSENTIMIENTO },
    },
  });

  const atencion = institucion.atencion;
  const tiempo =
    tipo === "solicitud"
      ? (servicio?.tiempoRespuesta ?? atencion.tiempoSugerencias)
      : tipo === "sugerencia"
        ? atencion.tiempoSugerencias
        : atencion.tiempoContacto;

  let correoEnviado = true;
  try {
    const { SITE_URL, CORREO_ATENCION } = obtenerConfig();
    const ciudadano = correoCiudadano({ numero, tipo, asunto, tiempo, institucion, servicio, sitio: SITE_URL });
    await payload.sendEmail({ to: valores.correo, ...ciudadano });
    await payload.sendEmail({ to: CORREO_ATENCION, ...correoAtencion({ numero, tipo, asunto, servicio, sitio: SITE_URL }) });
  } catch (error) {
    correoEnviado = false;
    payload.logger.error({ err: error, numero }, "No se pudo enviar el correo de confirmación del caso");
  }

  return {
    estado: "enviado",
    numero,
    tipo,
    tiempo,
    correo: valores.correo,
    correoEnviado,
    servicio: servicio ? { id: servicio.id, nombre: servicio.nombre, slug: servicio.slug } : undefined,
  };
}

export type ResultadoEncuesta = { estado: "inicial" | "enviada" | "error"; mensaje?: string };

/** Encuesta de satisfacción al finalizar el proceso (A2 5.04.1). Anónima. */
export async function enviarEncuesta(_previo: ResultadoEncuesta, datos: FormData): Promise<ResultadoEncuesta> {
  const calificacion = Number(datos.get("calificacion"));
  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return { estado: "error", mensaje: "Elija una calificación del 1 al 5." };
  }
  const facilidad = datos.get("facilidad");
  const tipo = String(datos.get("tipo") ?? "");
  const servicio = Number(datos.get("servicio")) || undefined;
  const payload = await getPayload({ config });
  await payload.create({
    collection: "encuestas",
    overrideAccess: true,
    data: {
      calificacion,
      facilidad: facilidad === "si" || facilidad === "no" ? facilidad : undefined,
      comentario: limpiar(String(datos.get("comentario") ?? ""), true).slice(0, 500) || undefined,
      tipo: TIPOS.includes(tipo as TipoFormulario) ? tipo : undefined,
      servicio,
    },
  });
  return { estado: "enviada" };
}
