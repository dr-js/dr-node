import { spawnSync } from 'child_process'

// JSON.stringify(String(child_process.spawnSync('7z').stdout))
// JSON.stringify(String(child_process.spawnSync('tar', ['--version']).stdout))
// JSON.stringify(String(child_process.spawnSync('git', ['--version']).stdout))

const createDetect = (expect, message, command, ...argList) => () => {
  try {
    if (String(spawnSync(command, argList).stdout).includes(expect)) return
  } catch (error) {}
  throw new Error(message)
}

export {
  createDetect
}
