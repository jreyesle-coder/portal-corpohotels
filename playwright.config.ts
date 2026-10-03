import { defineConfig, devices } from "@playwright/test";

const puerto = Number(process.env.PUERTO_PRUEBAS ?? 3100);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${puerto}`,
    locale: "es-DO",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "movil", use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } } },
  ],
  // Contra la compilación de producción, como corre en Docker y Azure (sin recarga en caliente).
  webServer: {
    command: `npm run build && npm run start:local`,
    env: { PORT: String(puerto), HOSTNAME: "127.0.0.1", INCLUIR_CATALOGO: "1" },
    url: `http://localhost:${puerto}/api/salud`,
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
