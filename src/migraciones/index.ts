import * as migration_20261003_211433_inicial from './20261003_211433_inicial';
import * as migration_20261003_211500_bitacora_solo_insercion from './20261003_211500_bitacora_solo_insercion';

export const migrations = [
  {
    up: migration_20261003_211433_inicial.up,
    down: migration_20261003_211433_inicial.down,
    name: '20261003_211433_inicial'
  },
  {
    up: migration_20261003_211500_bitacora_solo_insercion.up,
    down: migration_20261003_211500_bitacora_solo_insercion.down,
    name: '20261003_211500_bitacora_solo_insercion'
  },
];
