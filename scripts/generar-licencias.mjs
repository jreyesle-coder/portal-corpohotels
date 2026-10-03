// Créditos de licencias de código abierto en el código fuente (A2 5.02.a.i).
// Lista todas las dependencias de producción con su versión y licencia en LICENCIAS-TERCEROS.md.
// Uso: npm run licencias  (ejecutar tras instalar o actualizar dependencias)
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const arbol = JSON.parse(
  execSync("npm ls --omit=dev --all --json --long", { cwd: raiz, maxBuffer: 256 * 1024 * 1024 }).toString(),
);

const paquetes = new Map();
const recorrer = (nodo) => {
  for (const [nombre, dep] of Object.entries(nodo.dependencies ?? {})) {
    if (!dep.version || !dep.path) continue;
    const clave = `${nombre}@${dep.version}`;
    if (paquetes.has(clave)) continue;
    let licencia = "Sin declarar";
    let repositorio = "";
    try {
      const pkg = JSON.parse(readFileSync(path.join(dep.path, "package.json"), "utf8"));
      licencia = typeof pkg.license === "string" ? pkg.license : pkg.license?.type ?? licencia;
      const repo = typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url;
      repositorio = (pkg.homepage ?? repo ?? "").replace(/^git\+/, "").replace(/\.git$/, "");
    } catch {
      // Paquete opcional no instalado en esta plataforma.
    }
    paquetes.set(clave, { nombre, version: dep.version, licencia, repositorio });
    recorrer(dep);
  }
};
recorrer(arbol);

const filas = [...paquetes.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
const porLicencia = filas.reduce((acc, p) => ((acc[p.licencia] = (acc[p.licencia] ?? 0) + 1), acc), {});

const md = [
  "# Créditos de licencias de código abierto",
  "",
  "El portal de CORPHOTELS usa los siguientes componentes de código abierto (NORTIC A2:2023, 5.02.a.i).",
  "Archivo generado con `npm run licencias`; no se edita a mano.",
  "",
  "## Resumen por licencia",
  "",
  "| Licencia | Paquetes |",
  "| --- | --- |",
  ...Object.entries(porLicencia)
    .sort((a, b) => b[1] - a[1])
    .map(([l, n]) => `| ${l} | ${n} |`),
  "",
  "## Componentes",
  "",
  "| Paquete | Versión | Licencia | Proyecto |",
  "| --- | --- | --- | --- |",
  ...filas.map((p) => `| ${p.nombre} | ${p.version} | ${p.licencia} | ${p.repositorio} |`),
  "",
].join("\n");

writeFileSync(path.join(raiz, "LICENCIAS-TERCEROS.md"), md);
console.log(`LICENCIAS-TERCEROS.md: ${filas.length} paquetes`, porLicencia);
