import { strictEqual } from '@dr-js/core/module/common/verify'
import {
  getWebSocketProtocolListParam, packWebSocketProtocolListParam
} from './RequestCommon'

const { describe, it } = global

describe('Node.Module.RequestCommon', () => {
  it('getWebSocketProtocolListParam/packWebSocketProtocolListParam', () => {
    const key = '1234567890~`!@#$%^&*()_+-=[]{}:";\',.<>/?'
    const value = '~`!@#$%^&*()_+-=[]{}:";\',.<>/?'
    const param = packWebSocketProtocolListParam(key, value)

    strictEqual(
      getWebSocketProtocolListParam([ '', key, value, param ], key),
      value
    )
  })
})
