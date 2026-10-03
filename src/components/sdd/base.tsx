import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { IconoAdvertencia, IconoError, IconoExito, IconoInfo } from "./iconos";

/*
 * Componentes base del SDD (A2 1.06.a.iii, 2.01.f): botones, alertas, destacados y campos.
 * Encabezados, enlaces, texto y listas se estilan en `Prosa`.
 */

type VarianteBoton = "primario" | "secundario" | "texto";

const clasesBoton: Record<VarianteBoton, string> = {
  primario: "bg-primario text-sobre-primario hover:brightness-110",
  secundario: "border-2 border-primario text-primario hover:bg-primario-claro",
  texto: "text-primario underline underline-offset-2 hover:no-underline",
};

export function Boton({
  variante = "primario",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: VarianteBoton }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md px-5 font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${clasesBoton[variante]} ${className}`}
      {...props}
    />
  );
}

type TipoAlerta = "info" | "exito" | "advertencia" | "error";

const alertas: Record<TipoAlerta, { clase: string; Icono: typeof IconoInfo; titulo: string }> = {
  info: { clase: "border-[#0f539c] bg-[#e8f0fa] text-[#0b3f77]", Icono: IconoInfo, titulo: "Información" },
  exito: { clase: "border-[#146c2e] bg-[#e7f4ea] text-[#0f5223]", Icono: IconoExito, titulo: "Éxito" },
  advertencia: { clase: "border-[#8a6100] bg-[#fff4d6] text-[#5c4100]", Icono: IconoAdvertencia, titulo: "Advertencia" },
  error: { clase: "border-[#b3261e] bg-[#fce8e6] text-[#8c1d17]", Icono: IconoError, titulo: "Error" },
};

/**
 * Alerta con ícono y tipo escrito en texto: la información no depende solo del color (A2 7.01.f–g).
 * Los errores se anuncian de inmediato (role="alert"); el resto, de forma cortés.
 */
export function Alerta({ tipo = "info", titulo, children }: { tipo?: TipoAlerta; titulo?: string; children: ReactNode }) {
  const { clase, Icono, titulo: tituloTipo } = alertas[tipo];
  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      className={`flex gap-3 rounded-md border-l-4 p-4 contraste:border-white contraste:bg-black contraste:text-white ${clase}`}
    >
      <Icono width={22} height={22} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold">{titulo ?? tituloTipo}</p>
        <div>{children}</div>
      </div>
    </div>
  );
}

/** Bloque destacado para información relevante dentro del contenido. */
export function Destacado({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <aside className="rounded-lg border border-borde bg-primario-claro p-5">
      <h3 className="mb-1 text-lg font-semibold text-primario">{titulo}</h3>
      <div className="text-texto">{children}</div>
    </aside>
  );
}

/**
 * Campo de formulario con etiqueta visible, marca de obligatorio en texto, ayuda y error asociados
 * (A2 7.01.c, 7.01.p, 2.01.b.vii–ix).
 */
export function Campo({
  id,
  etiqueta,
  ayuda,
  error,
  required,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; etiqueta: string; ayuda?: string; error?: string }) {
  const descritoPor = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block font-semibold">
        {etiqueta}
        {required && (
          <>
            <span aria-hidden className="text-[#b3261e] contraste:text-white"> *</span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        )}
      </label>
      {ayuda && (
        <p id={`${id}-ayuda`} className="text-sm text-texto-suave">
          {ayuda}
        </p>
      )}
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={descritoPor}
        className={`block min-h-11 w-full rounded-md border bg-fondo px-3 text-texto ${error ? "border-[#b3261e] border-2" : "border-texto-suave"}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm font-semibold text-[#b3261e] contraste:text-white">
          Error: {error}
        </p>
      )}
    </div>
  );
}

/** Estilos de texto del contenido: encabezados h1–h6, párrafos, enlaces y listas. */
export function Prosa({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl space-y-4 leading-relaxed [&_a]:text-primario [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:no-underline [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-titulo [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-titulo [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1">
      {children}
    </div>
  );
}
