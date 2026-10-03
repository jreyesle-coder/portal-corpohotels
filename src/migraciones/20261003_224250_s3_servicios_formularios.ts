import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_servicios_canales" AS ENUM('en-linea', 'presencial', 'telefono', 'correo');
  CREATE TYPE "public"."enum__servicios_v_version_canales" AS ENUM('en-linea', 'presencial', 'telefono', 'correo');
  CREATE TYPE "public"."enum_casos_tipo" AS ENUM('contacto', 'sugerencia', 'solicitud');
  CREATE TYPE "public"."enum_casos_estado" AS ENUM('recibido', 'en-proceso', 'respondido', 'cerrado');
  CREATE TYPE "public"."enum_encuestas_facilidad" AS ENUM('si', 'no');
  CREATE TABLE "servicios_requisitos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar
  );
  
  CREATE TABLE "servicios_procedimiento" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar
  );
  
  CREATE TABLE "servicios_canales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_servicios_canales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_servicios_v_version_requisitos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"texto" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_servicios_v_version_procedimiento" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"texto" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_servicios_v_version_canales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__servicios_v_version_canales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "casos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"numero" varchar NOT NULL,
  	"tipo" "enum_casos_tipo" NOT NULL,
  	"estado" "enum_casos_estado" DEFAULT 'recibido' NOT NULL,
  	"servicio_id" integer,
  	"asunto" varchar,
  	"nombre" varchar,
  	"correo" varchar,
  	"telefono" varchar,
  	"cedula" varchar,
  	"mensaje" varchar,
  	"consentimiento_aceptado" boolean DEFAULT false NOT NULL,
  	"consentimiento_fecha" timestamp(3) with time zone,
  	"consentimiento_texto" varchar,
  	"notas_internas" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "encuestas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"calificacion" numeric NOT NULL,
  	"facilidad" "enum_encuestas_facilidad",
  	"comentario" varchar,
  	"tipo" varchar,
  	"servicio_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "servicios" ADD COLUMN "nombre_coloquial" varchar;
  ALTER TABLE "servicios" ADD COLUMN "dirigido_a" varchar;
  ALTER TABLE "servicios" ADD COLUMN "area_responsable" varchar;
  ALTER TABLE "servicios" ADD COLUMN "contacto_area_telefono" varchar;
  ALTER TABLE "servicios" ADD COLUMN "contacto_area_extension" varchar;
  ALTER TABLE "servicios" ADD COLUMN "contacto_area_correo" varchar;
  ALTER TABLE "servicios" ADD COLUMN "horario" varchar;
  ALTER TABLE "servicios" ADD COLUMN "costo" varchar;
  ALTER TABLE "servicios" ADD COLUMN "tiempo_respuesta" varchar;
  ALTER TABLE "servicios" ADD COLUMN "tiempo_realizacion" varchar;
  ALTER TABLE "servicios" ADD COLUMN "acceso_solicitud_en_linea" boolean DEFAULT false;
  ALTER TABLE "servicios" ADD COLUMN "acceso_url" varchar;
  ALTER TABLE "servicios" ADD COLUMN "informacion_adicional" jsonb;
  ALTER TABLE "servicios" ADD COLUMN "lista_para_revision" boolean DEFAULT false;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_nombre_coloquial" varchar;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_dirigido_a" varchar;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_area_responsable" varchar;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_contacto_area_telefono" varchar;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_contacto_area_extension" varchar;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_contacto_area_correo" varchar;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_horario" varchar;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_costo" varchar;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_tiempo_respuesta" varchar;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_tiempo_realizacion" varchar;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_acceso_solicitud_en_linea" boolean DEFAULT false;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_acceso_url" varchar;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_informacion_adicional" jsonb;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_lista_para_revision" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "casos_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "encuestas_id" integer;
  ALTER TABLE "servicios_requisitos" ADD CONSTRAINT "servicios_requisitos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_procedimiento" ADD CONSTRAINT "servicios_procedimiento_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_canales" ADD CONSTRAINT "servicios_canales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_servicios_v_version_requisitos" ADD CONSTRAINT "_servicios_v_version_requisitos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_servicios_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_servicios_v_version_procedimiento" ADD CONSTRAINT "_servicios_v_version_procedimiento_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_servicios_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_servicios_v_version_canales" ADD CONSTRAINT "_servicios_v_version_canales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_servicios_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_servicio_id_servicios_id_fk" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "encuestas" ADD CONSTRAINT "encuestas_servicio_id_servicios_id_fk" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicios"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "servicios_requisitos_order_idx" ON "servicios_requisitos" USING btree ("_order");
  CREATE INDEX "servicios_requisitos_parent_id_idx" ON "servicios_requisitos" USING btree ("_parent_id");
  CREATE INDEX "servicios_procedimiento_order_idx" ON "servicios_procedimiento" USING btree ("_order");
  CREATE INDEX "servicios_procedimiento_parent_id_idx" ON "servicios_procedimiento" USING btree ("_parent_id");
  CREATE INDEX "servicios_canales_order_idx" ON "servicios_canales" USING btree ("order");
  CREATE INDEX "servicios_canales_parent_idx" ON "servicios_canales" USING btree ("parent_id");
  CREATE INDEX "_servicios_v_version_requisitos_order_idx" ON "_servicios_v_version_requisitos" USING btree ("_order");
  CREATE INDEX "_servicios_v_version_requisitos_parent_id_idx" ON "_servicios_v_version_requisitos" USING btree ("_parent_id");
  CREATE INDEX "_servicios_v_version_procedimiento_order_idx" ON "_servicios_v_version_procedimiento" USING btree ("_order");
  CREATE INDEX "_servicios_v_version_procedimiento_parent_id_idx" ON "_servicios_v_version_procedimiento" USING btree ("_parent_id");
  CREATE INDEX "_servicios_v_version_canales_order_idx" ON "_servicios_v_version_canales" USING btree ("order");
  CREATE INDEX "_servicios_v_version_canales_parent_idx" ON "_servicios_v_version_canales" USING btree ("parent_id");
  CREATE UNIQUE INDEX "casos_numero_idx" ON "casos" USING btree ("numero");
  CREATE INDEX "casos_servicio_idx" ON "casos" USING btree ("servicio_id");
  CREATE INDEX "casos_updated_at_idx" ON "casos" USING btree ("updated_at");
  CREATE INDEX "casos_created_at_idx" ON "casos" USING btree ("created_at");
  CREATE INDEX "encuestas_servicio_idx" ON "encuestas" USING btree ("servicio_id");
  CREATE INDEX "encuestas_updated_at_idx" ON "encuestas" USING btree ("updated_at");
  CREATE INDEX "encuestas_created_at_idx" ON "encuestas" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_casos_fk" FOREIGN KEY ("casos_id") REFERENCES "public"."casos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_encuestas_fk" FOREIGN KEY ("encuestas_id") REFERENCES "public"."encuestas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_casos_id_idx" ON "payload_locked_documents_rels" USING btree ("casos_id");
  CREATE INDEX "payload_locked_documents_rels_encuestas_id_idx" ON "payload_locked_documents_rels" USING btree ("encuestas_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "servicios_requisitos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_procedimiento" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_canales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_servicios_v_version_requisitos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_servicios_v_version_procedimiento" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_servicios_v_version_canales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "casos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "encuestas" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "servicios_requisitos" CASCADE;
  DROP TABLE "servicios_procedimiento" CASCADE;
  DROP TABLE "servicios_canales" CASCADE;
  DROP TABLE "_servicios_v_version_requisitos" CASCADE;
  DROP TABLE "_servicios_v_version_procedimiento" CASCADE;
  DROP TABLE "_servicios_v_version_canales" CASCADE;
  DROP TABLE "casos" CASCADE;
  DROP TABLE "encuestas" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_casos_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_encuestas_fk";
  
  DROP INDEX "payload_locked_documents_rels_casos_id_idx";
  DROP INDEX "payload_locked_documents_rels_encuestas_id_idx";
  ALTER TABLE "servicios" DROP COLUMN "nombre_coloquial";
  ALTER TABLE "servicios" DROP COLUMN "dirigido_a";
  ALTER TABLE "servicios" DROP COLUMN "area_responsable";
  ALTER TABLE "servicios" DROP COLUMN "contacto_area_telefono";
  ALTER TABLE "servicios" DROP COLUMN "contacto_area_extension";
  ALTER TABLE "servicios" DROP COLUMN "contacto_area_correo";
  ALTER TABLE "servicios" DROP COLUMN "horario";
  ALTER TABLE "servicios" DROP COLUMN "costo";
  ALTER TABLE "servicios" DROP COLUMN "tiempo_respuesta";
  ALTER TABLE "servicios" DROP COLUMN "tiempo_realizacion";
  ALTER TABLE "servicios" DROP COLUMN "acceso_solicitud_en_linea";
  ALTER TABLE "servicios" DROP COLUMN "acceso_url";
  ALTER TABLE "servicios" DROP COLUMN "informacion_adicional";
  ALTER TABLE "servicios" DROP COLUMN "lista_para_revision";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_nombre_coloquial";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_dirigido_a";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_area_responsable";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_contacto_area_telefono";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_contacto_area_extension";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_contacto_area_correo";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_horario";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_costo";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_tiempo_respuesta";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_tiempo_realizacion";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_acceso_solicitud_en_linea";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_acceso_url";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_informacion_adicional";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_lista_para_revision";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "casos_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "encuestas_id";
  DROP TYPE "public"."enum_servicios_canales";
  DROP TYPE "public"."enum__servicios_v_version_canales";
  DROP TYPE "public"."enum_casos_tipo";
  DROP TYPE "public"."enum_casos_estado";
  DROP TYPE "public"."enum_encuestas_facilidad";`)
}
