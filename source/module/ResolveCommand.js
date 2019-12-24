import { spawnSync } from 'child_process'
import { run } from '@dr-js/core/module/node/system/Run'

const configureWin32 = () => {
  // process.env.PATHEXT // '.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC'
  const extList = (process.env.PATHEXT || '.EXE;.BAT;.CMD').toUpperCase().split(';')
  return [
    'WHERE.EXE', // https://ss64.com/nt/where.html
    (stdoutString) => stdoutString.split('\r\n').find((path) => extList.includes(path.slice(path.lastIndexOf('.')).toUpperCase())) || ''
  ]
}
const configureLinux = () => [
  'which', // https://ss64.com/bash/which.html
  (stdoutString) => stdoutString.trim()
]

const CONFIGURE_MAP = {
  linux: configureLinux(),
  win32: configureWin32(),
  darwin: configureLinux(),
  android: configureLinux()
}

// if not found, result in empty string: ""
const resolveCommand = (command) => {
  const configure = CONFIGURE_MAP[ process.platform ]
  if (!configure) throw new Error(`unsupported platform: ${process.platform}`)
  const [ checkCommand, processFunc ] = configure
  return processFunc(String(spawnSync(checkCommand, [ command ]).stdout || ''))
}

// if not found, result in empty string: ""
const resolveCommandAsync = async (command) => {
  const configure = CONFIGURE_MAP[ process.platform ]
  if (!configure) throw new Error(`unsupported platform: ${process.platform}`)
  const [ checkCommand, processFunc ] = configure
  const { promise, stdoutPromise } = run({ command: checkCommand, argList: [ command ], quiet: true })
  return processFunc(String(await promise.then(() => stdoutPromise, () => '')))
}

export {
  resolveCommand,
  resolveCommandAsync
}
