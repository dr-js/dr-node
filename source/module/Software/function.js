import { spawnSync } from 'child_process'
import { tmpdir } from 'os'
import { resolve } from 'path'
import { getRandomId } from '@dr-js/core/module/common/math/random'
import { createDirectory, deleteDirectory } from '@dr-js/core/module/node/file/Directory'

const probeSync = ([ command, ...argList ], expect) => String(spawnSync(command, argList).stdout || '').includes(expect)

const createArgListPack = (
  getArgList, // () => [] || undefined // NOTE: return false to deny re-check
  message
) => {
  let args // undefined, or array like [ '7z' ] and [ 'sudo', 'docker' ]
  const check = () => {
    if (args === undefined) args = getArgList()
    return Boolean(args)
  }
  const verify = () => {
    if (args === undefined) args = getArgList()
    if (!args) throw new Error(message)
    return args // array
  }
  return {
    getArgs: () => args, // may get undefined
    setArgs: (...newArgs) => (args = newArgs), // allow change the preset one
    check,
    verify
  }
}

const withTempPath = async (
  pathTemp = resolve(tmpdir(), getRandomId('dr-node-')),
  asyncFunc,
  pathFrom, pathTo
) => {
  await createDirectory(pathTemp)
  await asyncFunc(resolve(pathFrom), resolve(pathTo), pathTemp)
  await deleteDirectory(pathTemp)
}

const createCommandWrap = (command) => ({ // TODO: DEPRECATE
  getCommand: () => command,
  setCommand: (newCommand) => (command = newCommand) // allow set full path command, or change the auto find one
})
const createDetect = (expect, message, getCommand, ...argList) => { // TODO: DEPRECATE
  let isDetected
  return (checkOnly) => {
    if (isDetected === undefined) isDetected = String(spawnSync(getCommand(), argList).stdout || '').includes(expect)
    if (checkOnly) return isDetected
    if (!isDetected) throw new Error(message)
  }
}

export {
  probeSync,
  createArgListPack,
  withTempPath,

  createCommandWrap, createDetect // TODO: DEPRECATE
}
