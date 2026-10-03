import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "institucion" ADD COLUMN "atencion_tiempo_contacto" varchar DEFAULT '5 días laborables' NOT NULL;
  ALTER TABLE "institucion" ADD COLUMN "atencion_tiempo_sugerencias" varchar DEFAULT '15 días laborables' NOT NULL;
  ALTER TABLE "institucion" ADD COLUMN "atencion_otras_vias" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "institucion" DROP COLUMN "atencion_tiempo_contacto";
  ALTER TABLE "institucion" DROP COLUMN "atencion_tiempo_sugerencias";
  ALTER TABLE "institucion" DROP COLUMN "atencion_otras_vias";`)
}
