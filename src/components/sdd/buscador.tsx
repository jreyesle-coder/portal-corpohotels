import { IconoLupa } from "./iconos";

/**
 * Herramienta de búsqueda. Escritorio: 40 px de alto por 246 px de ancho (A2 3.02.b).
 * El motor de búsqueda (A2 2.01.i.ii) se construye en S6 sobre /buscar.
 */
export function FormularioBusqueda({
  id,
  ancho = "norma",
}: {
  id: string;
  ancho?: "norma" | "completo";
}) {
  return (
    <form
      role="search"
      action="/buscar"
      method="get"
      className={`flex h-[40px] items-center rounded-full border border-borde bg-fondo pl-4 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-foco ${
        ancho === "norma" ? "w-[246px]" : "w-full"
      }`}
      data-medida={ancho === "norma" ? "buscador" : undefined}
    >
      <label htmlFor={id} className="sr-only">
        Buscar en el portal
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder="¿Qué quieres buscar?"
        maxLength={100}
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-texto outline-none placeholder:text-texto-suave"
      />
      <button
        type="submit"
        className="mr-[3px] flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-acento text-sobre-acento"
      >
        <IconoLupa width={18} height={18} strokeWidth={2.5} />
        <span className="sr-only">Buscar</span>
      </button>
    </form>
  );
}
