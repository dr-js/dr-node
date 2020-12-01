import { tmpdir } from 'os'
import { resolve } from 'path'
import { setupSIGUSR2 } from 'source/module/RuntimeDump'

const setupPackageSIGUSR2 = (packageName, packageVersion) => setupSIGUSR2(resolve(tmpdir(), packageName, packageVersion))

export { setupPackageSIGUSR2 }
