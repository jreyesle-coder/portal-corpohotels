import * as migration_20261003_211433_inicial from './20261003_211433_inicial';
import * as migration_20261003_211500_bitacora_solo_insercion from './20261003_211500_bitacora_solo_insercion';
import * as migration_20261003_213953_s2_portal_institucional from './20261003_213953_s2_portal_institucional';
import * as migration_20261003_2242501_secuencia_casos from './20261003_2242501_secuencia_casos';
import * as migration_20261003_224250_s3_servicios_formularios from './20261003_224250_s3_servicios_formularios';
import * as migration_20261003_224353_s3_atencion from './20261003_224353_s3_atencion';
import * as migration_20261003_231816_servicios_ficha_parcial from './20261003_231816_servicios_ficha_parcial';
import * as migration_20261003_233744_s4_transparencia from './20261003_233744_s4_transparencia';

export const migrations = [
  {
    up: migration_20261003_211433_inicial.up,
    down: migration_20261003_211433_inicial.down,
    name: '20261003_211433_inicial',
  },
  {
    up: migration_20261003_211500_bitacora_solo_insercion.up,
    down: migration_20261003_211500_bitacora_solo_insercion.down,
    name: '20261003_211500_bitacora_solo_insercion',
  },
  {
    up: migration_20261003_213953_s2_portal_institucional.up,
    down: migration_20261003_213953_s2_portal_institucional.down,
    name: '20261003_213953_s2_portal_institucional',
  },
  {
    up: migration_20261003_2242501_secuencia_casos.up,
    down: migration_20261003_2242501_secuencia_casos.down,
    name: '20261003_2242501_secuencia_casos',
  },
  {
    up: migration_20261003_224250_s3_servicios_formularios.up,
    down: migration_20261003_224250_s3_servicios_formularios.down,
    name: '20261003_224250_s3_servicios_formularios',
  },
  {
    up: migration_20261003_224353_s3_atencion.up,
    down: migration_20261003_224353_s3_atencion.down,
    name: '20261003_224353_s3_atencion',
  },
  {
    up: migration_20261003_231816_servicios_ficha_parcial.up,
    down: migration_20261003_231816_servicios_ficha_parcial.down,
    name: '20261003_231816_servicios_ficha_parcial',
  },
  {
    up: migration_20261003_233744_s4_transparencia.up,
    down: migration_20261003_233744_s4_transparencia.down,
    name: '20261003_233744_s4_transparencia'
  },
];
