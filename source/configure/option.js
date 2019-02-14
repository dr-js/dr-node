import { Preset } from 'dr-js/module/node/module/Option/preset'

const { parseCompact, parseCompactList, pickOneOf } = Preset

// pathLogDirectory, logFilePrefix
const LogFormatConfig = parseCompact('log-path/SP,O', parseCompactList(
  'log-file-prefix/SS,O'
))
const getLogOption = ({ tryGetFirst }) => ({
  pathLogDirectory: tryGetFirst('log-path'),
  logFilePrefix: tryGetFirst('log-file-prefix')
})

// filePid, shouldIgnoreExistPid
const PidFormatConfig = parseCompact('pid-file/SP,O', parseCompactList(
  'pid-ignore-exist/T'
))
const getPidOption = ({ tryGet, tryGetFirst }) => ({
  filePid: tryGetFirst('pid-file'),
  shouldIgnoreExistPid: Boolean(tryGet('pid-ignore-exist'))
})

// fileAuth, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap
const AuthFormatConfig = parseCompact('auth-file/SP,O', parseCompactList(
  [ 'auth-gen/T', parseCompactList(
    'auth-gen-tag/SS,O',
    'auth-gen-size/SI,O',
    'auth-gen-token-size/SI,O',
    'auth-gen-time-gap/SI,O'
  ) ]
))
const getAuthOption = ({ tryGet, tryGetFirst }) => ({
  fileAuth: tryGetFirst('auth-file'),
  shouldAuthGen: Boolean(tryGet('auth-gen')),
  authGenTag: tryGetFirst('auth-gen-tag'),
  authGenSize: tryGetFirst('auth-gen-size'),
  authGenTokenSize: tryGetFirst('auth-gen-token-size'),
  authGenTimeGap: tryGetFirst('auth-gen-time-gap')
})

// pathAuthGroup, authGroupDefaultTag, authGroupKeySuffix, authGroupVerifyRequestTag
const AuthGroupFormatConfig = parseCompact('auth-group-path/SP,O', parseCompactList(
  'auth-group-default-tag/SS',
  'auth-group-key-suffix/SS,O',
  'auth-group-verify-request-tag/SF,O'
  // TODO: can add more option
))
const getAuthGroupOption = ({ tryGetFirst }) => ({
  pathAuthGroup: tryGetFirst('auth-group-path'),
  authGroupDefaultTag: tryGetFirst('auth-group-default-tag'),
  authGroupKeySuffix: tryGetFirst('auth-group-key-suffix'),
  authGroupVerifyRequestTag: tryGetFirst('auth-group-verify-request-tag')
})

// permissionType, permissionFunc, permissionFile
const PermissionFormatConfig = {
  ...pickOneOf([ 'allow', 'deny', 'func', 'file' ]),
  name: 'permission-type',
  extendFormatList: parseCompactList(
    'permission-func/SF,O',
    'permission-file/SP,O'
  )
}
const getPermissionOption = ({ tryGetFirst }) => ({
  permissionType: tryGetFirst('permission-type'),
  permissionFunc: tryGetFirst('permission-func'),
  permissionFile: tryGetFirst('permission-file')
})

// fileTokenCache, tokenSize, tokenExpireTime
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
  LogFormatConfig, getLogOption,
  PidFormatConfig, getPidOption,
  AuthFormatConfig, getAuthOption,
  AuthGroupFormatConfig, getAuthGroupOption,
  PermissionFormatConfig, getPermissionOption,
  TokenCacheFormatConfig, getTokenCacheOption
}