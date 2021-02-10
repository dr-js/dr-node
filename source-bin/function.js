import { tmpdir } from 'os'
import { resolve } from 'path'
import { modulePathHack } from '@dr-js/core/bin/function'
import { setupSIGUSR2 } from 'source/module/RuntimeDump'

// HACK: add `@dr-js/node` to internal `modulePaths` to allow require
//   `.../npm/node_modules/@dr-js/*/bin/function.js` + `../../../../` = `.../npm/node_modules/` // allow this and related module to resolve
//   `.../.npm/_npx/####/lib/node_modules/@dr-js/*/bin/function.js` + `../../../../` = `.../.npm/_npx/####/lib/node_modules/` // allow this and related module to resolve
const patchModulePath = () => modulePathHack(resolve(module.filename, '../../../../'))

const setupPackageSIGUSR2 = (packageName, packageVersion) => setupSIGUSR2(resolve(tmpdir(), packageName, packageVersion))

export {
  patchModulePath,
  setupPackageSIGUSR2
}
