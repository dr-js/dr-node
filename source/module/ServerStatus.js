import { binary } from '@dr-js/core/module/common/format'
import { run } from '@dr-js/core/module/node/system/Run'
import { describeSystemStatus } from '@dr-js/core/module/node/system/Status'

// TODO: allow user change || overwrite commands

const COMMON_SERVER_STATUS_COMMAND_LIST = [
  // [ title, ...tryList ]
  [ 'Path', 'du -hd1' ],
  [ 'Disk', 'df -h .', async (rootPath) => { // win32 alternative, sample stdout: `27 Dir(s)  147,794,321,408 bytes free`
    const freeByteString = (await runQuick('dir | find "bytes free"', rootPath))
      .match(/([\d,]+) bytes/)[ 1 ]
      .replace(/\D/g, '')
    return `${binary(Number(freeByteString))}B free storage`
  } ],
  [ 'Network', 'vnstat -s' ],
  [ 'System', 'top -b -n 1 | head -n 5', describeSystemStatus ],
  [ 'Time', () => new Date().toISOString() ]
]
const runQuick = async (command, rootPath) => {
  const { promise, stdoutPromise } = run({ command, option: { cwd: rootPath }, quiet: true })
  await promise
  return String(await stdoutPromise)
}
const runStatusCommand = async (statusCommand, rootPath) => {
  let output = ''
  if (typeof (statusCommand) === 'string') output = await runQuick(statusCommand, rootPath)
  else if (typeof (statusCommand) === 'function') output = await statusCommand(rootPath)
  return output
}
const getCommonServerStatus = async (rootPath, statusCommandList = COMMON_SERVER_STATUS_COMMAND_LIST) => {
  const resultList = []
  for (const [ title, ...tryList ] of statusCommandList) {
    let output = ''
    for (const statusCommand of tryList) {
      output = await runStatusCommand(statusCommand, rootPath).catch(() => '')
      if (output) break
    }
    resultList.push([ title, output ])
  }
  return resultList
}

export { getCommonServerStatus }
