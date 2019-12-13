import { stringifyEqual, doThrow, doNotThrow } from '@dr-js/core/module/common/verify'

import { createDetect } from './function'

const { describe, it } = global

describe('Node.Module.Software.function', () => {
  it('createDetect()', () => {
    const detectNode = createDetect('node', 'node should be installed', 'node', '--help')
    doNotThrow(detectNode)
    stringifyEqual(detectNode(true), true)

    const detectError = createDetect('qwertyuiop1234567890', 'this should not be installed', 'qwertyuiop1234567890', '--version')
    doThrow(detectError)
    stringifyEqual(detectError(true), false)
  })
})
