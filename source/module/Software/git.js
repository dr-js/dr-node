import { createCommandWrap, createDetect } from './function'

const { getCommand, setCommand } = createCommandWrap('git') // TODO: DEPRECATE
const detect = createDetect('git version', 'expect "git" in PATH', getCommand, '--version') // TODO: DEPRECATE

export {
  getArgs, setArgs, check, verify,
  getGitBranch, getGitCommitHash, getGitCommitMessage // TODO: NOTE: sync only, expect cwd under git repo
} from '@dr-js/core/module/node/module/Software/git.js'
export {
  getCommand, setCommand, detect // TODO: DEPRECATE
}
