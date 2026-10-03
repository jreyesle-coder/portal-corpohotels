import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "servicios" ADD COLUMN "ficha_completa" boolean DEFAULT false;
  ALTER TABLE "servicios" ADD COLUMN "campos_pendientes" varchar;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_ficha_completa" boolean DEFAULT false;
  ALTER TABLE "_servicios_v" ADD COLUMN "version_campos_pendientes" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "servicios" DROP COLUMN "ficha_completa";
  ALTER TABLE "servicios" DROP COLUMN "campos_pendientes";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_ficha_completa";
  ALTER TABLE "_servicios_v" DROP COLUMN "version_campos_pendientes";`)
}
