import { expect, type APIRequestContext, test } from "@playwright/test";
import pg from "pg";
import { contenido, corrida, iniciarSesion, origen, PDF_MINIMO, PNG_1X1, sesion } from "./ayudas";

/**
 * Criterios "Listo cuando" de S1:
 * - un editor crea una noticia y un publicador la aprueba;
 * - un documento muestra sus cuatro metadatos (A2 2.01.b.xiii);
 * - un usuario sin MFA no entra (A2 5.05.o).
 * Además: roles con mínimo privilegio (A8 3.01.5) y bitácora append-only (A8 3.04.3).
 * Usa el simulador de Entra ID de Docker Compose (servicio entra-simulado).
 */

async function subirImagen(api: APIRequestContext, baseURL: string) {
  const r = await api.post("/api/medios", {
    headers: origen(baseURL),
    multipart: {
      file: { name: `Foto Prueba ${corrida}.png`, mimeType: "image/png", buffer: PNG_1X1 },
      _payload: JSON.stringify({ alt: "Fachada de la sede de CORPHOTELS" }),
    },
  });
  expect(r.status(), await r.text()).toBe(201);
  return (await r.json()).doc;
}

test.describe("Autenticación con Entra ID (A2 5.05.o, A8 3.01.3)", () => {
  test("un usuario sin MFA no entra", async ({ page }) => {
    await iniciarSesion(page, "sinmfa", { roles: ["Editor"], mfa: false });
    await expect(page).toHaveURL(/\/acceso-denegado\?motivo=sin-mfa$/);
    await expect(page.getByText("Falta la verificación en dos pasos")).toBeVisible();
    const yo = await (await page.request.get("/api/usuarios/me")).json();
    expect(yo.user).toBeNull();
  });

  test("un usuario sin rol del CMS no entra", async ({ page }) => {
    await iniciarSesion(page, "sinrol", { roles: [] });
    await expect(page).toHaveURL(/\/acceso-denegado\?motivo=sin-rol$/);
  });

  test("el panel no ofrece usuario y contraseña locales", async ({ page }) => {
    await page.goto("/gestion/login");
    await expect(page.getByRole("link", { name: "Iniciar sesión con Microsoft" })).toBeVisible();
    await expect(page.locator("input[type=password]")).toHaveCount(0);
  });

  test("cerrar sesión invalida la cookie aunque se reutilice", async ({ browser, baseURL }) => {
    const { api, page, cerrar } = await sesion(browser, "cierre", { roles: ["Editor"] });
    const cookie = (await page.context().cookies()).find((c) => c.name === "cph-token")!;
    expect((await (await api.get("/api/usuarios/me")).json()).user).not.toBeNull();
    expect((await api.post("/api/usuarios/logout", { headers: origen(baseURL!) })).ok()).toBe(true);
    const repetida = await api.get("/api/usuarios/me", { headers: { Cookie: `cph-token=${cookie.value}` } });
    expect((await repetida.json()).user).toBeNull();
    await cerrar();
  });
});

test.describe("Flujo editorial (A8 3.01.5)", () => {
  test("un editor crea una noticia y un publicador la aprueba", async ({ browser, baseURL, request }) => {
    const editor = await sesion(browser, "editor", { roles: ["Editor"] });
    const imagen = await subirImagen(editor.api, baseURL!);
    const titulo = `Noticia de prueba ${corrida}`;

    const creada = await editor.api.post("/api/noticias?draft=true", {
      headers: origen(baseURL!),
      data: {
        titulo,
        lugar: "Santo Domingo",
        imagen: imagen.id,
        resumen: "Resumen de la noticia de prueba.",
        contenido: contenido("Contenido de la noticia de prueba."),
        listaParaRevision: true,
      },
    });
    expect(creada.status(), await creada.text()).toBe(201);
    const noticia = (await creada.json()).doc;
    expect(noticia.slug).toBe(`noticia-de-prueba-${corrida}`);
    expect(noticia._status).toBe("draft");

    // El editor no puede publicar.
    const intento = await editor.api.patch(`/api/noticias/${noticia.id}`, {
      headers: origen(baseURL!),
      data: { _status: "published" },
    });
    expect(intento.status()).toBe(403);

    // El público aún no la ve.
    const antes = await request.get(`/api/noticias?where[slug][equals]=${noticia.slug}`);
    expect((await antes.json()).totalDocs).toBe(0);

    const publicador = await sesion(browser, "publicador", { roles: ["Publicador"] });
    const aprobada = await publicador.api.patch(`/api/noticias/${noticia.id}`, {
      headers: origen(baseURL!),
      data: { _status: "published" },
    });
    expect(aprobada.status(), await aprobada.text()).toBe(200);

    const despues = await request.get(`/api/noticias?where[slug][equals]=${noticia.slug}`);
    expect((await despues.json()).docs[0]?.titulo).toBe(titulo);

    // Un editor no puede tocar directamente lo publicado ni eliminar.
    const cambio = await editor.api.patch(`/api/noticias/${noticia.id}`, {
      headers: origen(baseURL!),
      data: { titulo: `${titulo} (editada)` },
    });
    expect(cambio.status()).toBe(403);
    expect((await editor.api.delete(`/api/noticias/${noticia.id}`, { headers: origen(baseURL!) })).status()).toBe(403);

    await editor.cerrar();
    await publicador.cerrar();
  });

  test("la API rechaza escrituras sin el origen del propio sitio (CSRF)", async ({ browser }) => {
    const editor = await sesion(browser, "csrf", { roles: ["Editor"] });
    const r = await editor.api.post("/api/categorias", {
      headers: { Origin: "https://sitio-malicioso.example" },
      data: { nombre: `Categoría ${corrida}` },
    });
    expect([401, 403]).toContain(r.status());
    await editor.cerrar();
  });
});

