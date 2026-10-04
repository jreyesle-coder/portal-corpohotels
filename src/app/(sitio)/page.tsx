import Link from "next/link";
import { BannersInformativos } from "@/components/sdd/banners-informativos";
import { Carrusel } from "@/components/sdd/carrusel";
import { EnlaceExterno } from "@/components/sdd/enlace-externo";
import { enlacesInteres } from "@/contenido/sitio";
import { buscarDestino, PORTALES, RUTA_TRANSPARENCIA } from "@/contenido/transparencia";
import {
  comoMedio,
  documentosRecientes,
  listarBanners,
  listarDiapositivas,
  listarServicios,
  obtenerInstitucion,
  obtenerPortada,
} from "@/sitio/datos";

/** Accesos de la franja de transparencia: lo que más consulta la ciudadanía. */
const ACCESOS_TRANSPARENCIA = [
  { titulo: "Presupuesto", href: `${RUTA_TRANSPARENCIA}/presupuesto` },
  { titulo: "Nómina de empleados", href: `${RUTA_TRANSPARENCIA}/recursos-humanos/nomina` },
  { titulo: "Compras y contrataciones", href: `${RUTA_TRANSPARENCIA}/compras` },
  { titulo: "Finanzas", href: `${RUTA_TRANSPARENCIA}/finanzas` },
  { titulo: "Declaraciones juradas", href: `${RUTA_TRANSPARENCIA}/declaracion-jurada` },
];

const PUBLICACIONES = ["publicaciones", "plan-estrategico/memorias", "plan-estrategico/poa", "plan-estrategico/planificacion", "estadisticas"];

const fecha = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";

/**
 * Portada (A2 3.02.e.ii.a, 3.04.b.i), con la disposición de hacienda.gob.do pedida por TIC:
 * carrusel principal a todo lo ancho y franjas de color de borde a borde con el contenido
 * centrado: transparencia, banners informativos, servicios y publicaciones, e instituciones.
 */
