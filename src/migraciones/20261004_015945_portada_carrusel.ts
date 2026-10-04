import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_diapositivas_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__diapositivas_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "diapositivas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"noticia_id" integer,
  	"titulo" varchar,
  	"imagen_id" integer,
  	"enlace" varchar,
  	"texto_boton" varchar DEFAULT 'Leer más',
  	"desde" timestamp(3) with time zone,
  	"hasta" timestamp(3) with time zone,
  	"orden" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_diapositivas_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_diapositivas_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_noticia_id" integer,
  	"version_titulo" varchar,
  	"version_imagen_id" integer,
  	"version_enlace" varchar,
  	"version_texto_boton" varchar DEFAULT 'Leer más',
  	"version_desde" timestamp(3) with time zone,
  	"version_hasta" timestamp(3) with time zone,
  	"version_orden" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__diapositivas_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "portada" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"avance_automatico" boolean DEFAULT true,
  	"segundos" numeric DEFAULT 7,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "diapositivas_id" integer;
  ALTER TABLE "diapositivas" ADD CONSTRAINT "diapositivas_noticia_id_noticias_id_fk" FOREIGN KEY ("noticia_id") REFERENCES "public"."noticias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "diapositivas" ADD CONSTRAINT "diapositivas_imagen_id_medios_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_diapositivas_v" ADD CONSTRAINT "_diapositivas_v_parent_id_diapositivas_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."diapositivas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_diapositivas_v" ADD CONSTRAINT "_diapositivas_v_version_noticia_id_noticias_id_fk" FOREIGN KEY ("version_noticia_id") REFERENCES "public"."noticias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_diapositivas_v" ADD CONSTRAINT "_diapositivas_v_version_imagen_id_medios_id_fk" FOREIGN KEY ("version_imagen_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "diapositivas_noticia_idx" ON "diapositivas" USING btree ("noticia_id");
  CREATE INDEX "diapositivas_imagen_idx" ON "diapositivas" USING btree ("imagen_id");
  CREATE INDEX "diapositivas_updated_at_idx" ON "diapositivas" USING btree ("updated_at");
  CREATE INDEX "diapositivas_created_at_idx" ON "diapositivas" USING btree ("created_at");
  CREATE INDEX "diapositivas__status_idx" ON "diapositivas" USING btree ("_status");
  CREATE INDEX "_diapositivas_v_parent_idx" ON "_diapositivas_v" USING btree ("parent_id");
  CREATE INDEX "_diapositivas_v_version_version_noticia_idx" ON "_diapositivas_v" USING btree ("version_noticia_id");
  CREATE INDEX "_diapositivas_v_version_version_imagen_idx" ON "_diapositivas_v" USING btree ("version_imagen_id");
  CREATE INDEX "_diapositivas_v_version_version_updated_at_idx" ON "_diapositivas_v" USING btree ("version_updated_at");
  CREATE INDEX "_diapositivas_v_version_version_created_at_idx" ON "_diapositivas_v" USING btree ("version_created_at");
  CREATE INDEX "_diapositivas_v_version_version__status_idx" ON "_diapositivas_v" USING btree ("version__status");
  CREATE INDEX "_diapositivas_v_created_at_idx" ON "_diapositivas_v" USING btree ("created_at");
  CREATE INDEX "_diapositivas_v_updated_at_idx" ON "_diapositivas_v" USING btree ("updated_at");
  CREATE INDEX "_diapositivas_v_latest_idx" ON "_diapositivas_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_diapositivas_fk" FOREIGN KEY ("diapositivas_id") REFERENCES "public"."diapositivas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_diapositivas_id_idx" ON "payload_locked_documents_rels" USING btree ("diapositivas_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "diapositivas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_diapositivas_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "portada" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "diapositivas" CASCADE;
  DROP TABLE "_diapositivas_v" CASCADE;
  DROP TABLE "portada" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_diapositivas_fk";
  
  DROP INDEX "payload_locked_documents_rels_diapositivas_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "diapositivas_id";
  DROP TYPE "public"."enum_diapositivas_status";
  DROP TYPE "public"."enum__diapositivas_v_version_status";`)
}
