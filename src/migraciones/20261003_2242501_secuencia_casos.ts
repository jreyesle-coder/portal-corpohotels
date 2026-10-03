import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Numeración de casos sin repeticiones ni huecos por concurrencia: CPH-<año>-<consecutivo>.
 * La secuencia es atómica aunque lleguen varias solicitudes a la vez.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS casos_consecutivo_seq START 1;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP SEQUENCE IF EXISTS casos_consecutivo_seq;`)
}
