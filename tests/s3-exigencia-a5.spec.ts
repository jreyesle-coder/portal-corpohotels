import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

/**
 * Regla de producción (decisión de TIC, novedad N-20): con EXIGIR_FICHA_A5_COMPLETA=1 ningún
 * servicio se publica ni se muestra sin la ficha A5 completa (A2 4.02.b).
 */
test("en producción no se publica ni se muestra un servicio sin ficha A5 completa", () => {
  test.skip(test.info().project.name !== "escritorio", "Una sola ejecución basta");
  const salida = execSync("npx payload run scripts/comprobar-exigencia-a5.ts", {
    env: { ...process.env, EXIGIR_FICHA_A5_COMPLETA: "1" },
    encoding: "utf8",
  });
  expect(salida).toContain("REGLA A5 DE PRODUCCIÓN: CORRECTA");
});
