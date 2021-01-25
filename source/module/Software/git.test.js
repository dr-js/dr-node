import { strictEqual } from '@dr-js/core/module/common/verify'
import {
  check, verify,
  getGitBranch, getGitCommitHash, getGitCommitMessage
} from './git'

const { describe, it, info = console.log } = global

describe('Node.Module.Software.git', () => {
  it('check()', () => strictEqual(check(), true))
  it('verify()', verify)

  it('getGitBranch()', () => info(`getGitBranch: ${getGitBranch()}`))
  it('getGitCommitHash()', () => info(`getGitCommitHash: ${getGitCommitHash()}`))
  it('getGitCommitMessage()', () => info(`getGitCommitMessage: ${getGitCommitMessage()}`))
})
