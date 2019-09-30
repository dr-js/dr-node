import { spawnSync } from 'child_process'

import { createDetect } from './function'

// $ git --version
//   git version 2.23.0

const command = 'git'

const detect = createDetect(
  'git version',
  'expect "git" in PATH',
  command, '--version'
)

const trim = (output) => String(output).replace(/\s/g, '')

const getGitBranch = () => {
  try {
    return trim(spawnSync(command, [ 'symbolic-ref', '--short', 'HEAD' ]).stdout)
  } catch (error) {
    return `detached-HEAD/${trim(spawnSync(command, [ 'rev-parse', '--short', 'HEAD' ]).stdout)}`
  }
}

const getGitCommitHash = () => trim(spawnSync(command, [ 'log', '-1', '--format=%H' ]).stdout)

export {
  detect,

  // TODO: NOTE: sync only, expect cwd under git repo
  getGitBranch,
  getGitCommitHash
}
