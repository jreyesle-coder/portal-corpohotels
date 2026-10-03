import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Bitácora append-only en la propia base de datos (A8 3.01.5.d, 3.04.3): PostgreSQL rechaza
 * cualquier UPDATE, DELETE o TRUNCATE sobre la tabla, venga de la aplicación o de una consola.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE OR REPLACE FUNCTION bitacora_solo_insercion() RETURNS trigger
    LANGUAGE plpgsql AS $$
    BEGIN
      RAISE EXCEPTION 'La bitácora es de solo inserción: no se permite % sobre %', TG_OP, TG_TABLE_NAME
        USING ERRCODE = 'insufficient_privilege';
    END;
  $$;

  CREATE TRIGGER bitacora_sin_cambios
    BEFORE UPDATE OR DELETE ON "bitacora"
    FOR EACH ROW EXECUTE FUNCTION bitacora_solo_insercion();

  CREATE TRIGGER bitacora_sin_vaciado
    BEFORE TRUNCATE ON "bitacora"
    FOR EACH STATEMENT EXECUTE FUNCTION bitacora_solo_insercion();`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TRIGGER IF EXISTS bitacora_sin_vaciado ON "bitacora";
  DROP TRIGGER IF EXISTS bitacora_sin_cambios ON "bitacora";
  DROP FUNCTION IF EXISTS bitacora_solo_insercion();`)
}
