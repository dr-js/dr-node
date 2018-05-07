import { unlinkSync } from 'fs'
import { dirname } from 'path'
import { catchSync } from 'dr-js/module/common/error'
import { writeFileAsync } from 'dr-js/module/node/file/function'
import { createDirectory } from 'dr-js/module/node/file/File'
import { addExitListenerSync } from 'dr-js/module/node/system/ExitListener'

const configureFilePid = async ({ filePid }) => {
  if (!filePid) return

  __DEV__ && console.log('create pid file', filePid)
  await createDirectory(dirname(filePid))
  await writeFileAsync(filePid, `${process.pid}`)

  addExitListenerSync((exitState) => {
    __DEV__ && console.log('delete pid file', filePid, exitState)
    catchSync(unlinkSync, filePid)
  })
}

export { configureFilePid }
