import type { Metadata } from "next";
import { EnlaceExterno } from "@/components/sdd/enlace-externo";
import { PlantillaPagina } from "@/components/sdd/plantilla-pagina";
import { obtenerInstitucion } from "@/sitio/datos";

export const metadata: Metadata = {
  title: "Contactos",
  description: "Dirección, teléfono, correo electrónico y ubicación en el mapa de la sede de CORPHOTELS.",
};

/**
 * Contactos (A2 4.02): dirección, apartado postal, mapa, teléfono y correo. El mapa es de
 * OpenStreetMap, sin cookies de rastreo. El formulario de contacto se incorpora en S3.
 */
export default async function Contactos() {
  const i = await obtenerInstitucion();
  const mapa = i.mapa;
  const d = 0.004;
  const urlMapa = mapa
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapa.longitud - d},${mapa.latitud - d / 2},${mapa.longitud + d},${mapa.latitud + d / 2}&layer=mapnik&marker=${mapa.latitud},${mapa.longitud}`
    : null;

  return (
    <PlantillaPagina titulo="Contactos" migas={[{ etiqueta: "Contactos" }]}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <dl className="space-y-4">
          <div>
            <dt className="font-semibold text-titulo">Dirección</dt>
            <dd>
              <address className="not-italic">{i.direccion}</address>
            </dd>
          </div>
          {i.apartadoPostal && (
            <div>
              <dt className="font-semibold text-titulo">Apartado postal</dt>
              <dd>{i.apartadoPostal}</dd>
            </div>
          )}
          <div>
            <dt className="font-semibold text-titulo">Teléfono</dt>
            <dd>
              <a href={`tel:+1${i.telefono.replace(/\D/g, "")}`} className="text-primario underline underline-offset-2">
                {i.telefono}
              </a>
            </dd>
          </div>
          {i.fax && (
            <div>
              <dt className="font-semibold text-titulo">Fax</dt>
              <dd>{i.fax}</dd>
            </div>
          )}
          {i.correo && (
            <div>
              <dt className="font-semibold text-titulo">Correo electrónico</dt>
              <dd>
                <a href={`mailto:${i.correo}`} className="text-primario underline underline-offset-2">
                  {i.correo}
                </a>
              </dd>
            </div>
          )}
          {i.horario && (
            <div>
              <dt className="font-semibold text-titulo">Horario de atención</dt>
              <dd>{i.horario}</dd>
            </div>
          )}
        </dl>

        {urlMapa && mapa && (
          <figure>
            <iframe
              title={`Mapa de la ubicación de la sede de ${i.siglas}`}
              src={urlMapa}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="aspect-[4/3] w-full rounded-lg border border-borde"
            />
            <figcaption className="mt-2 text-sm">
              <EnlaceExterno
                href={`https://www.openstreetmap.org/?mlat=${mapa.latitud}&mlon=${mapa.longitud}#map=18/${mapa.latitud}/${mapa.longitud}`}
                className="text-primario underline underline-offset-2"
              >
                Ver la ubicación en un mapa más grande
              </EnlaceExterno>
            </figcaption>
          </figure>
        )}
      </div>
    </PlantillaPagina>
  );
}
