import { REGEXP_TGZ, REGEXP_TBR } from './function'
import { getNpmTar } from '@dr-js/core/module/node/module/Archive/npmTar.js'

const detect = (checkOnly) => { // TODO: DEPRECATED
  const isDetected = Boolean(getNpmTar())
  if (checkOnly) return isDetected
  if (!isDetected) throw new Error('expect "npm/node_modules/tar"')
}

export {
  REGEXP_NPM_TAR, getNpmTar, check, verify,
  createCompressStream, createExtractStream,
  compressAsync, extractAsync, // NOTE: will not auto create output path
  extractPackageJson
} from '@dr-js/core/module/node/module/Archive/npmTar.js'
export { // TODO: move related to `module/Archive/`
  REGEXP_TGZ, REGEXP_TBR, detect // TODO: DEPRECATED
}
