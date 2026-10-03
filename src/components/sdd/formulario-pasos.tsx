"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { enviarFormulario, type ResultadoEnvio } from "@/formularios/acciones";
import {
  type Campo,
  type ErroresCampos,
  FORMULARIOS,
  TEXTO_CONSENTIMIENTO,
  type TipoFormulario,
  validarCampo,
} from "@/formularios/definiciones";
import { Alerta, Boton } from "./base";
import { Confirmacion, type ContactoInstitucion } from "./confirmacion";
import { IconoInfo } from "./iconos";

/**
 * Formulario por pasos (A2 2.01.b.vi–ix, 2.01.i.i, 7.01.c, 7.01.g, 7.01.x):
 * guía de uso al inicio, indicador de etapa, obligatorios marcados en texto, validación previa con
 * errores escritos, límite y contador de caracteres, revisión antes de enviar y opción de cancelar.
 * Se envía por POST con una acción de servidor.
 */
export function FormularioPasos({
  tipo,
  servicio,
  urlCancelar,
  institucion,
}: {
  tipo: TipoFormulario;
  servicio?: { slug: string; nombre: string };
  urlCancelar: string;
  institucion: ContactoInstitucion;
}) {
  const definicion = FORMULARIOS[tipo];
  const total = definicion.pasos.length + 1;
  const [resultado, accion, enviando] = useActionState<ResultadoEnvio, FormData>(enviarFormulario, { estado: "inicial" });
  const [paso, setPaso] = useState(0);
  const [errores, setErrores] = useState<ErroresCampos>({});
  const [resumen, setResumen] = useState<{ etiqueta: string; valor: string }[]>([]);
  const formulario = useRef<HTMLFormElement>(null);
  const encabezado = useRef<HTMLHeadingElement>(null);
  const [resultadoPrevio, setResultadoPrevio] = useState(resultado);

  // Errores del servidor: se muestran y se vuelve al primer paso con un error.
  if (resultado !== resultadoPrevio) {
    setResultadoPrevio(resultado);
    if (resultado.estado === "error") {
      setErrores(resultado.errores);
      const conError = definicion.pasos.findIndex((p) => p.campos.some((c) => resultado.errores[c.nombre]));
      setPaso(conError >= 0 ? conError : total - 1);
    }
  }

  useEffect(() => {
    encabezado.current?.focus();
  }, [paso]);

  if (resultado.estado === "enviado") {
    return <Confirmacion resultado={resultado} institucion={institucion} />;
  }

  const valor = (nombre: string) => String(new FormData(formulario.current ?? undefined).get(nombre) ?? "");

  const validarPaso = (indice: number) => {
    const nuevos: ErroresCampos = {};
    for (const campo of definicion.pasos[indice].campos) {
      const error = validarCampo(campo, valor(campo.nombre));
      if (error) nuevos[campo.nombre] = error;
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) {
      const primero = definicion.pasos[indice].campos.find((c) => nuevos[c.nombre]);
      requestAnimationFrame(() => document.getElementById(`campo-${primero?.nombre}`)?.focus());
      return false;
    }
    return true;
  };

  const siguiente = () => {
    if (!validarPaso(paso)) return;
    if (paso + 1 === definicion.pasos.length) {
      setResumen(
        definicion.pasos.flatMap((p) =>
          p.campos.map((c) => {
            const v = valor(c.nombre);
            return { etiqueta: c.etiqueta, valor: c.opciones?.find((o) => o.valor === v)?.etiqueta ?? (v || "—") };
          }),
        ),
      );
    }
    setPaso(paso + 1);
  };

  const enviar = (evento: React.FormEvent<HTMLFormElement>) => {
    if (!new FormData(evento.currentTarget).get("consentimiento")) {
      evento.preventDefault();
      setErrores({ consentimiento: "Debe aceptar el uso de sus datos para que podamos atender su caso." });
      requestAnimationFrame(() => document.getElementById("campo-consentimiento")?.focus());
    }
  };

  const titulosPasos = [...definicion.pasos.map((p) => p.titulo), "Revisar y enviar"];
  const listaErrores = Object.entries(errores).filter(([, e]) => e);

  return (
    <div className="max-w-2xl space-y-6" data-formulario={tipo}>
      <aside aria-label="Antes de empezar" className="flex gap-3 rounded-lg border border-borde bg-primario-claro p-4">
        <IconoInfo width={22} height={22} className="mt-0.5 shrink-0 text-primario" />
        <div>
          <h2 className="font-semibold text-titulo">Antes de empezar</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {definicion.guia.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      </aside>

      <ol aria-label="Progreso del formulario" className="flex flex-wrap gap-2 text-sm">
        {titulosPasos.map((t, i) => (
          <li
            key={t}
            aria-current={i === paso ? "step" : undefined}
            className={`rounded-full border px-3 py-1 ${
              i === paso
                ? "border-primario bg-primario font-semibold text-sobre-primario"
                : i < paso
                  ? "border-primario text-primario"
                  : "border-borde text-texto-suave"
            }`}
          >
            {i + 1}. {t}
            {i < paso && <span className="sr-only"> (completado)</span>}
          </li>
        ))}
      </ol>

      <form ref={formulario} action={accion} onSubmit={enviar} noValidate className="space-y-5" method="post">
        <h2 ref={encabezado} tabIndex={-1} className="text-xl font-semibold text-titulo outline-none">
          Paso {paso + 1} de {total}: {titulosPasos[paso]}
        </h2>

        {listaErrores.length > 0 && (
          <Alerta tipo="error" titulo={`Hay ${listaErrores.length === 1 ? "un campo" : `${listaErrores.length} campos`} por corregir`}>
            <ul className="list-disc pl-5">
              {listaErrores.map(([nombre, e]) => (
                <li key={nombre}>
                  <a href={`#campo-${nombre}`} className="underline">
                    {e}
                  </a>
                </li>
              ))}
            </ul>
          </Alerta>
        )}
        {resultado.estado === "error" && listaErrores.length === 0 && <Alerta tipo="error">{resultado.mensaje}</Alerta>}

        <p className="text-sm text-texto-suave">Los campos marcados con * son obligatorios.</p>

        <input type="hidden" name="tipo" value={tipo} />
        {servicio && <input type="hidden" name="servicio" value={servicio.slug} />}
        {/* Campo trampa contra envíos automatizados: oculto para las personas y los lectores de pantalla. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="sitio_web">No llene este campo</label>
          <input id="sitio_web" name="sitio_web" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {definicion.pasos.map((p, i) => (
          <fieldset key={p.titulo} hidden={i !== paso} className="space-y-5">
            <legend className="sr-only">{p.titulo}</legend>
            {p.campos.map((c) => (
              <CampoFormulario
                key={`${c.nombre}-${resultadoPrevio.estado}`}
                campo={c}
                error={errores[c.nombre]}
                valorInicial={resultado.estado === "error" ? resultado.valores[c.nombre] : undefined}
              />
            ))}
          </fieldset>
        ))}

        {paso === total - 1 && (
          <div className="space-y-5">
            <dl className="divide-y divide-borde rounded-lg border border-borde" aria-label="Datos que va a enviar">
              {resumen.map((r) => (
                <div key={r.etiqueta} className="grid gap-1 p-3 sm:grid-cols-[12rem_1fr]">
                  <dt className="font-semibold">{r.etiqueta}</dt>
                  <dd className="whitespace-pre-line">{r.valor}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-1">
              <div className="flex items-start gap-3">
                <input
                  id="campo-consentimiento"
                  name="consentimiento"
                  type="checkbox"
                  value="si"
                  required
                  aria-invalid={errores.consentimiento ? true : undefined}
                  aria-describedby={errores.consentimiento ? "error-consentimiento" : undefined}
                  className="mt-1 size-5 shrink-0 accent-[var(--primario)]"
                />
                <label htmlFor="campo-consentimiento">
                  {TEXTO_CONSENTIMIENTO}{" "}
                  <Link href="/politica-de-privacidad" target="_blank" className="font-semibold text-primario underline">
                    Leer la Política de privacidad<span className="sr-only"> (abre en una pestaña nueva)</span>
                  </Link>
                  <span aria-hidden className="text-[#b3261e] contraste:text-white"> *</span>
                  <span className="sr-only"> (obligatorio)</span>
                </label>
              </div>
              {errores.consentimiento && (
                <p id="error-consentimiento" className="text-sm font-semibold text-[#b3261e] contraste:text-white">
                  Error: {errores.consentimiento}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-borde pt-5">
          {paso > 0 && (
            <Boton variante="secundario" onClick={() => setPaso(paso - 1)}>
              Anterior
            </Boton>
          )}
          {paso < total - 1 ? (
            <Boton onClick={siguiente}>Siguiente</Boton>
          ) : (
            <Boton type="submit" disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar"}
            </Boton>
          )}
          <Link href={urlCancelar} className="ml-auto font-semibold text-primario underline underline-offset-2">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

function CampoFormulario({ campo, error, valorInicial }: { campo: Campo; error?: string; valorInicial?: string }) {
  const id = `campo-${campo.nombre}`;
  const [largo, setLargo] = useState(valorInicial?.length ?? 0);
  const descritoPor = [campo.ayuda && `${id}-ayuda`, `${id}-limite`, error && `${id}-error`].filter(Boolean).join(" ");
  const comunes = {
    id,
    name: campo.nombre,
    required: campo.requerido,
    maxLength: campo.maximo,
    defaultValue: valorInicial,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": descritoPor,
    autoComplete: campo.autocompletar,
    className: `block min-h-11 w-full rounded-md border bg-fondo px-3 py-2 text-texto ${error ? "border-2 border-[#b3261e]" : "border-texto-suave"}`,
  };
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block font-semibold">
        {campo.etiqueta}
        {campo.requerido ? (
          <>
            <span aria-hidden className="text-[#b3261e] contraste:text-white"> *</span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        ) : (
          <span className="font-normal text-texto-suave"> (opcional)</span>
        )}
      </label>
      {campo.ayuda && (
        <p id={`${id}-ayuda`} className="text-sm text-texto-suave">
          {campo.ayuda}
        </p>
      )}
      {campo.tipo === "textarea" ? (
        <textarea {...comunes} rows={6} onChange={(e) => setLargo(e.target.value.length)} />
      ) : campo.tipo === "select" ? (
        <select {...comunes} defaultValue={valorInicial ?? ""}>
          <option value="">Elija una opción</option>
          {campo.opciones?.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      ) : (
        <input {...comunes} type={campo.tipo} inputMode={campo.tipo === "tel" ? "tel" : undefined} />
      )}
      <p id={`${id}-limite`} className="text-xs text-texto-suave">
        {campo.tipo === "textarea" ? `${largo} de ${campo.maximo} caracteres` : `Máximo ${campo.maximo} caracteres`}
      </p>
      {error && (
        <p id={`${id}-error`} className="text-sm font-semibold text-[#b3261e] contraste:text-white">
          Error: {error}
        </p>
      )}
    </div>
  );
}
