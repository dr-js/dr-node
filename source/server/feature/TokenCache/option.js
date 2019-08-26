import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact, parseCompactList } = Preset

const TokenCacheFormatConfig = parseCompact('token-cache-file/SP,O', parseCompactList(
  'token-cache-expire-time/SI,O',
  'token-cache-token-size/SI,O',
  'token-cache-size/SI,O'
))
const getTokenCacheOption = ({ tryGet, tryGetFirst }) => ({
  fileTokenCache: tryGetFirst('token-cache-file'),
  tokenCacheExpireTime: Boolean(tryGet('token-cache-expire-time')),
  tokenCacheTokenSize: tryGetFirst('token-cache-token-size'),
  tokenCacheSize: tryGetFirst('token-cache-size')
})

export {
  TokenCacheFormatConfig, getTokenCacheOption
}
