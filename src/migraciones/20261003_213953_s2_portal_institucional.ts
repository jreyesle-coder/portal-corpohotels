import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_servicios_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__servicios_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_banners_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__banners_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_preguntas_frecuentes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__preguntas_frecuentes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_documentos_seccion" AS ENUM('general', 'marco-legal', 'organigrama');
  CREATE TYPE "public"."enum_documentos_tipo_norma" AS ENUM('constitucion', 'ley', 'decreto', 'resolucion', 'reglamento', 'normativa', 'otra');
  CREATE TYPE "public"."enum_institucion_redes_red" AS ENUM('facebook', 'instagram', 'x', 'youtube');
  CREATE TABLE "paginas_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documentos_id" integer
  );
  
  CREATE TABLE "_paginas_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documentos_id" integer
  );
  
  CREATE TABLE "servicios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"slug" varchar,
  	"resumen" varchar,
  	"contenido" jsonb,
  	"destacado" boolean DEFAULT false,
  	"seo_titulo" varchar,
  	"seo_descripcion" varchar,
  	"seo_no_indexar" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_servicios_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_servicios_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nombre" varchar,
  	"version_slug" varchar,
  	"version_resumen" varchar,
  	"version_contenido" jsonb,
  	"version_destacado" boolean DEFAULT false,
  	"version_seo_titulo" varchar,
  	"version_seo_descripcion" varchar,
  	"version_seo_no_indexar" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__servicios_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "banners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"descripcion" varchar,
  	"imagen_id" integer,
  	"enlace" varchar,
  	"texto_enlace" varchar DEFAULT 'Conocer más',
  	"orden" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_banners_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_banners_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_titulo" varchar,
  	"version_descripcion" varchar,
  	"version_imagen_id" integer,
  	"version_enlace" varchar,
  	"version_texto_enlace" varchar DEFAULT 'Conocer más',
  	"version_orden" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__banners_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "preguntas_frecuentes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"pregunta" varchar,
  	"respuesta" jsonb,
  	"orden" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_preguntas_frecuentes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_preguntas_frecuentes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_pregunta" varchar,
  	"version_respuesta" jsonb,
  	"version_orden" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__preguntas_frecuentes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "institucion_redes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"red" "enum_institucion_redes_red" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "institucion" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"siglas" varchar NOT NULL,
  	"telefono" varchar NOT NULL,
  	"fax" varchar,
  	"correo" varchar NOT NULL,
  	"direccion" varchar NOT NULL,
  	"apartado_postal" varchar,
  	"horario" varchar,
  	"mapa_latitud" numeric NOT NULL,
  	"mapa_longitud" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "paginas" ADD COLUMN "imagen_id" integer;
  ALTER TABLE "_paginas_v" ADD COLUMN "version_imagen_id" integer;
  ALTER TABLE "documentos" ADD COLUMN "seccion" "enum_documentos_seccion" DEFAULT 'general' NOT NULL;
  ALTER TABLE "documentos" ADD COLUMN "tipo_norma" "enum_documentos_tipo_norma";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "servicios_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "banners_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "preguntas_frecuentes_id" integer;
  ALTER TABLE "paginas_rels" ADD CONSTRAINT "paginas_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_rels" ADD CONSTRAINT "paginas_rels_documentos_fk" FOREIGN KEY ("documentos_id") REFERENCES "public"."documentos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_rels" ADD CONSTRAINT "_paginas_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_paginas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_rels" ADD CONSTRAINT "_paginas_v_rels_documentos_fk" FOREIGN KEY ("documentos_id") REFERENCES "public"."documentos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_servicios_v" ADD CONSTRAINT "_servicios_v_parent_id_servicios_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."servicios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "banners" ADD CONSTRAINT "banners_imagen_id_medios_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_banners_v" ADD CONSTRAINT "_banners_v_parent_id_banners_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."banners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_banners_v" ADD CONSTRAINT "_banners_v_version_imagen_id_medios_id_fk" FOREIGN KEY ("version_imagen_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_preguntas_frecuentes_v" ADD CONSTRAINT "_preguntas_frecuentes_v_parent_id_preguntas_frecuentes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."preguntas_frecuentes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "institucion_redes" ADD CONSTRAINT "institucion_redes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."institucion"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "paginas_rels_order_idx" ON "paginas_rels" USING btree ("order");
  CREATE INDEX "paginas_rels_parent_idx" ON "paginas_rels" USING btree ("parent_id");
  CREATE INDEX "paginas_rels_path_idx" ON "paginas_rels" USING btree ("path");
  CREATE INDEX "paginas_rels_documentos_id_idx" ON "paginas_rels" USING btree ("documentos_id");
  CREATE INDEX "_paginas_v_rels_order_idx" ON "_paginas_v_rels" USING btree ("order");
  CREATE INDEX "_paginas_v_rels_parent_idx" ON "_paginas_v_rels" USING btree ("parent_id");
  CREATE INDEX "_paginas_v_rels_path_idx" ON "_paginas_v_rels" USING btree ("path");
  CREATE INDEX "_paginas_v_rels_documentos_id_idx" ON "_paginas_v_rels" USING btree ("documentos_id");
  CREATE UNIQUE INDEX "servicios_slug_idx" ON "servicios" USING btree ("slug");
  CREATE INDEX "servicios_updated_at_idx" ON "servicios" USING btree ("updated_at");
  CREATE INDEX "servicios_created_at_idx" ON "servicios" USING btree ("created_at");
  CREATE INDEX "servicios__status_idx" ON "servicios" USING btree ("_status");
  CREATE INDEX "_servicios_v_parent_idx" ON "_servicios_v" USING btree ("parent_id");
  CREATE INDEX "_servicios_v_version_version_slug_idx" ON "_servicios_v" USING btree ("version_slug");
  CREATE INDEX "_servicios_v_version_version_updated_at_idx" ON "_servicios_v" USING btree ("version_updated_at");
  CREATE INDEX "_servicios_v_version_version_created_at_idx" ON "_servicios_v" USING btree ("version_created_at");
  CREATE INDEX "_servicios_v_version_version__status_idx" ON "_servicios_v" USING btree ("version__status");
  CREATE INDEX "_servicios_v_created_at_idx" ON "_servicios_v" USING btree ("created_at");
  CREATE INDEX "_servicios_v_updated_at_idx" ON "_servicios_v" USING btree ("updated_at");
  CREATE INDEX "_servicios_v_latest_idx" ON "_servicios_v" USING btree ("latest");
  CREATE INDEX "banners_imagen_idx" ON "banners" USING btree ("imagen_id");
  CREATE INDEX "banners_updated_at_idx" ON "banners" USING btree ("updated_at");
  CREATE INDEX "banners_created_at_idx" ON "banners" USING btree ("created_at");
  CREATE INDEX "banners__status_idx" ON "banners" USING btree ("_status");
  CREATE INDEX "_banners_v_parent_idx" ON "_banners_v" USING btree ("parent_id");
  CREATE INDEX "_banners_v_version_version_imagen_idx" ON "_banners_v" USING btree ("version_imagen_id");
  CREATE INDEX "_banners_v_version_version_updated_at_idx" ON "_banners_v" USING btree ("version_updated_at");
  CREATE INDEX "_banners_v_version_version_created_at_idx" ON "_banners_v" USING btree ("version_created_at");
  CREATE INDEX "_banners_v_version_version__status_idx" ON "_banners_v" USING btree ("version__status");
  CREATE INDEX "_banners_v_created_at_idx" ON "_banners_v" USING btree ("created_at");
  CREATE INDEX "_banners_v_updated_at_idx" ON "_banners_v" USING btree ("updated_at");
  CREATE INDEX "_banners_v_latest_idx" ON "_banners_v" USING btree ("latest");
  CREATE INDEX "preguntas_frecuentes_updated_at_idx" ON "preguntas_frecuentes" USING btree ("updated_at");
  CREATE INDEX "preguntas_frecuentes_created_at_idx" ON "preguntas_frecuentes" USING btree ("created_at");
  CREATE INDEX "preguntas_frecuentes__status_idx" ON "preguntas_frecuentes" USING btree ("_status");
  CREATE INDEX "_preguntas_frecuentes_v_parent_idx" ON "_preguntas_frecuentes_v" USING btree ("parent_id");
  CREATE INDEX "_preguntas_frecuentes_v_version_version_updated_at_idx" ON "_preguntas_frecuentes_v" USING btree ("version_updated_at");
  CREATE INDEX "_preguntas_frecuentes_v_version_version_created_at_idx" ON "_preguntas_frecuentes_v" USING btree ("version_created_at");
  CREATE INDEX "_preguntas_frecuentes_v_version_version__status_idx" ON "_preguntas_frecuentes_v" USING btree ("version__status");
  CREATE INDEX "_preguntas_frecuentes_v_created_at_idx" ON "_preguntas_frecuentes_v" USING btree ("created_at");
  CREATE INDEX "_preguntas_frecuentes_v_updated_at_idx" ON "_preguntas_frecuentes_v" USING btree ("updated_at");
  CREATE INDEX "_preguntas_frecuentes_v_latest_idx" ON "_preguntas_frecuentes_v" USING btree ("latest");
  CREATE INDEX "institucion_redes_order_idx" ON "institucion_redes" USING btree ("_order");
  CREATE INDEX "institucion_redes_parent_id_idx" ON "institucion_redes" USING btree ("_parent_id");
  ALTER TABLE "paginas" ADD CONSTRAINT "paginas_imagen_id_medios_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_paginas_v" ADD CONSTRAINT "_paginas_v_version_imagen_id_medios_id_fk" FOREIGN KEY ("version_imagen_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_servicios_fk" FOREIGN KEY ("servicios_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_banners_fk" FOREIGN KEY ("banners_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_preguntas_frecuentes_fk" FOREIGN KEY ("preguntas_frecuentes_id") REFERENCES "public"."preguntas_frecuentes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "paginas_imagen_idx" ON "paginas" USING btree ("imagen_id");
  CREATE INDEX "_paginas_v_version_version_imagen_idx" ON "_paginas_v" USING btree ("version_imagen_id");
  CREATE INDEX "payload_locked_documents_rels_servicios_id_idx" ON "payload_locked_documents_rels" USING btree ("servicios_id");
  CREATE INDEX "payload_locked_documents_rels_banners_id_idx" ON "payload_locked_documents_rels" USING btree ("banners_id");
  CREATE INDEX "payload_locked_documents_rels_preguntas_frecuentes_id_idx" ON "payload_locked_documents_rels" USING btree ("preguntas_frecuentes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "paginas_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_paginas_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_servicios_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "banners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_banners_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "preguntas_frecuentes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_preguntas_frecuentes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "institucion_redes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "institucion" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "paginas_rels" CASCADE;
  DROP TABLE "_paginas_v_rels" CASCADE;
  DROP TABLE "servicios" CASCADE;
  DROP TABLE "_servicios_v" CASCADE;
  DROP TABLE "banners" CASCADE;
  DROP TABLE "_banners_v" CASCADE;
  DROP TABLE "preguntas_frecuentes" CASCADE;
  DROP TABLE "_preguntas_frecuentes_v" CASCADE;
  DROP TABLE "institucion_redes" CASCADE;
  DROP TABLE "institucion" CASCADE;
  ALTER TABLE "paginas" DROP CONSTRAINT "paginas_imagen_id_medios_id_fk";
  
  ALTER TABLE "_paginas_v" DROP CONSTRAINT "_paginas_v_version_imagen_id_medios_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_servicios_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_banners_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_preguntas_frecuentes_fk";
  
  DROP INDEX "paginas_imagen_idx";
  DROP INDEX "_paginas_v_version_version_imagen_idx";
  DROP INDEX "payload_locked_documents_rels_servicios_id_idx";
  DROP INDEX "payload_locked_documents_rels_banners_id_idx";
  DROP INDEX "payload_locked_documents_rels_preguntas_frecuentes_id_idx";
  ALTER TABLE "paginas" DROP COLUMN "imagen_id";
  ALTER TABLE "_paginas_v" DROP COLUMN "version_imagen_id";
  ALTER TABLE "documentos" DROP COLUMN "seccion";
  ALTER TABLE "documentos" DROP COLUMN "tipo_norma";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "servicios_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "banners_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "preguntas_frecuentes_id";
  DROP TYPE "public"."enum_servicios_status";
  DROP TYPE "public"."enum__servicios_v_version_status";
  DROP TYPE "public"."enum_banners_status";
  DROP TYPE "public"."enum__banners_v_version_status";
  DROP TYPE "public"."enum_preguntas_frecuentes_status";
  DROP TYPE "public"."enum__preguntas_frecuentes_v_version_status";
  DROP TYPE "public"."enum_documentos_seccion";
  DROP TYPE "public"."enum_documentos_tipo_norma";
  DROP TYPE "public"."enum_institucion_redes_red";`)
}
