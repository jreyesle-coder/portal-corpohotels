import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/**
 * Criterio "Listo cuando" de S2: los 9 apartados de A2 4.02 existen con los nombres exactos de la
 * norma y sin secciones vacías. Además: noticias, contactos, marco legal, imprimir/PDF/correo y
 * aviso de cookies no modal. Requiere el contenido inicial: `npm run sembrar`.
 */
async function ir(page: Page, ruta: string) {
  const respuesta = await page.goto(ruta);
  await page.waitForLoadState("load");
  return respuesta;
}

const esMovil = (page: Page) => page.viewportSize()!.width <= 800;

const APARTADOS: { nombre: string; ruta: string }[] = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "Sobre nosotros", ruta: "/sobre-nosotros" },
  { nombre: "Servicios", ruta: "/servicios" },
  { nombre: "Transparencia", ruta: "/transparencia" },
  { nombre: "Noticias", ruta: "/noticias" },
  { nombre: "Contactos", ruta: "/contactos" },
  { nombre: "Términos de uso", ruta: "/terminos-de-uso" },
  { nombre: "Política de privacidad", ruta: "/politica-de-privacidad" },
  { nombre: "Preguntas frecuentes", ruta: "/preguntas-frecuentes" },
];

const SOBRE_NOSOTROS = [
  { nombre: "¿Quiénes somos?", ruta: "/sobre-nosotros/quienes-somos" },
  { nombre: "Historia", ruta: "/sobre-nosotros/historia" },
  { nombre: "Organigrama", ruta: "/sobre-nosotros/organigrama" },
  { nombre: "Conoce al Gerente General", ruta: "/sobre-nosotros/gerente-general" },
  { nombre: "Marco legal", ruta: "/sobre-nosotros/marco-legal" },
];

test.describe("Estructura obligatoria (A2 4.02)", () => {
  test("los 9 apartados existen, se llaman como en la norma y no están vacíos", async ({ page }) => {
    for (const { nombre, ruta } of APARTADOS) {
      const r = await ir(page, ruta);
      expect(r?.status(), ruta).toBe(200);
      const h1 = page.getByRole("heading", { level: 1 });
      if (ruta === "/") {
        await expect(h1).toHaveText("Corporación de Fomento de la Industria Hotelera y Desarrollo del Turismo (CORPHOTELS)");
      } else {
        // El encabezado es igual al texto del enlace del menú (A2 2.01.b.iv).
        await expect(h1, ruta).toHaveText(nombre);
        await expect(page.getByRole("navigation", { name: "Rastro de navegación" })).toContainText(nombre);
      }
      const texto = (await page.locator("main").innerText()).replace(/\s+/g, " ");
      expect(texto.length, `${ruta} sin contenido`).toBeGreaterThan(300);
    }
  });

  test("Sobre nosotros tiene sus 5 subsecciones en el orden de la norma", async ({ page }) => {
    await ir(page, "/sobre-nosotros");
    const enlaces = page.getByRole("navigation", { name: "Secciones de Sobre nosotros" }).getByRole("link");
    if (!esMovil(page)) await expect(enlaces).toHaveText(SOBRE_NOSOTROS.map((s) => s.nombre));
    for (const { nombre, ruta } of SOBRE_NOSOTROS) {
      expect((await ir(page, ruta))?.status(), ruta).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(nombre);
    }
  });

  test("el menú principal sale del CMS con la estructura de la norma", async ({ page }) => {
    test.skip(esMovil(page));
    await ir(page, "/");
    const menu = page.getByRole("navigation", { name: "Menú principal" });
    for (const { nombre } of APARTADOS.slice(0, 6)) {
      await expect(menu.getByText(nombre, { exact: true })).toBeVisible();
    }
  });
});