export default async function Inicio() {
  const [institucion, portada, diapositivas, banners, servicios, recientes, publicaciones] = await Promise.all([
    obtenerInstitucion(),
    obtenerPortada(),
    listarDiapositivas(),
    listarBanners(),
    listarServicios(),
    documentosRecientes(null, 4),
    documentosRecientes(PUBLICACIONES, 4),
  ]);
  const instituciones = enlacesInteres.flatMap((s) => (s.seccion === "Ventanillas" ? [] : s.enlaces)).slice(0, 8);

  return (
    <>
      {/* El título de la portada es el nombre de la institución (A2 7.01.m); visualmente lo ocupa el carrusel. */}
      <h1 className="sr-only">
        {institucion.nombre} ({institucion.siglas})
      </h1>

      <Carrusel
        etiqueta="Noticias y avisos destacados"
        automatico={portada.avanceAutomatico}
        segundos={portada.segundos}
        diapositivas={diapositivas.map((d) => ({
          id: d.id,
          titulo: d.titulo,
          enlace: d.enlace,
          textoBoton: d.textoBoton,
          imagen: d.imagen?.url
            ? {
                url: (d.imagen.sizes?.completa?.url ?? d.imagen.url)!,
                alt: d.imagen.alt,
                width: d.imagen.sizes?.completa?.width ?? d.imagen.width ?? 1600,
                height: d.imagen.sizes?.completa?.height ?? d.imagen.height ?? 600,
              }
            : null,
        }))}
      />

      {/* Franja de transparencia (en Hacienda, «Datos fiscales»). */}
      <section aria-labelledby="franja-transparencia" className="bg-primario-claro py-12" data-franja="transparencia">
        <div className="contenedor grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div>
            <h2 id="franja-transparencia" className="text-3xl font-bold text-titulo esc:text-4xl">
              Transparencia
            </h2>
            <p className="mt-3 max-w-md text-lg">
              Consulte el presupuesto, la nómina, las compras y las finanzas de la institución, o solicite información pública.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={RUTA_TRANSPARENCIA}
                className="inline-flex min-h-11 items-center rounded-md bg-primario px-5 font-semibold text-sobre-primario hover:brightness-110"
              >
                Ir a Transparencia
              </Link>
              <EnlaceExterno
                href={PORTALES.saip.url}
                className="inline-flex min-h-11 items-center rounded-md border-2 border-primario px-5 font-semibold text-primario hover:bg-fondo"
              >
                Solicitar información (SAIP)
              </EnlaceExterno>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <nav aria-label="Accesos de transparencia">
              <ul className="grid gap-2">
                {ACCESOS_TRANSPARENCIA.map((a) => (
                  <li key={a.href}>
                    <Link
                      href={a.href}
                      className="flex min-h-12 items-center justify-between rounded-md border-l-4 border-primario bg-fondo px-4 font-semibold text-titulo shadow-sm hover:text-primario"
                    >
                      {a.titulo}
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {recientes.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold tracking-wide text-texto-suave uppercase">Publicado recientemente</h3>
                <ul className="space-y-3">
                  {recientes.map((d) => (
                    <li key={d.id} className="border-b border-borde pb-3">
                      <Link href={buscarDestino(d.seccionTransparencia ?? "")?.ruta ?? RUTA_TRANSPARENCIA} className="font-semibold text-primario hover:underline">
                        {d.titulo}
                      </Link>
                      <p className="text-sm text-texto-suave">
                        {buscarDestino(d.seccionTransparencia ?? "")?.titulo} · {fecha(d.fechaCreacion)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {banners.length > 0 && (
        <section aria-label="Banners informativos" className="py-10">
          <div className="contenedor">
            <BannersInformativos
              banners={banners.map((b) => {
                const imagen = comoMedio(b.imagen);
                const variante = imagen?.sizes?.completa?.url ? imagen.sizes.completa : imagen;
                return {
                  id: b.id,
                  titulo: b.titulo,
                  enlace: b.enlace,
                  textoEnlace: b.textoEnlace,
                  imagen: variante?.url
                    ? { url: variante.url, alt: imagen?.alt ?? "", width: variante.width ?? 1600, height: variante.height ?? 512 }
                    : null,
                };
              })}
            />
          </div>
        </section>
      )}

      {/* Franja de servicios y publicaciones. */}
      <section aria-label="Servicios y publicaciones" className="bg-superficie py-12" data-franja="servicios">
        <div className="contenedor grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-5 text-2xl font-bold text-titulo esc:text-3xl">Servicios</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {servicios.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/servicios/${s.slug}`}
                    className="flex h-full min-h-16 items-center gap-3 rounded-md border-l-4 border-acento bg-fondo p-4 font-semibold text-titulo shadow-sm hover:text-primario"
                  >
                    <IconoServicio />
                    {s.nombre}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/servicios" className="mt-5 inline-block font-semibold text-primario underline underline-offset-2">
              Ver todos los servicios →
            </Link>
          </div>
          <div>
            <h2 className="mb-5 text-2xl font-bold text-titulo esc:text-3xl">Publicaciones</h2>
            {publicaciones.length > 0 ? (
              <ul className="grid gap-3">
                {publicaciones.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={buscarDestino(d.seccionTransparencia ?? "")?.ruta ?? RUTA_TRANSPARENCIA}
                      className="flex min-h-16 items-center gap-3 rounded-md border-l-4 border-acento bg-fondo p-4 shadow-sm hover:text-primario"
                    >
                      <IconoDocumento />
                      <span>
                        <span className="block font-semibold text-titulo">{d.titulo}</span>
                        <span className="text-sm text-texto-suave">{buscarDestino(d.seccionTransparencia ?? "")?.titulo}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Memorias, planes y publicaciones oficiales de la institución.</p>
            )}
            <Link href={`${RUTA_TRANSPARENCIA}/publicaciones`} className="mt-5 inline-block font-semibold text-primario underline underline-offset-2">
              Ver todas las publicaciones →
            </Link>
          </div>
        </div>
      </section>

      {/* Franja oscura de instituciones (en Hacienda, «Conoce nuestras dependencias»), en azul institucional para separarla del pie. */}
      <section aria-labelledby="franja-instituciones" className="bg-primario py-12 text-sobre-primario" data-franja="instituciones">
        <div className="contenedor grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:items-center">
          <h2 id="franja-instituciones" className="text-3xl font-bold">
            Conoce las instituciones relacionadas
          </h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {instituciones.map((e) => (
              <li key={e.url}>
                <EnlaceExterno
                  href={e.url}
                  className="flex h-full flex-col gap-1 rounded-md border border-white/50 p-4 hover:bg-white/10"
                >
                  <span className="text-2xl font-bold">{e.siglas}</span>
                  <span className="text-sm">{e.nombre}</span>
                </EnlaceExterno>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

const IconoServicio = () => (
  <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.8} className="shrink-0 text-primario" aria-hidden focusable={false}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

const IconoDocumento = () => (
  <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.8} className="shrink-0 text-primario" aria-hidden focusable={false}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6M9 14h6M9 17h4" />
  </svg>
);
