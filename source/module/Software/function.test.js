import { strictEqual, doThrow } from '@dr-js/core/module/common/verify'

import { probeSync, createArgListPack } from './function'

const { describe, it } = global

describe('Node.Module.Software.function', () => {
  it('probeSync()', () => {
    strictEqual(probeSync([ 'node', '--help' ], 'node'), true)
    strictEqual(probeSync([ 'qwertyuiop1234567890', '--version' ], 'qwertyuiop1234567890'), false)
  })

  it('createArgListPack() exist', () => {
    const args = [ 'node' ]
    const { check, verify } = createArgListPack(
      () => probeSync([ 'node', '--help' ], 'node') ? args : undefined,
      'node should exist'
    )
    strictEqual(check(), true)
    strictEqual(verify(), args)
  })

  it('createArgListPack() non-exist', () => {
    const { check, verify } = createArgListPack(
      () => probeSync([ 'qwertyuiop1234567890', '--version' ], 'qwertyuiop1234567890') ? [ 'non-exist' ] : undefined,
      'qwertyuiop1234567890 should not exist'
    )
    strictEqual(check(), false)
    doThrow(verify)
  })
})
