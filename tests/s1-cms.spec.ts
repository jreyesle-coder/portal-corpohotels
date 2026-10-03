import { randomUUID } from "node:crypto";
import { expect, type APIRequestContext, type Browser, type Page, test } from "@playwright/test";
import pg from "pg";

/**
 * Criterios "Listo cuando" de S1:
 * - un editor crea una noticia y un publicador la aprueba;
 * - un documento muestra sus cuatro metadatos (A2 2.01.b.xiii);
 * - un usuario sin MFA no entra (A2 5.05.o).
 * Además: roles con mínimo privilegio (A8 3.01.5) y bitácora append-only (A8 3.04.3).
 * Usa el simulador de Entra ID de Docker Compose (servicio entra-simulado).
 */

const corrida = randomUUID().slice(0, 8);
type Perfil = { roles: string[]; mfa?: boolean };

async function iniciarSesion(page: Page, nombre: string, { roles, mfa = true }: Perfil) {
  await page.goto("/auth/entra/iniciar?destino=/gestion");
  const oid = `oid-${nombre}-${corrida}`;
  await page.getByPlaceholder("Enter any user/subject").fill(oid);
  await page.locator("textarea[name=claims]").fill(
    JSON.stringify({
      oid,
      email: `${nombre}.${corrida}@corphotels.gob.do`,
      name: `${nombre} ${corrida}`,
      roles,
      amr: mfa ? ["pwd", "mfa"] : ["pwd"],
    }),
  );
  await page.getByRole("button", { name: "Sign-in" }).click();
  await page.waitForURL((u) => !u.href.includes("/entra/authorize") && !u.pathname.startsWith("/auth/"));
}

async function sesion(browser: Browser, nombre: string, perfil: Perfil) {
  // Como un navegador real en el propio sitio: las peticiones a la API llevan el origen del portal.
  const baseURL = test.info().project.use.baseURL!;
  const contexto = await browser.newContext({ baseURL, extraHTTPHeaders: { Origin: baseURL } });
  const page = await contexto.newPage();
  await iniciarSesion(page, nombre, perfil);
  return { page, api: page.request, cerrar: () => contexto.close() };
}

/** Peticiones con cookie de sesión: Payload exige el origen del propio sitio (protección CSRF). */
const origen = (baseURL: string) => ({ Origin: baseURL });

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
/** PDF válido de una página, con tabla de referencias cruzada correcta (Payload valida su integridad). */
function pdfValido(): Buffer {
  const objetos = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>",
  ];
  let cuerpo = "%PDF-1.4\n";
  const posiciones: number[] = [];
  objetos.forEach((o, i) => {
    posiciones.push(Buffer.byteLength(cuerpo));
    cuerpo += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(cuerpo);
  cuerpo += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  cuerpo += posiciones.map((p) => `${String(p).padStart(10, "0")} 00000 n \n`).join("");
  cuerpo += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(cuerpo);
}
const PDF_MINIMO = pdfValido();
const contenido = (texto: string) => ({
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        textFormat: 0,
        children: [{ type: "text", text: texto, format: 0, style: "", mode: "normal", detail: 0, version: 1 }],
      },
    ],
  },
});

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
