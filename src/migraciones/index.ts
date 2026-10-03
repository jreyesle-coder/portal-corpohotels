import * as migration_20261003_211433_inicial from './20261003_211433_inicial';
import * as migration_20261003_211500_bitacora_solo_insercion from './20261003_211500_bitacora_solo_insercion';
import * as migration_20261003_213953_s2_portal_institucional from './20261003_213953_s2_portal_institucional';

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
    name: '20261003_213953_s2_portal_institucional'
  },
];
