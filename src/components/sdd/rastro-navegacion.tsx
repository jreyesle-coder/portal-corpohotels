import Link from "next/link";
import { DatosEstructurados } from "./datos-estructurados";

export type Miga = { etiqueta: string; href?: string };

/**
 * Rastro de navegación (A2 2.01.b.iii). Ocupa el panel superior de la división de contenido,
 * reservado únicamente para este elemento (A2 3.02.e.i). La última miga es la página actual.
 */
export function RastroNavegacion({ migas }: { migas: Miga[] }) {
  const todas: Miga[] = [{ etiqueta: "Inicio", href: "/" }, ...migas];
  return (
    <nav aria-label="Rastro de navegación" className="border-b border-borde bg-superficie">
      <DatosEstructurados
        datos={{
          "@type": "BreadcrumbList",
          itemListElement: todas.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: m.etiqueta,
            ...(m.href ? { item: m.href } : {}),
          })),
        }}
      />
      <ol className="contenedor flex flex-wrap items-center gap-x-2 gap-y-1 py-3 text-sm">
        {todas.map((miga, i) => {
          const ultima = i === todas.length - 1;
          return (
            <li key={`${miga.etiqueta}-${i}`} className="flex items-center gap-2">
              {ultima || !miga.href ? (
                <span aria-current={ultima ? "page" : undefined} className="font-semibold text-texto">
                  {miga.etiqueta}
                </span>
              ) : (
                <Link href={miga.href} className="text-primario underline underline-offset-2 hover:no-underline">
                  {miga.etiqueta}
                </Link>
              )}
              {!ultima && (
                <span aria-hidden className="text-texto-suave">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
