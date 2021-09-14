import {
  detect as detect7z // TODO: DEPRECATE
} from './7z'
import {
  detect as detectNpmTar // TODO: DEPRECATE
} from './npmTar'
import { REGEXP_TGZ, REGEXP_TBR, REGEXP_T7Z, REGEXP_TXZ } from './function'

const detect = (checkOnly) => detect7z(checkOnly) && detectNpmTar(checkOnly) // TODO: DEPRECATED

export {
  REGEXP_AUTO, check, verify,
  compress7zAsync, extract7zAsync,
  compressT7zAsync, extractT7zAsync,
  compressAutoAsync, extractAutoAsync,
  repackAsync, repackTarAsync
} from '@dr-js/core/module/node/module/Archive/archive.js'
export { // TODO: move related to `module/Archive/`
  REGEXP_TGZ, REGEXP_TBR, REGEXP_T7Z, REGEXP_TXZ, detect // TODO: DEPRECATED
}
