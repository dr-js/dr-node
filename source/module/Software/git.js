import { spawnSync } from 'child_process'

import { createDetect } from './function'

const command = 'git'

// $ git --version
//   git version 2.23.0
const detect = createDetect(
  'git version',
  'expect "git" in PATH',
  command, '--version'
)

const runSync = (command, ...argList) => String(spawnSync(command, argList).stdout).replace(/\s/g, '')

const getGitBranch = () => runSync(command, 'symbolic-ref', '--short', 'HEAD') || `detached-HEAD/${runSync('git', 'rev-parse', '--short', 'HEAD')}`
const getGitCommitHash = () => runSync(command, 'log', '-1', '--format=%H')

export {
  detect,

  // TODO: NOTE: sync only, expect cwd under git repo
  getGitBranch,
  getGitCommitHash
}
