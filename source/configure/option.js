import { ConfigPreset, parseCompactFormat as parse } from 'dr-js/module/node/module/Option/preset'

const { OneOfString } = ConfigPreset

const parseList = (...args) => args.map(parse)

// pathLogDirectory, logFilePrefix
const LogFormatConfig = {
  ...parse('log-path/SP,O'),
  extendFormatList: parseList('log-file-prefix/SS,O')
}
const getLogOption = ({ tryGetFirst }) => ({
  pathLogDirectory: tryGetFirst('log-path'),
  logFilePrefix: tryGetFirst('log-file-prefix')
})

// filePid, shouldIgnoreExistPid
const PidFormatConfig = {
  ...parse('pid-file/SP,O'),
  extendFormatList: parseList('pid-ignore-exist/T')
}
const getPidOption = ({ tryGet, tryGetFirst }) => ({
  filePid: tryGetFirst('pid-file'),
  shouldIgnoreExistPid: Boolean(tryGet('pid-ignore-exist'))
})

// fileAuth, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap
const AuthFormatConfig = {
  ...parse('auth-file/SP,O'),
  extendFormatList: [ {
    ...parse('auth-gen/T'),
    extendFormatList: parseList(
      'auth-gen-tag/SS,O',
      'auth-gen-size/SI,O',
      'auth-gen-token-size/SI,O',
      'auth-gen-time-gap/SI,O'
    )
  } ]
}
const getAuthOption = ({ tryGet, tryGetFirst }) => ({
  fileAuth: tryGetFirst('auth-file'),
  shouldAuthGen: Boolean(tryGet('auth-gen')),
  authGenTag: tryGetFirst('auth-gen-tag'),
  authGenSize: tryGetFirst('auth-gen-size'),
  authGenTokenSize: tryGetFirst('auth-gen-token-size'),
  authGenTimeGap: tryGetFirst('auth-gen-time-gap')
})

// pathAuthGroup, authGroupDefaultTag, authGroupKeySuffix, authGroupVerifyRequestTag
const AuthGroupFormatConfig = { // TODO: can add more option
  ...parse('auth-group-path/SP,O'),
  extendFormatList: parseList(
    'auth-group-default-tag/SS',
    'auth-group-key-suffix/SS,O',
    'auth-group-verify-request-tag/SF,O'
  )
}
const getAuthGroupOption = ({ tryGetFirst }) => ({
  pathAuthGroup: tryGetFirst('auth-group-path'),
  authGroupDefaultTag: tryGetFirst('auth-group-default-tag'),
  authGroupKeySuffix: tryGetFirst('auth-group-key-suffix'),
  authGroupVerifyRequestTag: tryGetFirst('auth-group-verify-request-tag')
})

// permissionType, permissionFunc, permissionFile
const PermissionFormatConfig = {
  ...OneOfString([ 'allow', 'deny', 'func', 'file' ]),
  name: 'permission-type',
  extendFormatList: parseList(
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
const TokenCacheFormatConfig = {
  ...parse('token-cache-file/SP,O'),
  extendFormatList: parseList(
    'token-cache-expire-time/SI,O',
    'token-cache-token-size/SI,O',
    'token-cache-size/SI,O'
  )
}
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