test.describe("Contenido", () => {
  test("la portada muestra noticias en el carrusel, servicios, transparencia y banners", async ({ page }) => {
    await ir(page, "/");
    // Noticias o información de alto impacto (A2 3.04.b.i): el carrusel principal enlaza noticias.
    await expect(page.locator("[data-carrusel] a[href^='/noticias/']").first()).toBeAttached();
    await expect(page.getByRole("heading", { name: "Servicios", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Transparencia", level: 2 })).toBeVisible();
    await expect(page.locator("[data-banners]")).toBeVisible();
    const imagenes = page.locator("main img");
    expect(await imagenes.count()).toBeGreaterThan(2);
    for (const img of await imagenes.all()) {
      expect(await img.getAttribute("alt")).toBeTruthy();
      // Dimensiones declaradas (sin saltos de diseño), salvo las que llenan un contenedor de alto fijo.
      if ((await img.getAttribute("data-nimg")) === "fill") continue;
      expect(await img.getAttribute("width")).toBeTruthy();
      expect(await img.getAttribute("height")).toBeTruthy();
    }
  });

  test("una noticia muestra título, fecha, lugar, imagen y fuente", async ({ page }) => {
    await ir(page, "/noticias");
    await page.locator("main article h2 a").first().click();
    await page.waitForURL(/\/noticias\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty();
    await expect(page.locator("main time")).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}/);
    await expect(page.locator("main article > p").first()).toContainText("·");
    await expect(page.locator("main figure img")).toHaveAttribute("alt", /.+/);
    await expect(page.getByText("Fuente:")).toBeVisible();
  });

  test("Contactos tiene dirección, teléfono, correo y mapa", async ({ page }) => {
    await ir(page, "/contactos");
    const main = page.locator("main");
    await expect(main.getByText("Av. México esquina 30 de Marzo", { exact: false })).toBeVisible();
    await expect(main.getByRole("link", { name: "(809) 688-3417" })).toHaveAttribute("href", "tel:+18096883417");
    await expect(main.getByRole("link", { name: "info@corphotels.gob.do" })).toBeVisible();
    await expect(main.locator("iframe[title^='Mapa']")).toHaveAttribute("src", /openstreetmap\.org/);
  });

  test("el Marco legal agrupa por tipo y cada documento muestra sus metadatos", async ({ page }) => {
    await ir(page, "/sobre-nosotros/marco-legal");
    for (const grupo of ["Constitución", "Leyes", "Decretos"]) {
      await expect(page.getByRole("heading", { name: grupo, level: 2 })).toBeVisible();
    }
    const tarjeta = page.locator("[data-descarga]").first();
    await expect(tarjeta.locator("[data-meta=tipo]")).toHaveText("PDF");
    await expect(tarjeta.locator("[data-meta=tamano]")).toHaveText(/\d.*(kB|MB|B)$/);
    const href = await tarjeta.getByRole("link", { name: /Descargar/ }).getAttribute("href");
    const r = await page.request.get(href!);
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("pdf");
  });

  test("el organigrama es descargable", async ({ page }) => {
    await ir(page, "/sobre-nosotros/organigrama");
    await expect(page.locator("[data-descarga]")).toHaveCount(1);
  });

  test("las preguntas frecuentes se despliegan con teclado", async ({ page }) => {
    await ir(page, "/preguntas-frecuentes");
    const primera = page.locator("details").first();
    await primera.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(primera).toHaveAttribute("open", "");
  });
});

test.describe("Herramientas de página (A2 2.01.e)", () => {
  test("imprimir, PDF y correo en las páginas internas", async ({ page, request }) => {
    await ir(page, "/sobre-nosotros/historia");
    const barra = page.getByRole("group", { name: "Herramientas de la página" });
    await expect(barra.getByRole("button", { name: "Imprimir" })).toBeVisible();
    await expect(barra.getByRole("button", { name: "Enviar por correo" })).toBeVisible();
    const pdf = await barra.getByRole("link", { name: "Descargar en PDF" }).getAttribute("href");
    const r = await request.get(pdf!);
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toBe("application/pdf");
    expect((await r.body()).subarray(0, 5).toString()).toBe("%PDF-");
  });

  test("la exportación rechaza parámetros no válidos", async ({ request }) => {
    expect((await request.get("/exportar-pdf?tipo=usuarios&slug=x")).status()).toBe(400);
    expect((await request.get("/exportar-pdf?tipo=paginas&slug=../../etc")).status()).toBe(400);
    expect((await request.get("/exportar-pdf?tipo=paginas&slug=no-existe")).status()).toBe(404);
  });
});

test.describe("Aviso de cookies (Ley 172-13)", () => {
  test("no es modal, se puede usar la página y recuerda la decisión", async ({ page }) => {
    await ir(page, "/");
    const aviso = page.getByRole("region", { name: "Aviso de cookies" });
    await expect(aviso).toBeVisible();
    await expect(page.locator("[aria-modal=true]")).toHaveCount(0);
    // La página sigue operable mientras el aviso está visible.
    await page.getByRole("link", { name: "Ver todos los servicios" }).click();
    await expect(page).toHaveURL(/\/servicios$/);
    await aviso.getByRole("button", { name: "Rechazar estadísticas" }).click();
    await expect(aviso).toBeHidden();
    await page.reload();
    await expect(page.getByRole("region", { name: "Aviso de cookies" })).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem("portal.estadisticas"))).toBe("rechazadas");
  });
});

test.describe("404 de contenido inexistente (A2 2.01.b.xii)", () => {
  for (const ruta of ["/noticias/no-existe-esta-noticia", "/servicios/no-existe", "/sobre-nosotros/terminos-de-uso"]) {
    test(`${ruta} responde 404 renderizado en el servidor`, async ({ request }) => {
      const r = await request.get(ruta);
      expect(r.status()).toBe(404);
      const html = await r.text();
      expect(html).toContain('<html lang="es"');
      expect(html).toContain("Página no encontrada");
    });
  }
});

test.describe("Accesibilidad de las plantillas del S2 (WCAG 2.2 AA)", () => {
  const rutas = [...APARTADOS.map((a) => a.ruta), ...SOBRE_NOSOTROS.map((s) => s.ruta)];
  for (const ruta of rutas) {
    test(`sin violaciones axe en ${ruta}`, async ({ page }) => {
      await ir(page, ruta);
      const resultado = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        // El mapa es un documento de OpenStreetMap: se evalúa su título, no su contenido interno.
        .exclude("iframe")
        .analyze();
      expect(resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
    });
  }
});

test.describe("Reflujo con texto al 200 % (A2 7.01.u, WCAG 1.4.10)", () => {
  for (const ruta of [...APARTADOS.map((a) => a.ruta), "/sobre-nosotros/marco-legal"]) {
    test(`sin desplazamiento horizontal en ${ruta}`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("portal.texto", "4");
        localStorage.setItem("portal.estadisticas", "rechazadas");
      });
      await ir(page, ruta);
      const { ancho, visible } = await page.evaluate(() => ({
        ancho: document.documentElement.scrollWidth,
        visible: document.documentElement.clientWidth,
      }));
      expect(ancho).toBeLessThanOrEqual(visible);
    });
  }
});
