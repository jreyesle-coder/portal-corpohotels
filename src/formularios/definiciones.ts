/**
 * Definición única de los formularios del portal. La usan el navegador (validación previa,
 * A2 2.01.b.viii) y el servidor (validación definitiva), así que las reglas no se desalinean.
 * Cada campo declara si es obligatorio (2.01.b.vii) y su límite de caracteres (2.01.b.ix).
 */
export type TipoFormulario = "contacto" | "sugerencia" | "solicitud";

export type Campo = {
  nombre: "nombre" | "correo" | "telefono" | "cedula" | "asunto" | "tipoComentario" | "mensaje";
  etiqueta: string;
  tipo: "text" | "email" | "tel" | "textarea" | "select";
  requerido: boolean;
  maximo: number;
  ayuda?: string;
  autocompletar?: string;
  patron?: { regex: string; mensaje: string };
  opciones?: { valor: string; etiqueta: string }[];
};

export type Paso = { titulo: string; campos: Campo[] };

export type Definicion = {
  titulo: string;
  /** Guía de uso al inicio del proceso (A2 2.01.i.i). */
  guia: string[];
  pasos: Paso[];
};

const nombre: Campo = {
  nombre: "nombre",
  etiqueta: "Nombre completo",
  tipo: "text",
  requerido: true,
  maximo: 120,
  autocompletar: "name",
};
const correo: Campo = {
  nombre: "correo",
  etiqueta: "Correo electrónico",
  tipo: "email",
  requerido: true,
  maximo: 120,
  autocompletar: "email",
  ayuda: "Le enviaremos aquí el número de caso y las respuestas.",
  patron: { regex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$", mensaje: "Escriba un correo con el formato nombre@dominio.com." },
};
const telefono = (requerido: boolean): Campo => ({
  nombre: "telefono",
  etiqueta: "Teléfono",
  tipo: "tel",
  requerido,
  maximo: 20,
  autocompletar: "tel",
  ayuda: "Por ejemplo: 809-555-1234.",
  patron: { regex: "^[0-9+()\\-\\s]{7,20}$", mensaje: "Escriba solo números, espacios, guiones o paréntesis." },
});
const mensaje = (etiqueta: string, ayuda: string): Campo => ({
  nombre: "mensaje",
  etiqueta,
  tipo: "textarea",
  requerido: true,
  maximo: 2000,
  ayuda,
});

export const FORMULARIOS: Record<TipoFormulario, Definicion> = {
  contacto: {
    titulo: "Escríbanos",
    guia: [
      "Complete 2 pasos: sus datos de contacto y su mensaje.",
      "Toma unos 3 minutos. Los campos marcados con * son obligatorios.",
      "Al enviar, recibirá un número de caso en pantalla y por correo electrónico.",
    ],
    pasos: [
      { titulo: "Sus datos", campos: [nombre, correo, telefono(false)] },
      {
        titulo: "Su mensaje",
        campos: [
          { nombre: "asunto", etiqueta: "Asunto", tipo: "text", requerido: true, maximo: 150 },
          mensaje("Mensaje", "Explique en qué podemos ayudarle. Máximo 2000 caracteres."),
        ],
      },
    ],
  },
  sugerencia: {
    titulo: "Quejas y sugerencias",
    guia: [
      "Complete 2 pasos: sus datos de contacto y su comentario.",
      "Toma unos 3 minutos. Los campos marcados con * son obligatorios.",
      "Al enviar, recibirá un número de caso en pantalla y por correo electrónico.",
    ],
    pasos: [
      { titulo: "Sus datos", campos: [nombre, correo, telefono(false)] },
      {
        titulo: "Su comentario",
        campos: [
          {
            nombre: "tipoComentario",
            etiqueta: "Tipo de comentario",
            tipo: "select",
            requerido: true,
            maximo: 20,
            opciones: [
              { valor: "sugerencia", etiqueta: "Sugerencia" },
              { valor: "queja", etiqueta: "Queja" },
              { valor: "felicitacion", etiqueta: "Felicitación" },
            ],
          },
          mensaje("Comentario", "Describa su sugerencia, queja o felicitación. Máximo 2000 caracteres."),
        ],
      },
    ],
  },
  solicitud: {
    titulo: "Solicitud del servicio",
    guia: [
      "Complete 2 pasos: sus datos y el detalle de su solicitud.",
      "Tenga a mano su cédula. Toma unos 5 minutos. Los campos marcados con * son obligatorios.",
      "Al enviar, recibirá un número de caso, el tiempo de respuesta y las vías de contacto, en pantalla y por correo.",
    ],
    pasos: [
      {
        titulo: "Sus datos",
        campos: [
          nombre,
          {
            nombre: "cedula",
            etiqueta: "Cédula de identidad",
            tipo: "text",
            requerido: true,
            maximo: 13,
            autocompletar: "off",
            ayuda: "Formato: 000-0000000-0.",
            patron: { regex: "^\\d{3}-?\\d{7}-?\\d$", mensaje: "Escriba la cédula con el formato 000-0000000-0." },
          },
          correo,
          telefono(true),
        ],
      },
      {
        titulo: "Su solicitud",
        campos: [mensaje("Detalle de la solicitud", "Indique qué necesita y cualquier dato que ayude a atenderle. Máximo 2000 caracteres.")],
      },
    ],
  },
};

/** Texto del consentimiento que el ciudadano acepta y que se guarda con el caso (Ley 172-13). */
export const TEXTO_CONSENTIMIENTO =
  "Autorizo a CORPHOTELS a usar los datos de este formulario solo para atender mi caso y comunicarme su estado, conforme a la Ley 172-13 de Protección de Datos Personales y a la Política de privacidad del portal.";

export type ErroresCampos = Partial<Record<Campo["nombre"] | "consentimiento", string>>;

/** Valida un campo con las mismas reglas en el navegador y en el servidor. */
export function validarCampo(campo: Campo, valor: string): string | undefined {
  const v = valor.trim();
  if (!v) return campo.requerido ? `Complete el campo «${campo.etiqueta}».` : undefined;
  if (v.length > campo.maximo) return `«${campo.etiqueta}» admite hasta ${campo.maximo} caracteres.`;
  if (campo.patron && !new RegExp(campo.patron.regex).test(v)) return campo.patron.mensaje;
  if (campo.opciones && !campo.opciones.some((o) => o.valor === v)) return `Elija una opción de «${campo.etiqueta}».`;
  return undefined;
}

export function camposDe(tipo: TipoFormulario): Campo[] {
  return FORMULARIOS[tipo].pasos.flatMap((p) => p.campos);
}
