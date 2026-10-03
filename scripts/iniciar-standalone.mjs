// Ejecuta la compilación "standalone" igual que la imagen Docker: copia public y .next/static
// junto al servidor y lo inicia. Uso: npm run build && npm run start:local
import { cpSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const raiz = path.resolve(import.meta.dirname, "..");
const destino = path.join(raiz, ".next", "standalone");
cpSync(path.join(raiz, "public"), path.join(destino, "public"), { recursive: true });
cpSync(path.join(raiz, ".next", "static"), path.join(destino, ".next", "static"), { recursive: true });
await import(pathToFileURL(path.join(destino, "server.js")).href);
