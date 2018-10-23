import { binary } from 'dr-js/module/common/format'
import { runQuiet } from 'dr-js/module/node/system/Run'
import { describeSystemStatus } from 'dr-js/module/node/system/Status'

// only common address, not all is checked, check: https://en.wikipedia.org/wiki/Private_network
const isPrivateAddress = (address) => (
  address === '127.0.0.1' || // fast common private ip
  address === '::1' ||
  address === '::' ||
  address.startsWith('192.168.') ||
  address.startsWith('127.') ||
  address.startsWith('10.') ||
  address.startsWith('fd') ||
  address === 'localhost' // technically this is not ip address
)

const COMMON_SERVER_STATUS_COMMAND_LIST = [
  [ 'Path', [ 'du -hd1' ] ],
  [ 'Disk', [
    'df -h .',
    // win32 alternative, sample stdout: `27 Dir(s)  147,794,321,408 bytes free`
    { command: 'dir | find "bytes free"', processOutput: (stdout) => `${binary(Number(stdout.match(/([\d,]+) bytes free/)[ 1 ].replace(/\D/g, '')))}B storage free` }
  ] ],
  [ 'Network', [ 'vnstat -s' ] ],
  [ 'System', [ 'top -b -n 1 | head -n 5', { commandFunc: () => describeSystemStatus() } ] ],
  [ 'Time', [ { commandFunc: () => (new Date().toISOString()) } ] ]
]
const runQuick = async (command, rootPath) => {
  const { promise, stdoutBufferPromise } = runQuiet({ command, option: { cwd: rootPath } })
  await promise
  return (await stdoutBufferPromise).toString()
}
const tryGetStatus = async (option, rootPath) => {
  if (typeof (option) === 'string') option = { command: option }
  let output = null
  if (option.command) output = await runQuick(option.command, rootPath)
  if (option.commandFunc) output = await option.commandFunc(option)
  if (option.processOutput) output = option.processOutput(output)
  return output
}
const getCommonServerStatus = async (rootPath) => {
  const resultList = []
  for (const [ title, tryList ] of COMMON_SERVER_STATUS_COMMAND_LIST) {
    let output = ''
    for (const option of tryList) {
      output = await tryGetStatus(option, rootPath).catch(() => '')
      if (output) break
    }
    resultList.push([ title, output ])
  }
  return resultList
}

export {
  isPrivateAddress,
  getCommonServerStatus
}
