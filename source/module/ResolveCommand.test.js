import { strictEqual } from '@dr-js/core/module/common/verify'
import {
  resolveCommand,
  resolveCommandAsync
} from './ResolveCommand'

const { describe, it, info = console.log } = global

describe('Node.Module.ResolveCommand', () => {
  const COMMAND_LIST = [
    // [ command, isExpectResult ]
    [ process.platform === 'win32' ? 'ipconfig' : 'ifconfig', true ],
    [ 'npm', true ],
    [ 'npx', true ],
    [ 'node', true ],
    [ 'git', true ],
    [ 'tar', true ],
    [ '7z', true ],
    [ 'noop-0123456789', false ] // non-exist command should return ""
  ]

  it('resolveCommand()', () => {
    for (const [ command, isExpectResult ] of COMMAND_LIST) {
      const result = resolveCommand(command)
      info(`${JSON.stringify(command)} => ${JSON.stringify(result)}`)
      strictEqual(Boolean(result), isExpectResult)
    }
  })

  it('resolveCommandAsync()', async () => {
    for (const [ command, isExpectResult ] of COMMAND_LIST) {
      const result = await resolveCommandAsync(command)
      info(`${JSON.stringify(command)} => ${JSON.stringify(result)}`)
      strictEqual(Boolean(result), isExpectResult)
    }
  })
})
