import { detect, getGitBranch, getGitCommitHash } from './git'

const { describe, it, info = console.log } = global

describe('Node.Module.Software.git', () => {
  it('detect()', detect)
  it('getGitBranch()', () => info(`getGitBranch: ${getGitBranch()}`))
  it('getGitCommitHash()', () => info(`getGitCommitHash: ${getGitCommitHash()}`))
})
