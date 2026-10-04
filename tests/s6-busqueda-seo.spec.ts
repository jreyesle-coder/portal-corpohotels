import { randomUUID } from "node:crypto";
import { expect, type Page, test } from "@playwright/test";

/**
 * Criterio "Listo cuando" de S6: el buscador cumple los cuatro criterios de A2 2.01.i.ii y Matomo
 * registra visitas sin cookies de terceros. Además: títulos y descripciones propios, URL canónica,
 * mapa del sitio, sitemap.xml, robots.txt y marcado Schema.org (A2 6.01).
 */
try {
  process.loadEnvFile(".env");
} catch {
  // Sin .env: las pruebas de Matomo se omiten.
}

async function ir(page: Page, ruta: string, consentimiento: "aceptadas" | "rechazadas" = "rechazadas") {
  await page.addInitScript((c) => localStorage.setItem("portal.estadisticas", c), consentimiento);
  const r = await page.goto(ruta);
  await page.waitForLoadState("load");
  return r;
}

test.describe("Buscador (A2 2.01.i.ii)", () => {
  test("a) la consulta vacía indica qué escribir", async ({ page }) => {
    await ir(page, "/buscar?q=");
    await expect(page.locator("[data-busqueda-vacia]")).toContainText("Escriba en el campo de búsqueda");
    await expect(page.locator("[data-resultados]")).toHaveCount(0);
  });

  test("b, d) resultados por relevancia con el total indicado", async ({ page }) => {
    await ir(page, "/buscar?q=historia");
    const total = Number(await page.locator("[data-total-resultados]").getAttribute("data-total-resultados"));
    expect(total).toBeGreaterThan(1);
    await expect(page.locator("[data-total-resultados]")).toContainText(/\d+ resultados para «historia»/);
    // Lo más relevante primero: la página «Historia» antes que las noticias que la mencionan.
    await expect(page.locator("[data-resultados] > li").first().locator("h2")).toHaveText("Historia");
  });

  test("c) sin resultados duplicados y el total coincide con lo listado", async ({ page }) => {
    await ir(page, "/buscar?q=ejecuci%C3%B3n%20presupuestaria");
    const total = Number(await page.locator("[data-total-resultados]").getAttribute("data-total-resultados"));
    const vistos = new Set<string>();
    let contados = 0;
    for (let pagina = 1; pagina <= 20; pagina++) {
      if (pagina > 1) await ir(page, `/buscar?q=ejecuci%C3%B3n%20presupuestaria&pagina=${pagina}`);
      const items = page.locator("[data-resultados] > li");
      const n = await items.count();
      for (let i = 0; i < n; i++) {
        const clave = `${await items.nth(i).locator("h2").innerText()}|${await items.nth(i).locator("h2 a").getAttribute("href")}`;
        expect(vistos.has(clave), clave).toBe(false);
        vistos.add(clave);
      }
      contados += n;
      if (n < 10) break;
    }
    if (total <= 200) expect(contados).toBe(total);
  });

  test("encuentra sin tildes, filtra por tipo y el buscador de la cabecera lleva a los resultados", async ({ page }) => {
    await ir(page, "/buscar?q=nomina");
    await expect(page.locator("[data-total-resultados]")).not.toHaveAttribute("data-total-resultados", "0");
    const filtros = page.getByRole("navigation", { name: "Filtrar resultados" });
    await filtros.getByRole("link", { name: /^Documentos/ }).click();
    await page.waitForURL(/tipo=documento/);
    const tipos = await page.locator("[data-resultados] > li").evaluateAll((l) => l.map((e) => e.getAttribute("data-resultado")));
    expect(new Set(tipos)).toEqual(new Set(["documento"]));

    await ir(page, "/");
    const formulario = page.getByRole("search").filter({ visible: true }).first();
    if (await formulario.isVisible()) {
      await formulario.getByRole("searchbox").fill("servicios");
      await formulario.getByRole("searchbox").press("Enter");
      await page.waitForURL(/\/buscar\?q=servicios/);
    }
  });

  test("los resultados no se indexan en buscadores externos (NoIndex, Follow)", async ({ page }) => {
    await ir(page, "/buscar?q=hotel");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("SEO (A2 6.01)", () => {
  const RUTAS = ["/", "/sobre-nosotros", "/sobre-nosotros/historia", "/servicios", "/noticias", "/transparencia", "/transparencia/oai/rai", "/contactos", "/arrendatarios", "/mapa-del-sitio"];

  test("título propio con «Página | Sitio | palabras clave», descripción propia y URL canónica", async ({ page }) => {
    const titulos = new Set<string>();
    const descripciones = new Set<string>();
    for (const ruta of RUTAS) {
      await ir(page, ruta);
      const titulo = await page.title();
      const descripcion = await page.locator('meta[name="description"]').getAttribute("content");
      expect(titulo, ruta).toBeTruthy();
      expect(descripcion, ruta).toBeTruthy();
      if (ruta !== "/") expect(titulo, ruta).toMatch(/^.+ \| CORPHOTELS \| Fomento hotelero y turístico$/);
      expect(titulos.has(titulo), `título repetido: ${titulo}`).toBe(false);
      expect(descripciones.has(descripcion!), `descripción repetida en ${ruta}`).toBe(false);
      titulos.add(titulo);
      descripciones.add(descripcion!);
      const canonica = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(new URL(canonica!).pathname, ruta).toBe(ruta);
    }
  });

  test("la URL canónica quita parámetros innecesarios y conserva la página del listado", async ({ page }) => {
    await ir(page, "/noticias?pagina=2&utm_source=prueba");
    const canonica = new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!);
    expect(canonica.pathname + canonica.search).toBe("/noticias?pagina=2");
  });

  test("sitemap.xml y robots.txt", async ({ request }) => {
    const mapa = await request.get("/sitemap.xml");
    expect(mapa.status()).toBe(200);
    const xml = await mapa.text();
    expect(xml).toContain("<urlset");
    for (const ruta of ["/sobre-nosotros/historia", "/transparencia/oai/rai", "/mapa-del-sitio", "/arrendatarios"]) expect(xml).toContain(`${ruta}</loc>`);
    expect(xml).toMatch(/\/noticias\/[a-z0-9-]+<\/loc>/);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap:");
    expect(robots).toContain("Disallow: /gestion");
  });

  test("el mapa del sitio enlaza todas las secciones y está en el pie", async ({ page }) => {
    await ir(page, "/");
    await page.locator("[data-pie]").getByRole("link", { name: "Mapa del sitio" }).click();
    await page.waitForURL(/\/mapa-del-sitio$/);
    const main = page.locator("main");
    for (const nombre of ["Sobre nosotros", "Servicios", "Transparencia", "Noticias", "Contactos", "Arrendatarios", "Presupuesto Aprobado del Año", "Términos de uso"]) {
      await expect(main.getByRole("link", { name: nombre, exact: true }).first(), nombre).toBeAttached();
    }
  });

  test("marcado Schema.org: organización, noticia y rastro de navegación", async ({ page }) => {
    const tipos = async () =>
      (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t)["@type"]);
    await ir(page, "/");
    expect(await tipos()).toContain("GovernmentOrganization");
    await ir(page, "/noticias");
    await page.locator("main article h2 a").first().click();
    await page.waitForURL(/\/noticias\/[a-z0-9-]+$/);
    expect(await tipos()).toEqual(expect.arrayContaining(["NewsArticle", "BreadcrumbList"]));
  });

  test("las direcciones del mapa y del buscador anteriores redirigen", async ({ request }) => {
    const mapa = await request.get("/index.php/mapa-de-sitio", { maxRedirects: 0 });
    test.skip(mapa.status() === 404, "Requiere npm run migracion:importar");
    expect(mapa.status()).toBe(301);
    expect(mapa.headers().location).toContain("/mapa-del-sitio");
  });
});

test.describe("Estadísticas con Matomo (A2 5.04.3)", () => {
  test("sin consentimiento no se mide nada", async ({ page }) => {
    const pedidos: string[] = [];
    page.on("request", (r) => pedidos.push(r.url()));
    await ir(page, "/", "rechazadas");
    await page.waitForTimeout(1000);
    expect(pedidos.filter((u) => u.includes("/estadisticas/"))).toEqual([]);
  });

  test("con consentimiento registra la visita sin cookies y sin contactar a terceros", async ({ page, baseURL }) => {
    const token = process.env.MATOMO_TOKEN_PRUEBAS;
    const matomo = process.env.MATOMO_URL ?? "http://localhost:8080";
    test.skip(!token, "Requiere Matomo instalado y MATOMO_TOKEN_PRUEBAS en .env");
    const marca = randomUUID().slice(0, 8);
    const origen = new URL(baseURL!).origin;
    const ajenos: string[] = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (!["data:", "blob:"].includes(u.protocol) && u.origin !== origen) ajenos.push(r.url());
    });
    const registros = page.waitForRequest((r) => r.url().includes("/estadisticas/registro"));
    await ir(page, `/?prueba=${marca}`, "aceptadas");
    await registros;
    await page.waitForTimeout(500);

    // Sin terceros: el navegador solo habla con el portal.
    expect(ajenos).toEqual([]);
    // Sin cookies de estadísticas (disableCookies) ni de ningún otro dominio.
    const cookies = await page.context().cookies();
    expect(cookies.filter((c) => c.name.startsWith("_pk") || c.name.startsWith("MATOMO"))).toEqual([]);
    expect(cookies.filter((c) => !origen.includes(c.domain.replace(/^\./, "")))).toEqual([]);

    // Matomo registró la visita (informe en tiempo real).
    await expect
      .poll(
        async () => {
          const r = await fetch(`${matomo}/index.php`, {
            method: "POST",
            body: new URLSearchParams({
              module: "API",
              method: "Live.getLastVisitsDetails",
              idSite: process.env.MATOMO_SITE_ID ?? "1",
              filter_limit: "20",
              format: "json",
              token_auth: token!,
            }),
          });
          const visitas = (await r.json()) as { actionDetails: { url?: string }[] }[];
          return visitas.some((v) => v.actionDetails.some((a) => a.url?.includes(marca)));
        },
        { timeout: 15_000 },
      )
      .toBe(true);
  });
});
