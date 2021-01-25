import { spawn } from 'child_process'
import { promises as fsAsync } from 'fs'
import { getProcessListAsync, toProcessPidMap, findProcessPidMapInfo, isPidExist } from '@dr-js/core/module/node/system/Process'

const runDetached = async ({ command, argList, option, logFile }) => { // TODO: DEPRECATE: use `runDetached` from `@dr-js/core`
  const logFh = await fsAsync.open(logFile, 'a')
  const subProcess = spawn(command, argList, {
    stdio: [ 'ignore', logFh.fd, logFh.fd ], // TODO: NOTE: should test for https://github.com/joyent/libuv/issues/923
    detached: true, // to allow server restart and find the process again
    ...option
  })
  subProcess.on('error', (error) => { __DEV__ && console.warn('[ERROR][runDetached] config:', { command, argList, option, logFile }, 'error:', error) })
  subProcess.unref()
  await logFh.close()
  return { subProcess }
}

const findDetachedProcessAsync = async (processInfo, processList) => { // TODO: DEPRECATE
  if (!processInfo || !isPidExist(processInfo.pid)) return
  if (processList === undefined) processList = await getProcessListAsync()
  return findProcessPidMapInfo(processInfo, toProcessPidMap(processList))
}

export {
  runDetached, // TODO: DEPRECATE: use `runDetached` from `@dr-js/core`
  findDetachedProcessAsync // TODO: DEPRECATE
}
