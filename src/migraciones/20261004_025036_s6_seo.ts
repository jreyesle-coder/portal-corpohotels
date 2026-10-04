import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "noticias" ADD COLUMN "seo_no_seguir" boolean DEFAULT false;
  ALTER TABLE "_noticias_v" ADD COLUMN "version_seo_no_seguir" boolean DEFAULT false;
  ALTER TABLE "paginas" ADD COLUMN "seo_no_seguir" boolean DEFAULT false;
  ALTER TABLE "_paginas_v" ADD COLUMN "version_seo_no_seguir" boolean DEFAULT false;
  ALTER TABLE "servicios" ADD COLUMN "seo_no_seguir" boolean DEFAULT false;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_seo_no_seguir" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "noticias" DROP COLUMN "seo_no_seguir";
  ALTER TABLE "_noticias_v" DROP COLUMN "version_seo_no_seguir";
  ALTER TABLE "paginas" DROP COLUMN "seo_no_seguir";
  ALTER TABLE "_paginas_v" DROP COLUMN "version_seo_no_seguir";
  ALTER TABLE "servicios" DROP COLUMN "seo_no_seguir";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_seo_no_seguir";`)
}
