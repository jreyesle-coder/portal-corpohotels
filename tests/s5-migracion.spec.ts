import { expect, test } from "@playwright/test";
import pg from "pg";
import { normalizarUrl } from "../src/migracion/normalizar";
import { identificadores } from "../src/migracion/redireccion";
import { corrida, origen, sesion } from "./ayudas";

/**
 * S5 — Migración sin romper enlaces: las URL del portal anterior (Joomla) responden 301 a su
 * equivalente (A2 6.01; requerimientos S5). Las pruebas de reglas crean sus propias redirecciones;
 * las de «contenido migrado» usan lo que cargó `npm run migracion:importar` y se omiten si no está.
 */

test.describe("Normalización de URL anteriores", () => {
  test("misma forma para http, www, Itemid y parámetros desordenados", () => {
    expect(normalizarUrl("http://www.corphotels.gob.do/index.php/noticias?Itemid=5&start=14")).toBe("/index.php/noticias?start=14");
    expect(normalizarUrl("https://corphotels.gob.do/transparencia/../index.php/contacto")).toBe("/index.php/contacto");
    expect(normalizarUrl("https://otro.gob.do/index.php")).toBeNull();
    expect(normalizarUrl("/index.php?view=item&id=9&option=com_k2")).toBe("/index.php?id=9&option=com_k2&view=item");
  });

  test("las descargas de los dos Joomla no se confunden", () => {
    expect(identificadores("/transparencia/index.php/x/category/12-a?download=34:b")).toEqual([
      "phoca:transparencia:34",
      "phoca-cat:transparencia:12",
    ]);
    expect(identificadores("/index.php/marco-legal?download=12:constitucion")).toEqual(["phoca:portal:12"]);
    expect(identificadores("/index.php/noticias/item/441-corphotels")).toEqual(["k2:441"]);
  });
});

test.describe("Redirecciones 301 del proxy", () => {
  const base = `/index.php/prueba-${corrida}`;
  // Identificador anterior único por corrida (la limpieza global borra estas redirecciones).
  const idPrueba = String(900000 + (Number.parseInt(corrida, 16) % 99999));

  test.beforeAll(async ({ browser, baseURL }) => {
    const admin = await sesion(browser, "admin-redirecciones", { roles: ["Administrador"] });
    for (const data of [
      { origen: base, destino: "/sobre-nosotros", tipo: "prefijo", nota: "prueba automatizada" },
      { origen: `${base}/exacta`, destino: "/contactos", tipo: "exacta", nota: "prueba automatizada" },
      { origen: `phoca:portal:${idPrueba}`, destino: "/transparencia", tipo: "identificador", nota: "prueba automatizada" },
    ]) {
      const r = await admin.api.post("/api/redirecciones", { headers: origen(baseURL!), data });
      expect(r.status(), await r.text()).toBe(201);
    }
    await admin.cerrar();
  });

  const sinSeguir = { maxRedirects: 0 } as const;

  test("exacta, prefijo con páginas internas e identificador", async ({ request }) => {
    const exacta = await request.get(`${base}/exacta`, sinSeguir);
    expect(exacta.status()).toBe(301);
    expect(new URL(exacta.headers().location, "http://x").pathname).toBe("/contactos");

    // La regla exacta gana a la de prefijo; las páginas internas usan el prefijo.
    const interna = await request.get(`${base}/item/77-cualquier-cosa?start=10`, sinSeguir);
    expect(interna.status()).toBe(301);
    expect(new URL(interna.headers().location, "http://x").pathname).toBe("/sobre-nosotros");

    // El prefijo no captura rutas que solo empiezan igual.
    expect((await request.get(`${base}x`, sinSeguir)).status()).toBe(404);

    const descarga = await request.get(`/index.php/cualquier-menu?download=${idPrueba}:archivo`, sinSeguir);
    expect(descarga.status()).toBe(301);
    expect(new URL(descarga.headers().location, "http://x").pathname).toBe("/transparencia");
  });

  test("sin equivalente responde el 404 institucional", async ({ page }) => {
    const r = await page.goto("/index.php/foro/turismo");
    expect(r?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Página no encontrada");
  });
});

test.describe("Contenido migrado del portal anterior", () => {
  let migrado = false;
  test.beforeAll(async () => {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL ?? "postgres://portal:portal_dev@localhost:5432/portal", max: 1 });
    try {
      const r = await pool.query("SELECT count(*)::int AS n FROM redirecciones WHERE origen LIKE 'phoca:transparencia:%'");
      migrado = r.rows[0].n > 0;
    } catch {
      migrado = false;
    } finally {
      await pool.end();
    }
  });

  test("menú, carpeta por año y descarga del portal de transparencia anterior", async ({ request }) => {
    test.skip(!migrado, "Requiere npm run migracion:importar");
    const sinSeguir = { maxRedirects: 0 } as const;
    const menu = await request.get("/transparencia/index.php/presupuesto/ejecucion-del-presupuesto", sinSeguir);
    expect(menu.status()).toBe(301);
    expect(menu.headers().location).toContain("/transparencia/presupuesto/ejecucion");

    const carpeta = await request.get(
      "/transparencia/index.php/presupuesto/ejecucion-del-presupuesto/category/2862-presupuesto-ejecuciones-presupuestarias-ejecucion-presupuestaria-2025-diciembre-2025",
      sinSeguir,
    );
    expect(carpeta.status()).toBe(301);
    expect(carpeta.headers().location).toContain("/transparencia/presupuesto/ejecucion?anio=2025");

    const descarga = await request.get(
      "/transparencia/index.php/presupuesto/ejecucion-del-presupuesto/category/2862-x?download=4990:ejecucion-presupuestaria-diciembre-2025",
      sinSeguir,
    );
    expect(descarga.status()).toBe(301);
    expect(descarga.headers().location).toContain("/api/documentos/file/");
    const archivo = await request.get(descarga.headers().location);
    expect(archivo.status()).toBe(200);
    expect(archivo.headers()["content-type"]).toContain("pdf");
  });

  test("la sección migrada muestra los documentos por año", async ({ page }) => {
    test.skip(!migrado, "Requiere npm run migracion:importar");
    await page.goto("/transparencia/presupuesto/ejecucion?anio=2025");
    const anios = page.getByRole("navigation", { name: "Años" }).getByRole("link");
    expect(await anios.count()).toBeGreaterThan(5);
    await expect(anios.filter({ hasText: "2025" })).toHaveAttribute("aria-current", "page");
    await expect(page.locator("[data-descarga]", { hasText: "EJECUCION PRESUPUESTARIA DICIEMBRE 2025" }).first()).toBeVisible();
  });

  test("noticias y páginas del portal anterior", async ({ request, page }) => {
    test.skip(!migrado, "Requiere npm run migracion:importar");
    const sinSeguir = { maxRedirects: 0 } as const;
    const pagina = await request.get("/index.php/sobre-nosotros/quienes-somos", sinSeguir);
    expect(pagina.status()).toBe(301);
    expect(pagina.headers().location).toContain("/sobre-nosotros/quienes-somos");

    const noticia = await request.get("/index.php/noticias/item/441-corphotels-realiza-exitosa-jornada-de-saneamiento-en-la-playa-san-gil", sinSeguir);
    expect(noticia.status()).toBe(301);
    const destino = noticia.headers().location;
    expect(destino).toContain("/noticias/");
    await page.goto(destino);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("CORPHOTELS realiza exitosa jornada de saneamiento en la Playa San Gil");
  });
});
