import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_noticias_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__noticias_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_paginas_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__paginas_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_menus_ubicacion" AS ENUM('principal', 'pie-informate');
  CREATE TYPE "public"."enum_documentos_area" AS ENUM('institucional', 'transparencia');
  CREATE TYPE "public"."enum_usuarios_roles" AS ENUM('editor', 'publicador', 'oai', 'administrador', 'auditor');
  CREATE TYPE "public"."enum_bitacora_evento" AS ENUM('inicio_sesion', 'inicio_sesion_rechazado', 'cierre_sesion', 'creacion', 'modificacion', 'publicacion', 'despublicacion', 'eliminacion', 'cambio_permisos');
  CREATE TABLE "noticias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"slug" varchar,
  	"fecha" timestamp(3) with time zone,
  	"lugar" varchar,
  	"imagen_id" integer,
  	"resumen" varchar,
  	"contenido" jsonb,
  	"fuente_nombre" varchar DEFAULT 'CORPHOTELS',
  	"fuente_url" varchar,
  	"lista_para_revision" boolean DEFAULT false,
  	"seo_titulo" varchar,
  	"seo_descripcion" varchar,
  	"seo_no_indexar" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_noticias_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "noticias_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categorias_id" integer,
  	"etiquetas_id" integer
  );
  
  CREATE TABLE "_noticias_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_titulo" varchar,
  	"version_slug" varchar,
  	"version_fecha" timestamp(3) with time zone,
  	"version_lugar" varchar,
  	"version_imagen_id" integer,
  	"version_resumen" varchar,
  	"version_contenido" jsonb,
  	"version_fuente_nombre" varchar DEFAULT 'CORPHOTELS',
  	"version_fuente_url" varchar,
  	"version_lista_para_revision" boolean DEFAULT false,
  	"version_seo_titulo" varchar,
  	"version_seo_descripcion" varchar,
  	"version_seo_no_indexar" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__noticias_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_noticias_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categorias_id" integer,
  	"etiquetas_id" integer
  );
  
  CREATE TABLE "paginas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"slug" varchar,
  	"padre_id" integer,
  	"contenido" jsonb,
  	"lista_para_revision" boolean DEFAULT false,
  	"seo_titulo" varchar,
  	"seo_descripcion" varchar,
  	"seo_no_indexar" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_paginas_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_paginas_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_titulo" varchar,
  	"version_slug" varchar,
  	"version_padre_id" integer,
  	"version_contenido" jsonb,
  	"version_lista_para_revision" boolean DEFAULT false,
  	"version_seo_titulo" varchar,
  	"version_seo_descripcion" varchar,
  	"version_seo_no_indexar" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__paginas_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "categorias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"descripcion" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "etiquetas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "menus_elementos_hijos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"etiqueta" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "menus_elementos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"etiqueta" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "menus" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"ubicacion" "enum_menus_ubicacion" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "medios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"credito" varchar,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_miniatura_url" varchar,
  	"sizes_miniatura_width" numeric,
  	"sizes_miniatura_height" numeric,
  	"sizes_miniatura_mime_type" varchar,
  	"sizes_miniatura_filesize" numeric,
  	"sizes_miniatura_filename" varchar,
  	"sizes_tarjeta_url" varchar,
  	"sizes_tarjeta_width" numeric,
  	"sizes_tarjeta_height" numeric,
  	"sizes_tarjeta_mime_type" varchar,
  	"sizes_tarjeta_filesize" numeric,
  	"sizes_tarjeta_filename" varchar,
  	"sizes_completa_url" varchar,
  	"sizes_completa_width" numeric,
  	"sizes_completa_height" numeric,
  	"sizes_completa_mime_type" varchar,
  	"sizes_completa_filesize" numeric,
  	"sizes_completa_filename" varchar
  );
  
  CREATE TABLE "documentos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"descripcion" varchar NOT NULL,
  	"fecha_creacion" timestamp(3) with time zone NOT NULL,
  	"area" "enum_documentos_area" DEFAULT 'institucional' NOT NULL,
  	"categoria_id" integer,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "usuarios_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_usuarios_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "usuarios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"activo" boolean DEFAULT true,
  	"entra_oid" varchar,
  	"ultimo_acceso" timestamp(3) with time zone,
  	"sesion_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bitacora" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"fecha" timestamp(3) with time zone NOT NULL,
  	"evento" "enum_bitacora_evento" NOT NULL,
  	"usuario_id" varchar,
  	"usuario_correo" varchar,
  	"coleccion" varchar,
  	"documento_id" varchar,
  	"titulo" varchar,
  	"ip" varchar,
  	"detalle" jsonb
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"noticias_id" integer,
  	"paginas_id" integer,
  	"categorias_id" integer,
  	"etiquetas_id" integer,
  	"menus_id" integer,
  	"medios_id" integer,
  	"documentos_id" integer,
  	"usuarios_id" integer,
  	"bitacora_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"usuarios_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "noticias" ADD CONSTRAINT "noticias_imagen_id_medios_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "noticias_rels" ADD CONSTRAINT "noticias_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."noticias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "noticias_rels" ADD CONSTRAINT "noticias_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "noticias_rels" ADD CONSTRAINT "noticias_rels_etiquetas_fk" FOREIGN KEY ("etiquetas_id") REFERENCES "public"."etiquetas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_noticias_v" ADD CONSTRAINT "_noticias_v_parent_id_noticias_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."noticias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_noticias_v" ADD CONSTRAINT "_noticias_v_version_imagen_id_medios_id_fk" FOREIGN KEY ("version_imagen_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_noticias_v_rels" ADD CONSTRAINT "_noticias_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_noticias_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_noticias_v_rels" ADD CONSTRAINT "_noticias_v_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_noticias_v_rels" ADD CONSTRAINT "_noticias_v_rels_etiquetas_fk" FOREIGN KEY ("etiquetas_id") REFERENCES "public"."etiquetas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas" ADD CONSTRAINT "paginas_padre_id_paginas_id_fk" FOREIGN KEY ("padre_id") REFERENCES "public"."paginas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_paginas_v" ADD CONSTRAINT "_paginas_v_parent_id_paginas_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."paginas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_paginas_v" ADD CONSTRAINT "_paginas_v_version_padre_id_paginas_id_fk" FOREIGN KEY ("version_padre_id") REFERENCES "public"."paginas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menus_elementos_hijos" ADD CONSTRAINT "menus_elementos_hijos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menus_elementos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menus_elementos" ADD CONSTRAINT "menus_elementos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documentos" ADD CONSTRAINT "documentos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_noticias_fk" FOREIGN KEY ("noticias_id") REFERENCES "public"."noticias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_paginas_fk" FOREIGN KEY ("paginas_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_etiquetas_fk" FOREIGN KEY ("etiquetas_id") REFERENCES "public"."etiquetas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menus_fk" FOREIGN KEY ("menus_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_medios_fk" FOREIGN KEY ("medios_id") REFERENCES "public"."medios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documentos_fk" FOREIGN KEY ("documentos_id") REFERENCES "public"."documentos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bitacora_fk" FOREIGN KEY ("bitacora_id") REFERENCES "public"."bitacora"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "noticias_slug_idx" ON "noticias" USING btree ("slug");
  CREATE INDEX "noticias_imagen_idx" ON "noticias" USING btree ("imagen_id");
  CREATE INDEX "noticias_updated_at_idx" ON "noticias" USING btree ("updated_at");
  CREATE INDEX "noticias_created_at_idx" ON "noticias" USING btree ("created_at");
  CREATE INDEX "noticias__status_idx" ON "noticias" USING btree ("_status");
  CREATE INDEX "noticias_rels_order_idx" ON "noticias_rels" USING btree ("order");
  CREATE INDEX "noticias_rels_parent_idx" ON "noticias_rels" USING btree ("parent_id");
  CREATE INDEX "noticias_rels_path_idx" ON "noticias_rels" USING btree ("path");
  CREATE INDEX "noticias_rels_categorias_id_idx" ON "noticias_rels" USING btree ("categorias_id");
  CREATE INDEX "noticias_rels_etiquetas_id_idx" ON "noticias_rels" USING btree ("etiquetas_id");
  CREATE INDEX "_noticias_v_parent_idx" ON "_noticias_v" USING btree ("parent_id");
  CREATE INDEX "_noticias_v_version_version_slug_idx" ON "_noticias_v" USING btree ("version_slug");
  CREATE INDEX "_noticias_v_version_version_imagen_idx" ON "_noticias_v" USING btree ("version_imagen_id");
  CREATE INDEX "_noticias_v_version_version_updated_at_idx" ON "_noticias_v" USING btree ("version_updated_at");
  CREATE INDEX "_noticias_v_version_version_created_at_idx" ON "_noticias_v" USING btree ("version_created_at");
  CREATE INDEX "_noticias_v_version_version__status_idx" ON "_noticias_v" USING btree ("version__status");
  CREATE INDEX "_noticias_v_created_at_idx" ON "_noticias_v" USING btree ("created_at");
  CREATE INDEX "_noticias_v_updated_at_idx" ON "_noticias_v" USING btree ("updated_at");
  CREATE INDEX "_noticias_v_latest_idx" ON "_noticias_v" USING btree ("latest");
  CREATE INDEX "_noticias_v_rels_order_idx" ON "_noticias_v_rels" USING btree ("order");
  CREATE INDEX "_noticias_v_rels_parent_idx" ON "_noticias_v_rels" USING btree ("parent_id");
  CREATE INDEX "_noticias_v_rels_path_idx" ON "_noticias_v_rels" USING btree ("path");
  CREATE INDEX "_noticias_v_rels_categorias_id_idx" ON "_noticias_v_rels" USING btree ("categorias_id");
  CREATE INDEX "_noticias_v_rels_etiquetas_id_idx" ON "_noticias_v_rels" USING btree ("etiquetas_id");
  CREATE UNIQUE INDEX "paginas_slug_idx" ON "paginas" USING btree ("slug");
  CREATE INDEX "paginas_padre_idx" ON "paginas" USING btree ("padre_id");
  CREATE INDEX "paginas_updated_at_idx" ON "paginas" USING btree ("updated_at");
  CREATE INDEX "paginas_created_at_idx" ON "paginas" USING btree ("created_at");
  CREATE INDEX "paginas__status_idx" ON "paginas" USING btree ("_status");
  CREATE INDEX "_paginas_v_parent_idx" ON "_paginas_v" USING btree ("parent_id");
  CREATE INDEX "_paginas_v_version_version_slug_idx" ON "_paginas_v" USING btree ("version_slug");
  CREATE INDEX "_paginas_v_version_version_padre_idx" ON "_paginas_v" USING btree ("version_padre_id");
  CREATE INDEX "_paginas_v_version_version_updated_at_idx" ON "_paginas_v" USING btree ("version_updated_at");
  CREATE INDEX "_paginas_v_version_version_created_at_idx" ON "_paginas_v" USING btree ("version_created_at");
  CREATE INDEX "_paginas_v_version_version__status_idx" ON "_paginas_v" USING btree ("version__status");
  CREATE INDEX "_paginas_v_created_at_idx" ON "_paginas_v" USING btree ("created_at");
  CREATE INDEX "_paginas_v_updated_at_idx" ON "_paginas_v" USING btree ("updated_at");
  CREATE INDEX "_paginas_v_latest_idx" ON "_paginas_v" USING btree ("latest");
  CREATE UNIQUE INDEX "categorias_nombre_idx" ON "categorias" USING btree ("nombre");
  CREATE UNIQUE INDEX "categorias_slug_idx" ON "categorias" USING btree ("slug");
  CREATE INDEX "categorias_updated_at_idx" ON "categorias" USING btree ("updated_at");
  CREATE INDEX "categorias_created_at_idx" ON "categorias" USING btree ("created_at");
  CREATE UNIQUE INDEX "etiquetas_nombre_idx" ON "etiquetas" USING btree ("nombre");
  CREATE UNIQUE INDEX "etiquetas_slug_idx" ON "etiquetas" USING btree ("slug");
  CREATE INDEX "etiquetas_updated_at_idx" ON "etiquetas" USING btree ("updated_at");
  CREATE INDEX "etiquetas_created_at_idx" ON "etiquetas" USING btree ("created_at");
  CREATE INDEX "menus_elementos_hijos_order_idx" ON "menus_elementos_hijos" USING btree ("_order");
  CREATE INDEX "menus_elementos_hijos_parent_id_idx" ON "menus_elementos_hijos" USING btree ("_parent_id");
  CREATE INDEX "menus_elementos_order_idx" ON "menus_elementos" USING btree ("_order");
  CREATE INDEX "menus_elementos_parent_id_idx" ON "menus_elementos" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "menus_ubicacion_idx" ON "menus" USING btree ("ubicacion");
  CREATE INDEX "menus_updated_at_idx" ON "menus" USING btree ("updated_at");
  CREATE INDEX "menus_created_at_idx" ON "menus" USING btree ("created_at");
  CREATE INDEX "medios_updated_at_idx" ON "medios" USING btree ("updated_at");
  CREATE INDEX "medios_created_at_idx" ON "medios" USING btree ("created_at");
  CREATE UNIQUE INDEX "medios_filename_idx" ON "medios" USING btree ("filename");
  CREATE INDEX "medios_sizes_miniatura_sizes_miniatura_filename_idx" ON "medios" USING btree ("sizes_miniatura_filename");
  CREATE INDEX "medios_sizes_tarjeta_sizes_tarjeta_filename_idx" ON "medios" USING btree ("sizes_tarjeta_filename");
  CREATE INDEX "medios_sizes_completa_sizes_completa_filename_idx" ON "medios" USING btree ("sizes_completa_filename");
  CREATE INDEX "documentos_categoria_idx" ON "documentos" USING btree ("categoria_id");
  CREATE INDEX "documentos_updated_at_idx" ON "documentos" USING btree ("updated_at");
  CREATE INDEX "documentos_created_at_idx" ON "documentos" USING btree ("created_at");
  CREATE UNIQUE INDEX "documentos_filename_idx" ON "documentos" USING btree ("filename");
  CREATE INDEX "usuarios_roles_order_idx" ON "usuarios_roles" USING btree ("order");
  CREATE INDEX "usuarios_roles_parent_idx" ON "usuarios_roles" USING btree ("parent_id");
  CREATE UNIQUE INDEX "usuarios_email_idx" ON "usuarios" USING btree ("email");
  CREATE UNIQUE INDEX "usuarios_entra_oid_idx" ON "usuarios" USING btree ("entra_oid");
  CREATE INDEX "usuarios_updated_at_idx" ON "usuarios" USING btree ("updated_at");
  CREATE INDEX "usuarios_created_at_idx" ON "usuarios" USING btree ("created_at");
  CREATE INDEX "bitacora_fecha_idx" ON "bitacora" USING btree ("fecha");
  CREATE INDEX "bitacora_evento_idx" ON "bitacora" USING btree ("evento");
  CREATE INDEX "bitacora_usuario_correo_idx" ON "bitacora" USING btree ("usuario_correo");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_noticias_id_idx" ON "payload_locked_documents_rels" USING btree ("noticias_id");
  CREATE INDEX "payload_locked_documents_rels_paginas_id_idx" ON "payload_locked_documents_rels" USING btree ("paginas_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_id");
  CREATE INDEX "payload_locked_documents_rels_etiquetas_id_idx" ON "payload_locked_documents_rels" USING btree ("etiquetas_id");
  CREATE INDEX "payload_locked_documents_rels_menus_id_idx" ON "payload_locked_documents_rels" USING btree ("menus_id");
  CREATE INDEX "payload_locked_documents_rels_medios_id_idx" ON "payload_locked_documents_rels" USING btree ("medios_id");
  CREATE INDEX "payload_locked_documents_rels_documentos_id_idx" ON "payload_locked_documents_rels" USING btree ("documentos_id");
  CREATE INDEX "payload_locked_documents_rels_usuarios_id_idx" ON "payload_locked_documents_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_locked_documents_rels_bitacora_id_idx" ON "payload_locked_documents_rels" USING btree ("bitacora_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_usuarios_id_idx" ON "payload_preferences_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "noticias" CASCADE;
  DROP TABLE "noticias_rels" CASCADE;
  DROP TABLE "_noticias_v" CASCADE;
  DROP TABLE "_noticias_v_rels" CASCADE;
  DROP TABLE "paginas" CASCADE;
  DROP TABLE "_paginas_v" CASCADE;
  DROP TABLE "categorias" CASCADE;
  DROP TABLE "etiquetas" CASCADE;
  DROP TABLE "menus_elementos_hijos" CASCADE;
  DROP TABLE "menus_elementos" CASCADE;
  DROP TABLE "menus" CASCADE;
  DROP TABLE "medios" CASCADE;
  DROP TABLE "documentos" CASCADE;
  DROP TABLE "usuarios_roles" CASCADE;
  DROP TABLE "usuarios" CASCADE;
  DROP TABLE "bitacora" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_noticias_status";
  DROP TYPE "public"."enum__noticias_v_version_status";
  DROP TYPE "public"."enum_paginas_status";
  DROP TYPE "public"."enum__paginas_v_version_status";
  DROP TYPE "public"."enum_menus_ubicacion";
  DROP TYPE "public"."enum_documentos_area";
  DROP TYPE "public"."enum_usuarios_roles";
  DROP TYPE "public"."enum_bitacora_evento";`)
}
