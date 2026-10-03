import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_documentos_seccion_transparencia" AS ENUM('base-legal/constitucion', 'base-legal/leyes', 'base-legal/decretos', 'base-legal/resoluciones', 'base-legal/otras-normativas', 'marco-legal/leyes', 'marco-legal/decretos', 'marco-legal/resoluciones', 'marco-legal/otras-normativas', 'estructura-organica', 'oai/derechos', 'oai/estructura', 'oai/manual-organizacion', 'oai/manual-procedimiento', 'oai/estadisticas', 'oai/rai', 'oai/informacion-clasificada', 'oai/indice-documentos', 'oai/saip', 'oai/indice-transparencia', 'plan-estrategico/planificacion', 'plan-estrategico/poa', 'plan-estrategico/memorias', 'publicaciones', 'estadisticas', 'servicios', 'portal-311/enlace', 'portal-311/estadisticas', 'declaracion-jurada', 'presupuesto/aprobado', 'presupuesto/ejecucion', 'recursos-humanos/nomina', 'recursos-humanos/jubilaciones', 'recursos-humanos/concursa', 'programas-asistenciales', 'compras/registro-proveedor', 'compras/pacc', 'compras/licitacion-publica', 'compras/licitacion-restringida', 'compras/sorteo-obras', 'compras/comparaciones-precios', 'compras/compras-menores', 'compras/subasta-inversa', 'compras/debajo-umbral', 'compras/mipymes', 'compras/casos-excepcion', 'compras/estados-cuentas-suplidores', 'proyectos', 'finanzas/estados-financieros', 'finanzas/informes-financieros', 'finanzas/ingresos-egresos', 'finanzas/auditorias', 'finanzas/activos-fijos', 'finanzas/inventario', 'datos-abiertos', 'cep/miembros', 'cep/compromiso', 'cep/plan-trabajo', 'consulta-publica');
  CREATE TYPE "public"."enum_documentos_periodo" AS ENUM('anual', 't1', 't2', 't3', 't4', 'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12');
  CREATE TYPE "public"."enum_textos_transparencia_seccion" AS ENUM('inicio', 'base-legal', 'marco-legal', 'oai', 'plan-estrategico', 'portal-311', 'presupuesto', 'recursos-humanos', 'compras', 'finanzas', 'cep', 'base-legal/constitucion', 'base-legal/leyes', 'base-legal/decretos', 'base-legal/resoluciones', 'base-legal/otras-normativas', 'marco-legal/leyes', 'marco-legal/decretos', 'marco-legal/resoluciones', 'marco-legal/otras-normativas', 'estructura-organica', 'oai/derechos', 'oai/estructura', 'oai/manual-organizacion', 'oai/manual-procedimiento', 'oai/estadisticas', 'oai/rai', 'oai/informacion-clasificada', 'oai/indice-documentos', 'oai/saip', 'oai/indice-transparencia', 'plan-estrategico/planificacion', 'plan-estrategico/poa', 'plan-estrategico/memorias', 'publicaciones', 'estadisticas', 'servicios', 'portal-311/enlace', 'portal-311/estadisticas', 'declaracion-jurada', 'presupuesto/aprobado', 'presupuesto/ejecucion', 'recursos-humanos/nomina', 'recursos-humanos/jubilaciones', 'recursos-humanos/concursa', 'programas-asistenciales', 'compras/registro-proveedor', 'compras/pacc', 'compras/licitacion-publica', 'compras/licitacion-restringida', 'compras/sorteo-obras', 'compras/comparaciones-precios', 'compras/compras-menores', 'compras/subasta-inversa', 'compras/debajo-umbral', 'compras/mipymes', 'compras/casos-excepcion', 'compras/estados-cuentas-suplidores', 'proyectos', 'finanzas/estados-financieros', 'finanzas/informes-financieros', 'finanzas/ingresos-egresos', 'finanzas/auditorias', 'finanzas/activos-fijos', 'finanzas/inventario', 'datos-abiertos', 'cep/miembros', 'cep/compromiso', 'cep/plan-trabajo', 'consulta-publica');
  CREATE TABLE "textos_transparencia" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seccion" "enum_textos_transparencia_seccion" NOT NULL,
  	"contenido" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "documentos" ALTER COLUMN "area" DROP DEFAULT;
  ALTER TABLE "documentos" ALTER COLUMN "seccion" DROP NOT NULL;
  ALTER TABLE "documentos" ADD COLUMN "seccion_transparencia" "enum_documentos_seccion_transparencia";
  ALTER TABLE "documentos" ADD COLUMN "anio" numeric;
  ALTER TABLE "documentos" ADD COLUMN "periodo" "enum_documentos_periodo";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "textos_transparencia_id" integer;
  CREATE UNIQUE INDEX "textos_transparencia_seccion_idx" ON "textos_transparencia" USING btree ("seccion");
  CREATE INDEX "textos_transparencia_updated_at_idx" ON "textos_transparencia" USING btree ("updated_at");
  CREATE INDEX "textos_transparencia_created_at_idx" ON "textos_transparencia" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_textos_transparencia_fk" FOREIGN KEY ("textos_transparencia_id") REFERENCES "public"."textos_transparencia"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "documentos_seccion_transparencia_idx" ON "documentos" USING btree ("seccion_transparencia");
  CREATE INDEX "documentos_anio_idx" ON "documentos" USING btree ("anio");
  CREATE INDEX "payload_locked_documents_rels_textos_transparencia_id_idx" ON "payload_locked_documents_rels" USING btree ("textos_transparencia_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "textos_transparencia" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "textos_transparencia" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_textos_transparencia_fk";
  
  DROP INDEX "documentos_seccion_transparencia_idx";
  DROP INDEX "documentos_anio_idx";
  DROP INDEX "payload_locked_documents_rels_textos_transparencia_id_idx";
  ALTER TABLE "documentos" ALTER COLUMN "area" SET DEFAULT 'institucional';
  ALTER TABLE "documentos" ALTER COLUMN "seccion" SET NOT NULL;
  ALTER TABLE "documentos" DROP COLUMN "seccion_transparencia";
  ALTER TABLE "documentos" DROP COLUMN "anio";
  ALTER TABLE "documentos" DROP COLUMN "periodo";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "textos_transparencia_id";
  DROP TYPE "public"."enum_documentos_seccion_transparencia";
  DROP TYPE "public"."enum_documentos_periodo";
  DROP TYPE "public"."enum_textos_transparencia_seccion";`)
}
