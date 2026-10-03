/**
 * Comprueba la regla de producción de la ficha A5 (EXIGIR_FICHA_A5_COMPLETA=1):
 * no se publica un servicio incompleto y el público no ve los incompletos.
 * La ejecuta la prueba automática tests/s3-exigencia-a5.spec.ts con la variable encendida.
 */
import config from "@payload-config";
import { getPayload } from "payload";

if (process.env.EXIGIR_FICHA_A5_COMPLETA !== "1") throw new Error("Ejecutar con EXIGIR_FICHA_A5_COMPLETA=1");
const payload = await getPayload({ config });
const fallas: string[] = [];

// 1. Publicar un servicio incompleto se rechaza.
try {
  const doc = await payload.create({
    collection: "servicios",
    overrideAccess: true,
    data: {
      nombre: "Servicio incompleto de comprobación",
      resumen: "Comprobación automática.",
      contenido: { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children: [] } },
      _status: "published",
    } as never,
  });
  fallas.push("se publicó un servicio con la ficha incompleta");
  await payload.delete({ collection: "servicios", id: doc.id, overrideAccess: true });
} catch (error) {
  if (!String((error as Error).message).includes("ficha A5 completa")) fallas.push(`error inesperado: ${(error as Error).message}`);
}

// 2. El público solo ve servicios con la ficha completa.
const visibles = await payload.find({ collection: "servicios", overrideAccess: false, limit: 500, depth: 0 });
const incompletos = visibles.docs.filter((s) => !s.fichaCompleta).map((s) => s.nombre);
if (incompletos.length > 0) fallas.push(`el público ve servicios incompletos: ${incompletos.join(", ")}`);
if (visibles.docs.length === 0) fallas.push("el público no ve ningún servicio");

console.log(fallas.length === 0 ? "REGLA A5 DE PRODUCCIÓN: CORRECTA" : `REGLA A5 DE PRODUCCIÓN: FALLA\n- ${fallas.join("\n- ")}`);
process.exit(fallas.length === 0 ? 0 : 1);
