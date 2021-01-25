import { strictEqual, doThrow } from '@dr-js/core/module/common/verify'
import { resolveCommandName } from '@dr-js/core/module/node/system/ResolveCommand'

import {
  check, verify
} from './docker'

const { describe, it, info = console.log } = global

describe('Node.Module.Software.Docker', () => {
  __DEV__ && info(`DOCKER_BIN_PATH: ${resolveCommandName('docker')}`)

  if (resolveCommandName('docker')) {
    it('check()', () => strictEqual(check(), true))
    it('verify()', verify)
  } else { // no docker installed (GitHub CI Macos)
    it('check()', () => strictEqual(check(), false))
    it('verify()', () => doThrow(verify))
  }
})