test.describe("Gestor documental (A2 2.01.b.xiii)", () => {
  test("un documento muestra sus cuatro metadatos", async ({ browser, baseURL }) => {
    const editor = await sesion(browser, "documentos", { roles: ["Editor"] });
    const r = await editor.api.post("/api/documentos", {
      headers: origen(baseURL!),
      multipart: {
        file: { name: `Memoria Institucional ${corrida}.pdf`, mimeType: "application/pdf", buffer: PDF_MINIMO },
        _payload: JSON.stringify({
          titulo: `Memoria institucional ${corrida}`,
          descripcion: "Resumen de la gestión institucional del año.",
          fechaCreacion: "2026-01-15T12:00:00.000Z",
          area: "institucional",
        }),
      },
    });
    expect(r.status(), await r.text()).toBe(201);
    const doc = (await r.json()).doc;
    expect(doc.filename).toBe(`memoria-institucional-${corrida}.pdf`);

    // El editor no puede cargar en el área de transparencia (es de la OAI).
    const ajeno = await editor.api.post("/api/documentos", {
      headers: origen(baseURL!),
      multipart: {
        file: { name: "otro.pdf", mimeType: "application/pdf", buffer: PDF_MINIMO },
        _payload: JSON.stringify({ titulo: "Otro", descripcion: "Otro", area: "transparencia" }),
      },
    });
    expect(ajeno.status()).toBe(403);

    await editor.page.goto("/componentes");
    const tarjeta = editor.page.locator("[data-descarga]", { hasText: `Memoria institucional ${corrida}` });
    await expect(tarjeta.locator("[data-meta=descripcion]")).toHaveText("Resumen de la gestión institucional del año.");
    await expect(tarjeta.locator("[data-meta=tipo]")).toHaveText("PDF");
    await expect(tarjeta.locator("[data-meta=tamano]")).toHaveText(/^\d+ B$/);
    await expect(tarjeta.locator("[data-meta=fecha]")).toHaveText("15 de enero de 2026");
    await expect(tarjeta.getByRole("link", { name: /Descargar/ })).toHaveAttribute("target", "_blank");
    await editor.cerrar();
  });
});

test.describe("Bitácora append-only (A8 3.01.5.d, 3.04.3)", () => {
  test("registra accesos y publicaciones, y solo la leen auditor y administrador", async ({ browser }) => {
    const editor = await sesion(browser, "lector", { roles: ["Editor"] });
    expect((await editor.api.get("/api/bitacora")).status()).toBe(403);
    await editor.cerrar();

    const auditor = await sesion(browser, "auditor", { roles: ["Auditor"] });
    const r = await auditor.api.get("/api/bitacora?limit=200&sort=-fecha");
    expect(r.status()).toBe(200);
    const eventos = new Set(((await r.json()).docs as { evento: string }[]).map((d) => d.evento));
    for (const e of ["inicio_sesion", "inicio_sesion_rechazado"]) expect(eventos).toContain(e);
    expect((await auditor.api.post("/api/categorias", { data: { nombre: "x" } })).status()).toBe(403);
    await auditor.cerrar();
  });

  test("PostgreSQL rechaza modificar o borrar la bitácora", async () => {
    const cliente = new pg.Client({ connectionString: "postgres://portal:portal_dev@localhost:5432/portal" });
    await cliente.connect();
    await expect(cliente.query("UPDATE bitacora SET titulo = 'alterado'")).rejects.toThrow(/solo inserción/);
    await expect(cliente.query("DELETE FROM bitacora")).rejects.toThrow(/solo inserción/);
    await expect(cliente.query("TRUNCATE bitacora CASCADE")).rejects.toThrow(/solo inserción/);
    await cliente.end();
  });
});
