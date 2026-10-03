import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Criterios "Listo cuando" de S0: medidas de cabecera y pie (A2 3.02, 3.04), identificador que se
 * oculta al desplazar (3.01.b.vii) y contraste ≥ 4.5:1 (7.01.i), más 404, teclado y salto de bloques.
 */

const alto = async (l: Locator) => (await l.boundingBox())!.height;
const ancho = async (l: Locator) => (await l.boundingBox())!.width;
const esMovil = (page: Page) => page.viewportSize()!.width <= 800;

/** Navega y espera la hidratación, para que los controles respondan al teclado y al clic. */
async function ir(page: Page, ruta: string) {
  const respuesta = await page.goto(ruta);
  await page.waitForLoadState("load");
  await page.waitForFunction(() => document.querySelector("[data-cabecera] button[aria-expanded]") !== null);
  return respuesta;
}

test.describe("Identificador oficial (A2 4.01.b, 3.02.b)", () => {
  test("mide 27 px cerrado y 150 px expandido en escritorio", async ({ page }) => {
    test.skip(esMovil(page), "Las alturas 27/150 px son de la versión de escritorio");
    await ir(page, "/");
    const identificador = page.locator("[data-identificador]");
    expect(await alto(identificador)).toBe(27);
    await identificador.getByRole("button", { name: "Así es como puedes saberlo" }).click();
    expect(await alto(identificador)).toBe(150);
    await expect(identificador.getByText("Los sitios web oficiales utilizan .gob.do", { exact: false })).toBeVisible();
  });

  test("se oculta al desplazar mientras la cabecera y el menú quedan fijos", async ({ page }) => {
    await ir(page, "/componentes");
    await page.mouse.wheel(0, 600);
    await expect
      .poll(async () => (await page.locator("[data-identificador]").boundingBox())!.y)
      .toBeLessThan(-20);
    const cabecera = (await page.locator("[data-cabecera]").boundingBox())!;
    expect(cabecera.y).toBe(0);
  });
});

