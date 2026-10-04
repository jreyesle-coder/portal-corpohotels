import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/**
 * Disposición tipo hacienda.gob.do (pedido de TIC, gran sprint S5–S7): cabecera azul (opción B,
 * A2 3.02.a), contenido de 1320 px con franjas de borde a borde, carrusel principal con pausa
 * (WCAG 2.2.2) y la sección Arrendatarios al final del menú (A2 4.01.a).
 */
const esMovil = (page: Page) => page.viewportSize()!.width <= 800;

async function ir(page: Page, ruta: string) {
  await page.addInitScript(() => localStorage.setItem("portal.estadisticas", "rechazadas"));
  await page.goto(ruta);
  await page.waitForLoadState("load");
}

test("cabecera azul con el nombre en blanco (opción B)", async ({ page }) => {
  await ir(page, "/");
  const franja = page.locator("[data-cabecera] > div").first();
  expect(await franja.evaluate((n) => getComputedStyle(n).backgroundColor)).toBe("rgb(15, 83, 156)");
  expect(await page.locator("[data-medida=logo]").getAttribute("src")).toContain("icono-blanco");
});

test("contenido de hasta 1320 px y franjas de borde a borde", async ({ page }) => {
  test.skip(esMovil(page), "Medida de escritorio");
  await page.setViewportSize({ width: 1600, height: 900 });
  await ir(page, "/");
  const franja = page.locator("[data-franja=transparencia]");
  expect((await franja.boundingBox())!.width).toBe(1600);
  const contenedor = franja.locator(".contenedor");
  expect((await contenedor.boundingBox())!.width).toBe(1320);
});

test("carrusel principal: anterior, siguiente y pausa", async ({ page }) => {
  await ir(page, "/");
  const carrusel = page.getByRole("region", { name: "Noticias y avisos destacados" });
  await expect(carrusel).toBeVisible();
  const visible = () => carrusel.locator("[data-diapositiva]:not([hidden])");
  await expect(visible()).toHaveAttribute("aria-label", /^1 de \d+$/);
  await carrusel.getByRole("button", { name: "Diapositiva siguiente" }).click();
  await expect(visible()).toHaveAttribute("aria-label", /^2 de \d+$/);
  await carrusel.getByRole("button", { name: "Diapositiva anterior" }).click();
  await expect(visible()).toHaveAttribute("aria-label", /^1 de \d+$/);
  // Pausa (WCAG 2.2.2): el botón cambia de estado.
  await carrusel.getByRole("button", { name: "Pausar el carrusel" }).click();
  await expect(carrusel.getByRole("button", { name: "Reanudar el carrusel" })).toBeVisible();
  // Cada diapositiva lleva a su noticia o aviso.
  await expect(visible().getByRole("link")).toHaveAttribute("href", /^\/|^https:/);
});

test("el carrusel no se mueve para quien pidió reducir el movimiento", async ({ browser, baseURL }) => {
  const contexto = await browser.newContext({ baseURL, reducedMotion: "reduce" });
  const page = await contexto.newPage();
  await ir(page, "/");
  const carrusel = page.getByRole("region", { name: "Noticias y avisos destacados" });
  await expect(carrusel.getByRole("button", { name: "Diapositiva siguiente" })).toBeVisible();
  await expect(carrusel.getByRole("button", { name: /Pausar|Reanudar/ })).toHaveCount(0);
  await contexto.close();
});

test("Arrendatarios va después de Contactos y muestra sus servicios", async ({ page }) => {
  await ir(page, "/");
  if (esMovil(page)) {
    await page.getByRole("button", { name: "Menú" }).click();
  }
  const menu = page.getByRole("navigation", { name: "Menú principal" }).filter({ visible: true });
  const etiquetas = (await menu.locator(":scope > ul > li, :scope > div > ul > li").allInnerTexts()).map((t) => t.trim());
  const contactos = etiquetas.findIndex((t) => t.startsWith("Contactos"));
  expect(contactos).toBeGreaterThan(-1);
  expect(etiquetas[contactos + 1]).toBe("Arrendatarios");

  await ir(page, "/arrendatarios");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Arrendatarios");
  await expect(page.getByRole("link", { name: /No Objeción/ })).toBeVisible();
});

for (const ruta of ["/", "/arrendatarios"]) {
  test(`sin violaciones axe en ${ruta} con el diseño nuevo`, async ({ page }) => {
    await ir(page, ruta);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
  });
}
