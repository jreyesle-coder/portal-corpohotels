"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { enviarEncuesta, type ResultadoEncuesta, type ResultadoEnvio } from "@/formularios/acciones";
import { Alerta, Boton } from "./base";

export type ContactoInstitucion = { telefono: string; correo: string | null; otrasVias?: string | null };

type Enviado = Extract<ResultadoEnvio, { estado: "enviado" }>;

/**
 * Confirmación inmediata tras enviar (A2 2.01.b.x para trámites, 2.01.b.xi para sugerencias):
 * número de caso, tiempo de respuesta, vías por las que se contactará al usuario, vías para
 * contactar al organismo y enlace a la política de privacidad. Termina con la encuesta (5.04.1).
 */
export function Confirmacion({ resultado, institucion }: { resultado: Enviado; institucion: ContactoInstitucion }) {
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => titulo.current?.focus(), []);
  const esSolicitud = resultado.tipo === "solicitud";

  return (
    <div className="max-w-2xl space-y-6" data-confirmacion>
      <div role="status" className="space-y-4 rounded-lg border-l-4 border-[#146c2e] bg-[#e7f4ea] p-5 text-[#0f5223] contraste:border-white contraste:bg-black contraste:text-white">
        <h2 ref={titulo} tabIndex={-1} className="text-xl font-bold outline-none">
          {esSolicitud ? "Recibimos su solicitud" : resultado.tipo === "sugerencia" ? "Recibimos su comentario" : "Recibimos su mensaje"}
        </h2>
        <p>
          Su número de caso es{" "}
          <strong className="text-lg" data-numero-caso>
            {resultado.numero}
          </strong>
          . Consérvelo para cualquier consulta.
        </p>
      </div>

      <dl className="space-y-4">
        <div>
          <dt className="font-semibold text-titulo">{esSolicitud ? "Tiempo de entrega del resultado" : "Tiempo de respuesta"}</dt>
          <dd>{resultado.tiempo}</dd>
        </div>
        <div>
          <dt className="font-semibold text-titulo">Cómo le contactaremos</dt>
          <dd>
            Por correo electrónico a <strong>{resultado.correo}</strong>
            {esSolicitud ? " y por el teléfono que nos indicó" : ""}, para informarle el estado de su caso.
            {resultado.correoEnviado
              ? " Ya le enviamos un correo con esta información."
              : " No pudimos enviarle el correo de confirmación en este momento; anote su número de caso."}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-titulo">Cómo consultar su caso</dt>
          <dd>
            Llame al{" "}
            <a href={`tel:+1${institucion.telefono.replace(/\D/g, "")}`} className="text-primario underline">
              {institucion.telefono}
            </a>
            {institucion.correo && (
              <>
                {" "}
                o escriba a{" "}
                <a href={`mailto:${institucion.correo}?subject=${encodeURIComponent(`Caso ${resultado.numero}`)}`} className="text-primario underline">
                  {institucion.correo}
                </a>
              </>
            )}{" "}
            indicando su número de caso.
            {institucion.otrasVias && <> {institucion.otrasVias}</>}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-titulo">Privacidad</dt>
          <dd>
            Sus datos se guardan cifrados y se usan solo para atender su caso. Lea nuestra{" "}
            <Link href="/politica-de-privacidad" className="text-primario underline">
              Política de privacidad
            </Link>
            .
          </dd>
        </div>
      </dl>

      <Encuesta tipo={resultado.tipo} servicioId={resultado.servicio?.id} />

      <p>
        <Link href={resultado.servicio ? `/servicios/${resultado.servicio.slug}` : "/"} className="font-semibold text-primario underline">
          {resultado.servicio ? `Volver a ${resultado.servicio.nombre}` : "Volver al inicio"}
        </Link>
      </p>
    </div>
  );
}

function Encuesta({ tipo, servicioId }: { tipo: string; servicioId?: number }) {
  const [estado, accion, enviando] = useActionState<ResultadoEncuesta, FormData>(enviarEncuesta, { estado: "inicial" });
  if (estado.estado === "enviada") {
    return (
      <Alerta tipo="exito" titulo="Gracias por su opinión">
        Su respuesta nos ayuda a mejorar el portal y nuestros servicios.
      </Alerta>
    );
  }
  return (
    <form action={accion} method="post" className="space-y-4 rounded-lg border border-borde bg-superficie p-5" aria-labelledby="titulo-encuesta">
      <h2 id="titulo-encuesta" className="text-lg font-semibold text-titulo">
        Encuesta de satisfacción (opcional, anónima)
      </h2>
      <input type="hidden" name="tipo" value={tipo} />
      {servicioId && <input type="hidden" name="servicio" value={servicioId} />}
      {estado.estado === "error" && <Alerta tipo="error">{estado.mensaje}</Alerta>}
      <fieldset>
        <legend className="mb-2 font-semibold">¿Qué tan satisfecho quedó con este proceso? (1 = nada, 5 = mucho)</legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-borde bg-fondo px-3">
              <input type="radio" name="calificacion" value={n} required className="size-4" />
              {n}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 font-semibold">¿Le resultó fácil completar el formulario?</legend>
        <div className="flex gap-2">
          {[
            ["si", "Sí"],
            ["no", "No"],
          ].map(([v, t]) => (
            <label key={v} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-borde bg-fondo px-3">
              <input type="radio" name="facilidad" value={v} className="size-4" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="space-y-1">
        <label htmlFor="comentario-encuesta" className="block font-semibold">
          Comentario <span className="font-normal text-texto-suave">(opcional)</span>
        </label>
        <textarea
          id="comentario-encuesta"
          name="comentario"
          maxLength={500}
          rows={3}
          aria-describedby="limite-encuesta"
          className="block w-full rounded-md border border-texto-suave bg-fondo px-3 py-2"
        />
        <p id="limite-encuesta" className="text-xs text-texto-suave">
          Máximo 500 caracteres. No escriba datos personales.
        </p>
      </div>
      <Boton type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar encuesta"}
      </Boton>
    </form>
  );
}
