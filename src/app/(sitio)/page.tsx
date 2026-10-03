import Image from "next/image";
import Link from "next/link";
import { EnlaceExterno } from "@/components/sdd/enlace-externo";
import { TarjetaNoticia } from "@/components/sdd/tarjeta-noticia";
import { comoMedio, listarBanners, listarNoticias, listarServicios, obtenerInstitucion } from "@/sitio/datos";

/**
 * Portada (A2 3.02.e.ii.a, 3.04.b.i): principales servicios, noticias recientes y banners.
 * Sin carruseles automáticos ni reproducción automática (A2 7.01.w).
 */
export default async function Inicio() {
  const [institucion, banners, servicios, noticias] = await Promise.all([
    obtenerInstitucion(),
    listarBanners(),
    listarServicios(true),
    listarNoticias(1, 3),
  ]);
  const [principal, ...secundarios] = banners;

  return (
    <div className="contenedor space-y-12 py-8">
      <h1 className="text-2xl font-bold text-titulo esc:text-3xl">
        {institucion.nombre} ({institucion.siglas})
      </h1>

      {principal && <Banner banner={principal} prioridad />}

      {servicios.length > 0 && (
        <section aria-labelledby="titulo-servicios">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <h2 id="titulo-servicios" className="text-2xl font-semibold text-titulo">
              Servicios
            </h2>
            <Link href="/servicios" className="font-semibold text-primario underline underline-offset-2">
              Ver todos los servicios
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {servicios.slice(0, 8).map((s) => (
              <li key={s.id}>
                <Link
                  href={`/servicios/${s.slug}`}
                  className="flex h-full flex-col gap-2 rounded-lg border border-borde bg-superficie p-5 hover:border-primario"
                >
                  <span className="text-lg font-semibold text-primario">{s.nombre}</span>
                  <span className="line-clamp-3 text-sm text-texto">{s.resumen}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {noticias.docs.length > 0 && (
        <section aria-labelledby="titulo-noticias">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <h2 id="titulo-noticias" className="text-2xl font-semibold text-titulo">
              Noticias recientes
            </h2>
            <Link href="/noticias" className="font-semibold text-primario underline underline-offset-2">
              Ver todas las noticias
            </Link>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {noticias.docs.map((n) => (
              <li key={n.id}>
                <TarjetaNoticia noticia={n} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {secundarios.length > 0 && (
        <section aria-label="Avisos institucionales" className="grid gap-6 lg:grid-cols-2">
          {secundarios.map((b) => (
            <Banner key={b.id} banner={b} />
          ))}
        </section>
      )}
    </div>
  );
}

type DatosBanner = Awaited<ReturnType<typeof listarBanners>>[number];

function Banner({ banner, prioridad = false }: { banner: DatosBanner; prioridad?: boolean }) {
  const imagen = comoMedio(banner.imagen);
  const variante = imagen?.sizes?.completa?.url ? imagen.sizes.completa : imagen;
  const enlace = banner.enlace;
  const contenido = (
    <>
      {variante?.url && (
        <Image
          src={variante.url}
          alt={imagen?.alt ?? ""}
          width={variante.width ?? 1600}
          height={variante.height ?? 512}
          priority={prioridad}
          className="h-auto w-full"
          sizes="(min-width: 1280px) 1232px, 100vw"
        />
      )}
      <span className="flex flex-wrap items-center justify-between gap-2 bg-superficie px-4 py-3">
        <span className="font-semibold text-titulo">{banner.titulo}</span>
        {enlace && <span className="font-semibold text-primario underline underline-offset-2">{banner.textoEnlace}</span>}
      </span>
    </>
  );
  const clase = "block overflow-hidden rounded-lg border border-borde hover:border-primario";
  if (!enlace) return <div className={clase}>{contenido}</div>;
  return enlace.startsWith("/") ? (
    <Link href={enlace} className={clase}>
      {contenido}
    </Link>
  ) : (
    <EnlaceExterno href={enlace} className={clase}>
      {contenido}
    </EnlaceExterno>
  );
}
