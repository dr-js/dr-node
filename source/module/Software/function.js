import { spawnSync } from 'child_process'

// JSON.stringify(String(child_process.spawnSync('7z').stdout))
// JSON.stringify(String(child_process.spawnSync('tar', ['--version']).stdout))
// JSON.stringify(String(child_process.spawnSync('git', ['--version']).stdout))

const createCommandWrap = (command) => ({
  getCommand: () => command,
  setCommand: (newCommand) => (command = newCommand) // allow set full path command, or change the auto find one
})

const createDetect = (expect, message, getCommand, ...argList) => {
  let isDetected
  return (checkOnly) => {
    if (isDetected === undefined) isDetected = String(spawnSync(getCommand(), argList).stdout).includes(expect)
    if (checkOnly) return isDetected
    if (!isDetected) throw new Error(message)
  }
}

export {
  createCommandWrap,
  createDetect
}
