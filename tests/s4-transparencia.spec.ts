import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { DESTINOS, GRUPOS_MOVIL, SECCIONES } from "../src/contenido/transparencia";
import { contenido, corrida, origen, PDF_MINIMO, sesion } from "./ayudas";

/**
 * Criterio "Listo cuando" de S4: la OAI carga un documento en cada sección y la estructura coincide
 * con la resolución DIGEIG confirmada (A2 4.03 escritorio, 4.04 móvil). Además: menú vertical
 * expandido (3.02.h), publicación por año, enlaces obligatorios y 404 de rutas inexistentes.
 * Usa el simulador de Entra ID de Docker Compose (servicio entra-simulado).
 */

const esMovil = (page: Page) => page.viewportSize()!.width <= 800;

async function ir(page: Page, ruta: string) {
  const r = await page.goto(ruta);
  await page.waitForLoadState("load");
  return r;
}

test.describe("Estructura de transparencia (A2 4.03 y 4.04)", () => {
  test("escritorio: menú vertical con Inicio Transparencia y las 19 secciones en orden", async ({ page }) => {
    test.skip(esMovil(page), "Menú de escritorio");
    expect((await ir(page, "/transparencia"))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Transparencia");
    const menu = page.getByRole("navigation", { name: "Menú de transparencia" });
    await expect(menu).toBeVisible();
    // Nivel I: enlaces de las secciones sin subsecciones y títulos desplegables de las demás.
    const nivelI = menu.locator(":scope > ul > li > a, :scope > ul > li > details > summary");
    await expect(nivelI).toHaveText(["Inicio Transparencia", ...SECCIONES.map((s) => s.titulo)]);
    expect(SECCIONES).toHaveLength(19);
    // El panel está a la izquierda del contenido (A2 3.02.e).
    const cajaMenu = (await menu.boundingBox())!;
    const cajaTitulo = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
    expect(cajaMenu.x + cajaMenu.width).toBeLessThanOrEqual(cajaTitulo.x);
  });

  test("escritorio: el nivel II se expande al hacer clic y se vuelve a contraer (3.02.h.b)", async ({ page }) => {
    test.skip(esMovil(page), "Menú de escritorio");
    await ir(page, "/transparencia");
    const menu = page.getByRole("navigation", { name: "Menú de transparencia" });
    const oai = SECCIONES.find((s) => s.clave === "oai")!;
    const enlaceRai = menu.getByRole("link", { name: "Responsable de Acceso a la Información (RAI)" });
    await expect(enlaceRai).toBeHidden();
    await menu.getByText(oai.titulo, { exact: true }).click();
    await expect(enlaceRai).toBeVisible();
    await menu.getByText(oai.titulo, { exact: true }).click();
    await expect(enlaceRai).toBeHidden();
    // En una subsección, su sección queda abierta y marcada.
    await ir(page, "/transparencia/oai/rai");
    await expect(menu.getByRole("link", { name: "Responsable de Acceso a la Información (RAI)" })).toHaveAttribute("aria-current", "page");
  });

  test("móvil: cinco grupos y Contactos, desplegables hasta el nivel II", async ({ page }) => {
    test.skip(!esMovil(page), "Menú móvil");
    await ir(page, "/transparencia");
    const menu = page.getByRole("navigation", { name: "Menú de transparencia" });
    await expect(menu).toHaveCount(1); // el de escritorio no se muestra
    await menu.getByText("Menú de transparencia").click();
    const nivelI = menu.locator(":scope > details > ul > li > a, :scope > details > ul > li > details > summary");
    await expect(nivelI).toHaveText(["Inicio Transparencia", ...GRUPOS_MOVIL.map((g) => g.titulo)]);
    expect(GRUPOS_MOVIL.map((g) => g.titulo)).toEqual([
      "Institucional",
      "Legal",
      "Oficina de Libre Acceso a la Información",
      "Servicios",
      "Financiero",
      "Contactos",
    ]);
    await menu.getByText("Financiero", { exact: true }).click();
    await menu.getByRole("link", { name: "Presupuesto", exact: true }).click();
    await page.waitForURL("**/transparencia/presupuesto");
    // El nivel III se presenta como menú de archivos dentro de la sección (3.04.a.iv.a).
    const archivos = page.getByRole("navigation", { name: "Subsecciones de Presupuesto" });
    await expect(archivos.getByRole("link")).toHaveCount(2);
  });

  test("todas las secciones y subsecciones responden, con su título como encabezado", async ({ page }) => {
    test.skip(esMovil(page), "Basta con una pantalla");
    test.setTimeout(180_000);
    const rutas = [...SECCIONES.map((s) => ({ ruta: `/transparencia/${s.clave}`, titulo: s.titulo })), ...DESTINOS.map((d) => ({ ruta: d.ruta, titulo: d.titulo }))];
    for (const { ruta, titulo } of rutas) {
      expect((await ir(page, ruta))?.status(), ruta).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }), ruta).toHaveText(titulo);
      await expect(page.getByRole("navigation", { name: "Rastro de navegación" }), ruta).toContainText("Transparencia");
    }
  });

  test("las rutas que no existen responden el 404 institucional", async ({ page }) => {
    for (const ruta of ["/transparencia/no-existe", "/transparencia/oai/no-existe", "/transparencia/oai/rai/extra"]) {
      const r = await ir(page, ruta);
      expect(r?.status(), ruta).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Página no encontrada");
    }
  });

  test("enlaces obligatorios: Portal Único, SAIP, 311, Concursa y datos.gob.do en pestaña nueva", async ({ page }) => {
    await ir(page, "/transparencia");
    const main = page.locator("main");
    for (const url of ["https://transparencia.gob.do/", "https://saip.gob.do/", "https://311.gob.do/", "https://datos.gob.do/"]) {
      await expect(main.locator(`a[href="${url}"]`).first(), url).toHaveAttribute("target", "_blank");
    }
    for (const [ruta, url] of [
      ["/transparencia/oai/saip", "https://saip.gob.do/"],
      ["/transparencia/portal-311/enlace", "https://311.gob.do/"],
      ["/transparencia/recursos-humanos/concursa", "https://map.gob.do/Concursa/"],
      ["/transparencia/datos-abiertos", "https://datos.gob.do/"],
    ]) {
      await ir(page, ruta);
      await expect(page.locator(`main a[href="${url}"]`).first(), ruta).toBeVisible();
    }
  });

  for (const ruta of ["/transparencia", "/transparencia/oai", "/transparencia/presupuesto/ejecucion"]) {
    test(`sin violaciones axe en ${ruta}`, async ({ page }) => {
      await ir(page, ruta);
      if (esMovil(page)) await page.getByText("Menú de transparencia").click();
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
    });
  }
});

