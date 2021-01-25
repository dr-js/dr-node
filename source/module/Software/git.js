import { spawnSync } from 'child_process'
import {
  probeSync, createArgListPack,
  createCommandWrap, createDetect
} from './function'

// $ git --version
//   git version 2.23.0
const { getArgs, setArgs, check, verify } = createArgListPack(
  () => probeSync([ 'git', '--version' ], 'git version')
    ? [ 'git' ]
    : undefined,
  'expect "git" in PATH'
)

const squeeze = (string) => string.replace(/\s/g, '')
const runSync = (...args) => {
  const [ command, ...argList ] = [ ...verify(), ...args ]
  return String(spawnSync(command, argList).stdout || '')
}

const getGitBranch = () => squeeze(
  runSync('symbolic-ref', '--short', 'HEAD') ||
  `detached-HEAD/${runSync('rev-parse', '--short', 'HEAD')}`
)
const getGitCommitHash = (revisionRange = 'HEAD') => squeeze(runSync('log', '-1', '--format=%H', revisionRange))
const getGitCommitMessage = (revisionRange = 'HEAD') => runSync('log', '-1', '--format=%B', revisionRange)

const { getCommand, setCommand } = createCommandWrap('git') // TODO: DEPRECATE
const detect = createDetect('git version', 'expect "git" in PATH', getCommand, '--version') // TODO: DEPRECATE

export {
  getArgs, setArgs, check, verify,
  getGitBranch, getGitCommitHash, getGitCommitMessage, // TODO: NOTE: sync only, expect cwd under git repo

  getCommand, setCommand, detect // TODO: DEPRECATE
}
