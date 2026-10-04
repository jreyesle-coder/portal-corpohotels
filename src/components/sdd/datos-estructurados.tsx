/**
 * Marcado semántico Schema.org en JSON-LD (A2 6.01.l). El JSON se escapa para que ningún texto
 * del CMS pueda cerrar la etiqueta <script>.
 */
export function DatosEstructurados({ datos }: { datos: Record<string, unknown> }) {
  const json = JSON.stringify({ "@context": "https://schema.org", ...datos }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