test.describe("Carga de la OAI (criterio de S4)", () => {
  test("la OAI carga un documento en cada sección y se publica en su lugar", async ({ browser, baseURL }) => {
    test.skip(test.info().project.name !== "escritorio", "Una sola carga por corrida");
    test.setTimeout(240_000);
    const oai = await sesion(browser, "oai", { roles: ["OAI"] });
    const titulo = (valor: string) => `Prueba transparencia ${corrida} ${valor}`;

    for (const d of DESTINOS) {
      const r = await oai.api.post("/api/documentos", {
        headers: origen(baseURL!),
        multipart: {
          file: { name: `prueba-${corrida}.pdf`, mimeType: "application/pdf", buffer: PDF_MINIMO },
          _payload: JSON.stringify({
            titulo: titulo(d.valor),
            descripcion: `Documento de prueba automatizada para ${d.titulo}.`,
            area: "transparencia",
            seccionTransparencia: d.valor,
            anio: 2026,
            periodo: d.periodica ? "t3" : undefined,
          }),
        },
      });
      expect(r.status(), `${d.valor}: ${await r.text()}`).toBe(201);
    }

    // La OAI no carga en el área institucional.
    const ajeno = await oai.api.post("/api/documentos", {
      headers: origen(baseURL!),
      multipart: {
        file: { name: "otro.pdf", mimeType: "application/pdf", buffer: PDF_MINIMO },
        _payload: JSON.stringify({ titulo: "Otro", descripcion: "Otro", area: "institucional" }),
      },
    });
    expect(ajeno.status()).toBe(403);

    // Sin sección de transparencia no se acepta.
    const sinSeccion = await oai.api.post("/api/documentos", {
      headers: origen(baseURL!),
      multipart: {
        file: { name: "otro.pdf", mimeType: "application/pdf", buffer: PDF_MINIMO },
        _payload: JSON.stringify({ titulo: "Otro", descripcion: "Otro", area: "transparencia" }),
      },
    });
    expect(sinSeccion.status()).toBe(400);

    const page = oai.page;
    for (const d of DESTINOS) {
      await ir(page, d.ruta);
      const tarjeta = page.locator("[data-descarga]", { hasText: titulo(d.valor) });
      await expect(tarjeta, d.ruta).toBeVisible();
      await expect(tarjeta.locator("[data-meta=tipo]")).toHaveText("PDF");
      if (d.periodica) await expect(tarjeta.locator("[data-meta=periodo]")).toHaveText(/Tercer trimestre.*2026/);
      await expect(page.locator("[data-sin-documentos]")).toHaveCount(0);
    }
    await oai.cerrar();
  });

  test("publicación periódica: menú por año, el más reciente primero", async ({ browser, baseURL }) => {
    test.skip(test.info().project.name !== "escritorio", "Una sola carga por corrida");
    const oai = await sesion(browser, "oai-anios", { roles: ["OAI"] });
    const destino = "finanzas/ingresos-egresos";
    for (const [anio, periodo] of [
      [2024, "m12"],
      [2025, "m01"],
      [2025, "m06"],
    ] as const) {
      const r = await oai.api.post("/api/documentos", {
        headers: origen(baseURL!),
        multipart: {
          file: { name: `prueba-${corrida}.pdf`, mimeType: "application/pdf", buffer: PDF_MINIMO },
          _payload: JSON.stringify({
            titulo: `Prueba transparencia ${corrida} ingresos ${anio}-${periodo}`,
            descripcion: "Documento de prueba automatizada.",
            area: "transparencia",
            seccionTransparencia: destino,
            anio,
            periodo,
          }),
        },
      });
      expect(r.status(), await r.text()).toBe(201);
    }
    const page = oai.page;
    await ir(page, `/transparencia/${destino}?anio=2025`);
    const anios = page.getByRole("navigation", { name: "Años" }).getByRole("link");
    const textos = await anios.allTextContents();
    expect(textos.indexOf("2025")).toBeLessThan(textos.indexOf("2024"));
    await expect(anios.filter({ hasText: "2025" })).toHaveAttribute("aria-current", "page");
    const propias = page.locator("[data-descarga]", { hasText: `Prueba transparencia ${corrida} ingresos` });
    // Solo el año elegido, y junio antes que enero.
    await expect(propias.locator("h3")).toHaveText([
      `Prueba transparencia ${corrida} ingresos 2025-m06`,
      `Prueba transparencia ${corrida} ingresos 2025-m01`,
    ]);
    await anios.filter({ hasText: "2024" }).click();
    await page.waitForURL("**anio=2024");
    await expect(propias.locator("h3")).toHaveText([`Prueba transparencia ${corrida} ingresos 2024-m12`]);
    await oai.cerrar();
  });

  test("la OAI publica el texto de una sección; el editor no puede", async ({ browser, baseURL }) => {
    test.skip(test.info().project.name !== "escritorio", "Una sola carga por corrida");
    const seccion = "cep/miembros";
    const texto = `Texto de prueba automatizada ${corrida}: miembros de la CEP.`;
    const editor = await sesion(browser, "editor-transparencia", { roles: ["Editor"] });
    const negado = await editor.api.post("/api/textos-transparencia", {
      headers: origen(baseURL!),
      data: { seccion, contenido: contenido(texto) },
    });
    expect([401, 403]).toContain(negado.status());
    await editor.cerrar();

    const oai = await sesion(browser, "oai-textos", { roles: ["OAI"] });
    const existente = await oai.api.get(`/api/textos-transparencia?where[seccion][equals]=${encodeURIComponent(seccion)}`);
    const previo = (await existente.json()).docs[0];
    const r = previo
      ? await oai.api.patch(`/api/textos-transparencia/${previo.id}`, { headers: origen(baseURL!), data: { contenido: contenido(texto) } })
      : await oai.api.post("/api/textos-transparencia", { headers: origen(baseURL!), data: { seccion, contenido: contenido(texto) } });
    expect(r.status(), await r.text()).toBeLessThan(300);
    await ir(oai.page, `/transparencia/${seccion}`);
    await expect(oai.page.locator("[data-texto-transparencia]")).toContainText(texto);
    await oai.cerrar();
  });
});
