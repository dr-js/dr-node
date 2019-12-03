import { spawnSync } from 'child_process'

// JSON.stringify(String(child_process.spawnSync('7z').stdout))
// JSON.stringify(String(child_process.spawnSync('tar', ['--version']).stdout))
// JSON.stringify(String(child_process.spawnSync('git', ['--version']).stdout))

const createDetect = (expect, message, command, ...argList) => {
  let isDetected
  return (checkOnly) => {
    if (isDetected === undefined) isDetected = String(spawnSync(command, argList).stdout).includes(expect)

    if (checkOnly) return isDetected
    else throw new Error(message)
  }
}

export {
  createDetect
}
