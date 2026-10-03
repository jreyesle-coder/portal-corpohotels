import type { DatosInstitucion } from "@/sitio/datos";
import type { TipoFormulario } from "./definiciones";

/**
 * Correos transaccionales. El asunto no lleva datos escritos por el usuario sin limpiar y el cuerpo
 * escapa todo el HTML (A2 5.05.h). Al buzón institucional no se envían datos personales: se
 * consultan, descifrados, en el panel del CMS.
 */
const escapar = (t: string) =>
  t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const NOMBRES: Record<TipoFormulario, string> = {
  contacto: "mensaje de contacto",
  sugerencia: "comentario",
  solicitud: "solicitud",
};

function plantilla(titulo: string, parrafos: string[], institucion?: DatosInstitucion) {
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f3f6fa;font-family:Arial,sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:8px">
<tr><td style="background:#003876;color:#fff;padding:16px 24px;font-weight:bold">${escapar(institucion?.nombre ?? "CORPHOTELS")}</td></tr>
<tr><td style="padding:24px"><h1 style="font-size:20px;color:#003876;margin:0 0 16px">${escapar(titulo)}</h1>
${parrafos.map((p) => `<p style="margin:0 0 12px;line-height:1.5">${p}</p>`).join("\n")}
</td></tr>
${institucion ? `<tr><td style="padding:16px 24px;border-top:1px solid #d1d5db;font-size:12px;color:#4b5563">${escapar(institucion.direccion)}<br>Teléfono: ${escapar(institucion.telefono)}${institucion.correo ? ` · ${escapar(institucion.correo)}` : ""}</td></tr>` : ""}
</table></td></tr></table></body></html>`;
  const text = [titulo, "", ...parrafos.map((p) => p.replace(/<[^>]+>/g, "")), "", institucion?.nombre ?? ""].join("\n");
  return { html, text };
}

export function correoCiudadano(a: {
  numero: string;
  tipo: TipoFormulario;
  asunto: string;
  tiempo: string;
  institucion: DatosInstitucion;
  servicio?: { nombre: string };
  sitio: string;
}) {
  const i = a.institucion;
  const cuerpo = plantilla(
    `Recibimos su ${NOMBRES[a.tipo]}`,
    [
      `Su número de caso es <strong>${escapar(a.numero)}</strong>. Consérvelo para cualquier consulta.`,
      a.servicio ? `Servicio: ${escapar(a.servicio.nombre)}.` : `Asunto: ${escapar(a.asunto)}.`,
      `Tiempo de respuesta: <strong>${escapar(a.tiempo)}</strong>.`,
      `Le informaremos del estado de su caso por este correo electrónico${a.tipo === "solicitud" ? " y por el teléfono que nos indicó" : ""}.`,
      `Para consultar su caso, comuníquese al ${escapar(i.telefono)}${i.correo ? ` o escriba a ${escapar(i.correo)}` : ""} indicando su número de caso.`,
      `Sus datos se tratan según nuestra <a href="${escapar(new URL("/politica-de-privacidad", a.sitio).toString())}">Política de privacidad</a>.`,
    ],
    i,
  );
  return { subject: `Caso ${a.numero}: recibimos su ${NOMBRES[a.tipo]} | CORPHOTELS`, ...cuerpo };
}

export function correoAtencion(a: {
  numero: string;
  tipo: TipoFormulario;
  asunto: string;
  servicio?: { nombre: string };
  sitio: string;
}) {
  const cuerpo = plantilla(`Nuevo caso ${a.numero}`, [
    `Tipo: ${escapar(NOMBRES[a.tipo])}${a.servicio ? ` (${escapar(a.servicio.nombre)})` : ""}.`,
    `Asunto: ${escapar(a.asunto)}.`,
    `Los datos de contacto y el mensaje están cifrados y se consultan en el gestor de contenidos, sección «Casos».`,
  ]);
  return { subject: `Nuevo caso ${a.numero} en el portal`, ...cuerpo };
}