test.describe("Cabecera (A2 3.02.b escritorio, 3.04.a móvil)", () => {
  test("medidas normativas", async ({ page }) => {
    await ir(page, "/");
    const logo = page.locator("[data-medida=logo]");
    if (esMovil(page)) {
      expect(await alto(logo)).toBeLessThanOrEqual(44);
      const buscar = page.locator("[data-medida=buscar-movil]");
      expect([await ancho(buscar), await alto(buscar)]).toEqual([28, 28]);
      const hamburguesa = page.locator("[data-medida=hamburguesa]");
      expect([await ancho(hamburguesa), await alto(hamburguesa)]).toEqual([42, 44]);
    } else {
      expect(await alto(logo)).toBeLessThanOrEqual(40);
      const buscador = page.locator("[data-medida=buscador]");
      expect([await ancho(buscador), await alto(buscador)]).toEqual([246, 40]);
      const enlaces = page.locator("[data-medida=enlaces-interes]");
      expect([await ancho(enlaces), await alto(enlaces)]).toEqual([32, 32]);
      expect(await alto(page.locator("[data-medida=menu-principal]"))).toBe(56);
    }
  });

  test("logo y nombre enlazan al inicio (A2 2.01.d)", async ({ page }) => {
    await ir(page, "/no-existe");
    await page.locator("[data-medida=logo-enlace]").click();
    await expect(page).toHaveURL("/");
  });

  test("menú activo resaltado (A2 2.01.b.i)", async ({ page }) => {
    test.skip(esMovil(page));
    await ir(page, "/");
    await expect(page.getByRole("navigation", { name: "Menú principal" }).getByRole("link", { name: "Inicio" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("submenú operable con teclado (A2 7.01.j)", async ({ page }) => {
    test.skip(esMovil(page));
    await ir(page, "/");
    const boton = page.getByRole("button", { name: "Sobre nosotros" });
    await boton.focus();
    await page.keyboard.press("Enter");
    await expect(boton).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: "Historia" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(boton).toHaveAttribute("aria-expanded", "false");
    await expect(boton).toBeFocused();
  });

  test("enlaces de interés con las secciones de A2 4.01.c en pestaña nueva", async ({ page }) => {
    await ir(page, "/");
    if (esMovil(page)) {
      await page.locator("[data-medida=hamburguesa]").click();
      await page.getByRole("button", { name: "Enlaces de interés" }).click();
    } else {
      await page.locator("[data-medida=enlaces-interes]").click();
    }
    for (const seccion of ["Ventanillas", "Portales", "Instituciones"]) {
      await expect(page.getByRole("heading", { name: seccion, exact: true })).toBeVisible();
    }
    const enlace311 = page.getByRole("link", { name: /Sistema 311/ });
    await expect(enlace311).toHaveAttribute("target", "_blank");
  });

  test("menú hamburguesa despliega submenús hasta nivel II (A2 3.04.a.iv)", async ({ page }) => {
    test.skip(!esMovil(page));
    await ir(page, "/");
    await page.locator("[data-medida=hamburguesa]").click();
    await page.getByRole("button", { name: "Sobre nosotros" }).click();
    await expect(page.getByRole("link", { name: "Organigrama" })).toBeVisible();
  });
});

test.describe("Pie (A2 3.02.f, 3.04.c)", () => {
  test("logos, secciones y redes", async ({ page }) => {
    await ir(page, "/");
    const pie = page.locator("[data-pie]");
    expect(await alto(pie.locator("[data-medida=isotipo]"))).toBeLessThanOrEqual(56);
    expect(await alto(pie.locator("[data-medida=logo-gobierno]"))).toBeLessThanOrEqual(esMovil(page) ? 75 : 80);
    for (const titulo of ["Conócenos", "Contáctanos", "Búscanos", "Infórmate"]) {
      await expect(pie.getByRole("heading", { name: titulo })).toBeVisible();
    }
    await expect(pie.getByText(String(new Date().getFullYear()))).toBeVisible();
    const redes = pie.locator("a[href*='facebook'], a[href*='instagram'], a[href*='x.com'], a[href*='youtube']");
    const visibles = await redes.evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length);
    expect(visibles).toBeLessThanOrEqual(esMovil(page) ? 4 : 99);
    for (const svg of await redes.locator("svg").all()) {
      expect(await alto(svg)).toBeLessThanOrEqual(16);
    }
  });
});

test.describe("Accesibilidad (A2 cap. 7, WCAG 2.2 AA)", () => {
  for (const ruta of ["/", "/componentes", "/no-existe"]) {
    for (const contraste of [false, true]) {
      test(`sin violaciones axe en ${ruta}${contraste ? " con alto contraste" : ""}`, async ({ page }) => {
        if (contraste) {
          await page.addInitScript(() => localStorage.setItem("portal.contraste", "alto"));
        }
        await ir(page, ruta);
        const resultado = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
      });
    }
  }

  test("el primer elemento enfocable salta al contenido (A2 7.01.k)", async ({ page }) => {
    await ir(page, "/");
    await page.keyboard.press("Tab");
    const salto = page.getByRole("link", { name: "Saltar al contenido principal" });
    await expect(salto).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#contenido$/);
  });

  test("la herramienta amplía el texto al 200 % y activa el alto contraste (A2 7.01.u–v)", async ({ page }) => {
    await ir(page, "/");
    await page.getByRole("button", { name: /Herramientas de accesibilidad/ }).click();
    for (let i = 0; i < 4; i++) await page.getByRole("button", { name: /Aumentar el texto/ }).click();
    await expect(page.getByText("200 %")).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe("32px");
    await page.getByRole("button", { name: /Alto contraste/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-contraste", "alto");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-contraste", "alto");
  });

  test("portada titulada con el nombre oficial (A2 7.01.m) e idioma declarado (7.01.o)", async ({ page }) => {
    await ir(page, "/");
    await expect(page).toHaveTitle(
      "Corporación de Fomento de la Industria Hotelera y Desarrollo del Turismo (CORPHOTELS)",
    );
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });
});

test.describe("Error 404 (A2 2.01.b.xii)", () => {
  test("responde 404 con identidad, estructura y sugerencias", async ({ page }) => {
    const respuesta = await ir(page, "/pagina-que-no-existe");
    expect(respuesta?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Página no encontrada" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Estructura del portal" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Le sugerimos" })).toBeVisible();
    await expect(page.locator("[data-cabecera]")).toBeVisible();
    await expect(page.locator("[data-pie]")).toBeVisible();
  });

  test("favicon de 16×16 servido (A2 2.01.a)", async ({ request }) => {
    expect((await request.get("/favicon.ico")).status()).toBe(200);
    expect((await request.get("/iconos/favicon-16.png")).status()).toBe(200);
  });
});
