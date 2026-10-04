import type { Metadata } from "next";
import Link from "next/link";
import { PlantillaPagina } from "@/components/sdd/plantilla-pagina";
import { RUTA_TRANSPARENCIA, SECCIONES } from "@/contenido/transparencia";
import { contenidoIndexable, obtenerMenu } from "@/sitio/datos";

export const metadata: Metadata = {
  title: "Mapa del sitio",
  description: "Todas las páginas del portal de CORPHOTELS: institución, servicios, transparencia, noticias y contactos.",
};

const enlace = "text-primario underline-offset-2 hover:underline";

/** Mapa del sitio en HTML con enlaces a todas las páginas del portal (A2 6.01.i.i). */
export default async function MapaDelSitio() {
  const [menu, informate, { noticias, servicios }] = await Promise.all([
    obtenerMenu("principal"),
    obtenerMenu("pie-informate"),
    contenidoIndexable(),
  ]);
  const porAnio = new Map<string, typeof noticias>();
  for (const n of noticias) {
    const anio = n.fecha?.slice(0, 4) ?? "Sin fecha";
    porAnio.set(anio, [...(porAnio.get(anio) ?? []), n]);
  }

  return (
    <PlantillaPagina titulo="Mapa del sitio" migas={[{ etiqueta: "Mapa del sitio" }]}>
      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="mapa-portal">
          <h2 id="mapa-portal" className="mb-3 text-xl font-semibold text-titulo">
            Portal
          </h2>
          <ul className="list-disc space-y-1 pl-6">
            {menu.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className={enlace}>
                  {m.etiqueta}
                </Link>
                {m.href === "/servicios" && servicios.length > 0 && (
                  <ul className="mt-1 list-[circle] space-y-1 pl-6">
                    {servicios.map((s) => (
                      <li key={s.slug}>
                        <Link href={`/servicios/${s.slug}`} className={enlace}>
                          {s.nombre}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {m.href === "/contactos" && (
                  <ul className="mt-1 list-[circle] pl-6">
                    <li>
                      <Link href="/contactos/sugerencias" className={enlace}>
                        Quejas, reclamaciones y sugerencias
                      </Link>
                    </li>
                  </ul>
                )}
                {m.hijos && (
                  <ul className="mt-1 list-[circle] space-y-1 pl-6">
                    {m.hijos.map((h) => (
                      <li key={h.href}>
                        <Link href={h.href} className={enlace}>
                          {h.etiqueta}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            {informate.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className={enlace}>
                  {i.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="mapa-transparencia">
          <h2 id="mapa-transparencia" className="mb-3 text-xl font-semibold text-titulo">
            Transparencia
          </h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <Link href={RUTA_TRANSPARENCIA} className={enlace}>
                Inicio Transparencia
              </Link>
            </li>
            {SECCIONES.map((s) => (
              <li key={s.clave}>
                <Link href={`${RUTA_TRANSPARENCIA}/${s.clave}`} className={enlace}>
                  {s.titulo}
                </Link>
                {s.subsecciones && (
                  <ul className="mt-1 list-[circle] space-y-1 pl-6">
                    {s.subsecciones.map((sub) => (
                      <li key={sub.clave}>
                        <Link href={`${RUTA_TRANSPARENCIA}/${s.clave}/${sub.clave}`} className={enlace}>
                          {sub.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="mapa-noticias" className="mt-10">
        <h2 id="mapa-noticias" className="mb-3 text-xl font-semibold text-titulo">
          Noticias
        </h2>
        <div className="space-y-2">
          {[...porAnio].map(([anio, lista]) => (
            <details key={anio} className="rounded-lg border border-borde">
              <summary className="min-h-11 cursor-pointer px-4 py-2 font-semibold">
                {anio} ({lista.length})
              </summary>
              <ul className="list-disc space-y-1 px-4 pb-3 pl-10">
                {lista.map((n) => (
                  <li key={n.slug}>
                    <Link href={`/noticias/${n.slug}`} className={enlace}>
                      {n.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>
    </PlantillaPagina>
  );
}
