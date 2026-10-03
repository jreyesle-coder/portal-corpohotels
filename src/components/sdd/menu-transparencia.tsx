import Link from "next/link";
import { GRUPOS_MOVIL, RUTA_TRANSPARENCIA, SECCIONES } from "@/contenido/transparencia";
import { IconoChevron } from "./iconos";

const enlace = (activo: boolean) =>
  `-ml-0.5 block border-l-[3px] py-2 pl-4 hover:text-primario ${
    activo ? "border-primario font-semibold text-primario" : "border-transparent text-texto"
  }`;

const resumen =
  "flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 py-2 pl-4 pr-2 hover:text-primario [&::-webkit-details-marker]:hidden";

function Chevron() {
  return <IconoChevron width={18} height={18} aria-hidden className="shrink-0 transition-transform group-open:rotate-180" />;
}

/**
 * Menú vertical de la sección de transparencia en el panel izquierdo (A2 3.02.h), del tipo
 * «expandido»: el nivel II se despliega hacia abajo al hacer clic en el nivel I, en una sola columna,
 * y se vuelve a contraer al accionarlo (3.02.h.b). Usa <details>: funciona sin JavaScript y con teclado.
 */
export function MenuTransparencia({ actual }: { actual: string }) {
  return (
    <nav aria-label="Menú de transparencia" className="hidden esc:block print:hidden" data-menu-transparencia="escritorio">
      <h2 className="mb-2 text-sm font-semibold tracking-wide text-texto-suave uppercase">Transparencia</h2>
      <ul className="border-l-2 border-borde">
        <li>
          <Link href={RUTA_TRANSPARENCIA} aria-current={actual === RUTA_TRANSPARENCIA ? "page" : undefined} className={enlace(actual === RUTA_TRANSPARENCIA)}>
            Inicio Transparencia
          </Link>
        </li>
        {SECCIONES.map((s) => {
          const ruta = `${RUTA_TRANSPARENCIA}/${s.clave}`;
          const dentro = actual === ruta || actual.startsWith(`${ruta}/`);
          if (!s.subsecciones?.length) {
            return (
              <li key={s.clave}>
                <Link href={ruta} aria-current={dentro ? "page" : undefined} className={enlace(dentro)}>
                  {s.titulo}
                </Link>
              </li>
            );
          }
          return (
            <li key={s.clave}>
              <details open={dentro} className="group">
                <summary className={`${resumen} -ml-0.5 border-l-[3px] ${dentro ? "border-primario font-semibold text-primario" : "border-transparent"}`}>
                  {s.titulo}
                  <Chevron />
                </summary>
                <ul className="mb-2 ml-4 border-l border-borde">
                  {s.subsecciones.map((sub) => {
                    const rutaSub = `${ruta}/${sub.clave}`;
                    return (
                      <li key={sub.clave}>
                        <Link href={rutaSub} aria-current={actual === rutaSub ? "page" : undefined} className={`${enlace(actual === rutaSub)} text-sm`}>
                          {sub.titulo}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Menú de transparencia en móvil: cinco grupos y Contactos (A2 4.04), desplegables hacia abajo hasta
 * el nivel II (3.04.a.iv–v). El nivel III se presenta como menú de archivos dentro de cada sección.
 */
export function MenuTransparenciaMovil({ actual }: { actual: string }) {
  return (
    <nav aria-label="Menú de transparencia" className="mb-6 esc:hidden print:hidden" data-menu-transparencia="movil">
      <details className="group/menu rounded-lg border border-borde bg-superficie">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 font-semibold text-titulo [&::-webkit-details-marker]:hidden">
          Menú de transparencia
          <IconoChevron width={20} height={20} aria-hidden className="transition-transform group-open/menu:rotate-180" />
        </summary>
        <ul className="border-t border-borde pb-2">
          <li>
            <Link href={RUTA_TRANSPARENCIA} aria-current={actual === RUTA_TRANSPARENCIA ? "page" : undefined} className="flex min-h-11 items-center px-4 hover:text-primario">
              Inicio Transparencia
            </Link>
          </li>
          {GRUPOS_MOVIL.map((g) =>
            g.elementos ? (
              <li key={g.titulo}>
                <details className="group" open={g.elementos.some((e) => actual === e.href || actual.startsWith(`${e.href}/`))}>
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 hover:text-primario [&::-webkit-details-marker]:hidden">
                    {g.titulo}
                    <Chevron />
                  </summary>
                  <ul className="ml-4 border-l border-borde">
                    {g.elementos.map((e) => (
                      <li key={e.href}>
                        <Link href={e.href} aria-current={actual === e.href ? "page" : undefined} className="flex min-h-11 items-center pl-4 text-sm hover:text-primario">
                          {e.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ) : (
              <li key={g.titulo}>
                <Link href={g.href!} className="flex min-h-11 items-center px-4 hover:text-primario">
                  {g.titulo}
                </Link>
              </li>
            ),
          )}
        </ul>
      </details>
    </nav>
  );
}
