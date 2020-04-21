import { spawn } from 'child_process'
import { openAsync, closeAsync } from '@dr-js/core/module/node/file/function'
import { getProcessListAsync, toProcessPidMap, findProcessPidMapInfo, isPidExist } from '@dr-js/core/module/node/system/Process'

const runDetached = async ({ command, argList, option, logFile }) => {
  const logFd = await openAsync(logFile, 'a')
  const subProcess = spawn(command, argList, {
    stdio: [ 'ignore', logFd, logFd ], // TODO: NOTE: should test for https://github.com/joyent/libuv/issues/923
    detached: true, // to allow server restart and find the process again
    ...option
  })
  subProcess.on('error', (error) => { __DEV__ && console.warn('[ERROR][runDetached] config:', { command, argList, option, logFile }, 'error:', error) })
  subProcess.unref()
  await closeAsync(logFd)
  return { subProcess }
}

const findDetachedProcessAsync = async (processInfo, processList) => {
  if (!processInfo || !isPidExist(processInfo.pid)) return
  if (processList === undefined) processList = await getProcessListAsync()
  return findProcessPidMapInfo(processInfo, toProcessPidMap(processList))
}

export {
  runDetached,
  findDetachedProcessAsync
}