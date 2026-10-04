import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_redirecciones_tipo" AS ENUM('exacta', 'prefijo', 'identificador');
  CREATE TABLE "redirecciones" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"origen" varchar NOT NULL,
  	"destino" varchar NOT NULL,
  	"tipo" "enum_redirecciones_tipo" DEFAULT 'exacta' NOT NULL,
  	"nota" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "noticias" ADD COLUMN "origen_url" varchar;
  ALTER TABLE "noticias" ADD COLUMN "origen_identificador" varchar;
  ALTER TABLE "_noticias_v" ADD COLUMN "version_origen_url" varchar;
  ALTER TABLE "_noticias_v" ADD COLUMN "version_origen_identificador" varchar;
  ALTER TABLE "medios" ADD COLUMN "origen_url" varchar;
  ALTER TABLE "medios" ADD COLUMN "origen_identificador" varchar;
  ALTER TABLE "documentos" ADD COLUMN "origen_url" varchar;
  ALTER TABLE "documentos" ADD COLUMN "origen_identificador" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirecciones_id" integer;
  CREATE UNIQUE INDEX "redirecciones_origen_idx" ON "redirecciones" USING btree ("origen");
  CREATE INDEX "redirecciones_updated_at_idx" ON "redirecciones" USING btree ("updated_at");
  CREATE INDEX "redirecciones_created_at_idx" ON "redirecciones" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirecciones_fk" FOREIGN KEY ("redirecciones_id") REFERENCES "public"."redirecciones"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "noticias_origen_origen_url_idx" ON "noticias" USING btree ("origen_url");
  CREATE INDEX "noticias_origen_origen_identificador_idx" ON "noticias" USING btree ("origen_identificador");
  CREATE INDEX "_noticias_v_version_origen_version_origen_url_idx" ON "_noticias_v" USING btree ("version_origen_url");
  CREATE INDEX "_noticias_v_version_origen_version_origen_identificador_idx" ON "_noticias_v" USING btree ("version_origen_identificador");
  CREATE INDEX "medios_origen_origen_url_idx" ON "medios" USING btree ("origen_url");
  CREATE INDEX "medios_origen_origen_identificador_idx" ON "medios" USING btree ("origen_identificador");
  CREATE INDEX "documentos_origen_origen_url_idx" ON "documentos" USING btree ("origen_url");
  CREATE INDEX "documentos_origen_origen_identificador_idx" ON "documentos" USING btree ("origen_identificador");
  CREATE INDEX "payload_locked_documents_rels_redirecciones_id_idx" ON "payload_locked_documents_rels" USING btree ("redirecciones_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "redirecciones" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "redirecciones" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_redirecciones_fk";
  
  DROP INDEX "noticias_origen_origen_url_idx";
  DROP INDEX "noticias_origen_origen_identificador_idx";
  DROP INDEX "_noticias_v_version_origen_version_origen_url_idx";
  DROP INDEX "_noticias_v_version_origen_version_origen_identificador_idx";
  DROP INDEX "medios_origen_origen_url_idx";
  DROP INDEX "medios_origen_origen_identificador_idx";
  DROP INDEX "documentos_origen_origen_url_idx";
  DROP INDEX "documentos_origen_origen_identificador_idx";
  DROP INDEX "payload_locked_documents_rels_redirecciones_id_idx";
  ALTER TABLE "noticias" DROP COLUMN "origen_url";
  ALTER TABLE "noticias" DROP COLUMN "origen_identificador";
  ALTER TABLE "_noticias_v" DROP COLUMN "version_origen_url";
  ALTER TABLE "_noticias_v" DROP COLUMN "version_origen_identificador";
  ALTER TABLE "medios" DROP COLUMN "origen_url";
  ALTER TABLE "medios" DROP COLUMN "origen_identificador";
  ALTER TABLE "documentos" DROP COLUMN "origen_url";
  ALTER TABLE "documentos" DROP COLUMN "origen_identificador";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirecciones_id";
  DROP TYPE "public"."enum_redirecciones_tipo";`)
}
