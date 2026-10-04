import { expect, type Page, test } from "@playwright/test";
import { HtmlValidate } from "html-validate";

/**
 * S7 — Endurecimiento y calidad: HTML válido (A2 7.01.d), cabeceras de seguridad (A8 3.03),
 * errores sin información del servidor (A2 5.05.j) y navegación por teclado (A2 7.01.e, j).
 * El pipeline de dependencias, secretos, CodeQL y ZAP está en .github/workflows/calidad.yml.
 */
const PLANTILLAS = [
  "/",
  "/sobre-nosotros/historia",
  "/sobre-nosotros/marco-legal",
  "/servicios",
  "/servicios/solicitud-de-no-objecion-para-obras",
  "/noticias",
  "/transparencia",
  "/transparencia/presupuesto/ejecucion",
  "/contactos",
  "/contactos/sugerencias",
  "/preguntas-frecuentes",
  "/arrendatarios",
  "/buscar?q=presupuesto",
  "/mapa-del-sitio",
  "/no-existe",
];

const validador = new HtmlValidate({ extends: ["html-validate:standard"] });

/**
 * Única excepción: React escribe action="" en los formularios con Server Actions (envío al mismo
 * URL, protegido por la verificación de origen de Next). No es un error de marcado del portal.
 */
const esExcepcion = (m: { ruleId: string; message: string; selector: string | null }) =>
  m.ruleId === "attribute-allowed-values" && m.message.includes('"action" has invalid value ""');

test.describe("HTML válido (A2 7.01.d)", () => {
  for (const ruta of PLANTILLAS) {
    test(`sin errores de marcado en ${ruta}`, async ({ request }) => {
      test.skip(test.info().project.name !== "escritorio", "El marcado es el mismo en móvil");
      const html = await (await request.get(ruta)).text();
      const informe = await validador.validateString(html);
      const errores = informe.results.flatMap((r) => r.messages).filter((m) => !esExcepcion(m));
      expect(errores.map((m) => `${m.ruleId}: ${m.message} (${m.selector})`)).toEqual([]);
    });
  }
});

test.describe("Cabeceras de seguridad (A8 3.03)", () => {
  test("las páginas llevan CSP con nonce propio y las cabeceras de protección", async ({ request }) => {
    const r1 = await request.get("/");
    const r2 = await request.get("/");
    const h = r1.headers();
    const csp = h["content-security-policy"];
    expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-eval'/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    // Un nonce distinto en cada respuesta.
    const nonce = (v: string) => /'nonce-([^']+)'/.exec(v)?.[1];
    expect(nonce(csp)).not.toBe(nonce(r2.headers()["content-security-policy"]));
    expect(h["strict-transport-security"]).toContain("max-age=63072000");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toContain("camera=()");
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
    expect(h["x-powered-by"]).toBeUndefined();
  });

  test("los scripts propios llevan el nonce y la página no registra violaciones de CSP", async ({ page, request }) => {
    const violaciones: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && /Content Security Policy/i.test(m.text())) violaciones.push(m.text());
    });
    await page.addInitScript(() => localStorage.setItem("portal.estadisticas", "rechazadas"));
    for (const ruta of ["/", "/contactos", "/transparencia/oai", "/buscar?q=hotel"]) {
      await page.goto(ruta);
      await page.waitForLoadState("load");
    }
    expect(violaciones).toEqual([]);
    // Todo <script> ejecutable del HTML que envía el servidor lleva el nonce; los fragmentos que Next
    // carga después los autoriza 'strict-dynamic'.
    const html = await (await request.get("/")).text();
    const scripts = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]).filter((s) => !s.includes("application/ld+json"));
    expect(scripts.length).toBeGreaterThan(0);
    expect(scripts.filter((s) => !/\snonce="/.test(s))).toEqual([]);
  });

  test("los archivos y la API también llevan las cabeceras", async ({ request }) => {
    const h = (await request.get("/api/salud")).headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
  });
});

test.describe("Errores sin información del servidor (A2 5.05.j)", () => {
  for (const ruta of ["/api/noticias/no-es-un-id", "/api/noticias?where[titulo][like]=%27%20OR%201=1--", "/exportar-pdf?tipo=x&slug=../../etc/passwd"]) {
    test(`sin rastros técnicos en ${ruta}`, async ({ request }) => {
      const r = await request.get(ruta);
      const cuerpo = await r.text();
      expect(cuerpo).not.toMatch(/at \w+ \(|node_modules|\\src\\|\/src\/|stack|Error: |SELECT |postgres/i);
    });
  }
});

test.describe("Robustez ante entradas maliciosas (hallazgos de ZAP)", () => {
  test("números fuera de rango y bytes nulos no producen errores del servidor", async ({ request }) => {
    for (const ruta of [
      "/noticias?pagina=49540730403900210000",
      "/buscar?q=a%00b",
      "/index.php/noticias%00x",
      "/noticias%00x",
      "/transparencia/presupuesto/ejecucion?anio=99999999999999999999",
    ]) {
      const r = await request.get(ruta);
      expect(r.status(), ruta).toBeLessThan(500);
    }
    expect((await request.get("/api/salud")).status()).toBe(200);
  });
});

test.describe("Teclado (A2 7.01.e, j)", () => {
  async function recorrer(page: Page, pasos: number) {
    const enfocados: string[] = [];
    for (let i = 0; i < pasos; i++) {
      await page.keyboard.press("Tab");
      enfocados.push(
        await page.evaluate(() => {
          const e = document.activeElement as HTMLElement | null;
          if (!e || e === document.body) return "";
          const r = e.getBoundingClientRect();
          const nombre = e.getAttribute("aria-label") ?? e.getAttribute("href") ?? e.textContent?.trim().slice(0, 40) ?? "";
          return `${e.tagName}:${nombre}|${r.width > 0 && r.height > 0 ? "visible" : "oculto"}`;
        }),
      );
    }
    return enfocados;
  }

  test("la portada se recorre con Tab sin trampas y con foco siempre visible", async ({ page }) => {
    test.skip(test.info().project.name !== "escritorio", "Teclado físico en escritorio");
    await page.addInitScript(() => localStorage.setItem("portal.estadisticas", "rechazadas"));
    await page.goto("/");
    const enfocados = await recorrer(page, 60);
    expect(enfocados.filter((e) => e.endsWith("oculto"))).toEqual([]);
    // Sin trampas de foco: el recorrido avanza por elementos distintos.
    expect(new Set(enfocados).size).toBeGreaterThan(5);
    // El carrusel se controla con teclado: el botón de pausa es alcanzable.
    await page.goto("/");
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press("Tab");
      const nombre = await page.evaluate(() => document.activeElement?.textContent ?? "");
      if (/Pausar el carrusel/.test(nombre)) {
        await page.keyboard.press("Enter");
        await expect(page.getByRole("button", { name: "Reanudar el carrusel" })).toBeVisible();
        return;
      }
    }
    throw new Error("El botón de pausa del carrusel no se alcanza con Tab");
  });
});
