import { spawnSync } from 'child_process'
import { createCommandWrap, createDetect } from './function'

const { getCommand, setCommand } = createCommandWrap('git')

// $ git --version
//   git version 2.23.0
const detect = createDetect(
  'git version',
  'expect "git" in PATH',
  getCommand, '--version'
)

const runSync = (...argList) => String(spawnSync(getCommand(), argList).stdout).replace(/\s/g, '')

const getGitBranch = () => runSync('symbolic-ref', '--short', 'HEAD') || `detached-HEAD/${runSync('rev-parse', '--short', 'HEAD')}`
const getGitCommitHash = () => runSync('log', '-1', '--format=%H')

export {
  getCommand, setCommand, detect,

  // TODO: NOTE: sync only, expect cwd under git repo
  getGitBranch,
  getGitCommitHash
}
