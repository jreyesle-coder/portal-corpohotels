/**
 * Evalúa el informe JSON de OWASP ZAP (A8 3.04.4, S7): termina con error si hay alguna alerta de
 * riesgo alto (riskcode 3; ZAP no usa «crítico»). Las medias y bajas se listan para revisión.
 * Uso: node scripts/seguridad/evaluar-zap.mjs <informe.json>
 */
import { readFileSync } from "node:fs";

const archivo = process.argv[2];
if (!archivo) {
  console.error("Indique el informe JSON de ZAP.");
  process.exit(2);
}
const informe = JSON.parse(readFileSync(archivo, "utf8"));
const alertas = (informe.site ?? []).flatMap((s) => s.alerts ?? []);
const nombres = { 3: "ALTA", 2: "Media", 1: "Baja", 0: "Informativa" };
for (const a of [...alertas].sort((x, y) => Number(y.riskcode) - Number(x.riskcode))) {
  console.log(`${nombres[a.riskcode] ?? a.riskcode}\t${a.pluginid}\t${a.name} (${a.count ?? a.instances?.length ?? 0} casos)`);
}
const altas = alertas.filter((a) => Number(a.riskcode) >= 3);
if (altas.length) {
  console.error(`\n${altas.length} alerta(s) de riesgo alto: el pipeline se detiene.`);
  process.exit(1);
}
console.log(`\nSin alertas de riesgo alto (${alertas.length} alertas en total).`);
