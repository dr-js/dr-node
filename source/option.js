import { ConfigPresetNode } from 'dr-js/module/node/module/Option'

const { SingleString, SingleInteger, SinglePath, SingleFunction, BooleanFlag } = ConfigPresetNode

// protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam
// pathLogDirectory, logFilePrefix
// filePid
const getServerFormatConfig = (extendFormatList = []) => ({
  ...SingleString,
  optional: true,
  name: 'hostname',
  shortName: 'H',
  extendFormatList: [
    { ...SingleInteger, name: 'port', shortName: 'P' },
    {
      ...BooleanFlag,
      name: 'https',
      shortName: 'S',
      extendFormatList: [
        { ...SinglePath, name: 'file-SSL-key' },
        { ...SinglePath, name: 'file-SSL-cert' },
        { ...SinglePath, name: 'file-SSL-chain' },
        { ...SinglePath, name: 'file-SSL-dhparam' }
      ]
    },
    {
      ...SinglePath,
      optional: true,
      name: 'log-path',
      extendFormatList: [
        { ...SingleString, optional: true, name: 'log-file-prefix' }
      ]
    },
    {
      ...SinglePath,
      optional: true,
      name: 'pid-file',
      extendFormatList: [
        { ...BooleanFlag, name: 'pid-ignore-exist' }
      ]
    },
    ...extendFormatList
  ]
})

// fileTokenCache, tokenSize, tokenExpireTime
const TokenCacheFormatConfig = {
  ...SinglePath,
  optional: true,
  name: 'token-cache-file',
  extendFormatList: [
    { ...SingleInteger, optional: true, name: 'token-cache-expire-time' },
    { ...SingleInteger, optional: true, name: 'token-cache-token-size' },
    { ...SingleInteger, optional: true, name: 'token-cache-size' }
  ]
}

// fileAuth, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap
const AuthFormatConfig = {
  ...SinglePath,
  optional: true,
  name: 'auth-file',
  extendFormatList: [ {
    ...BooleanFlag,
    name: 'auth-gen',
    extendFormatList: [
      { ...SingleString, optional: true, name: 'auth-gen-tag' },
      { ...SingleInteger, optional: true, name: 'auth-gen-size' },
      { ...SingleInteger, optional: true, name: 'auth-gen-token-size' },
      { ...SingleInteger, optional: true, name: 'auth-gen-time-gap' }
    ]
  } ]
}

// pathAuthGroup, authGroupDefaultTag, authGroupKeySuffix, authGroupVerifyRequestTag
const AuthGroupFormatConfig = {
  ...SinglePath,
  optional: true,
  name: 'auth-group-path',
  extendFormatList: [
    { ...SingleString, name: 'auth-group-default-tag' },
    { ...SingleString, optional: true, name: 'auth-group-key-suffix' },
    { ...SingleFunction, optional: true, name: 'auth-group-verify-request-tag' }
  ]
}

// uploadRootPath, uploadMergePath
const ExplorerFormatConfig = {
  ...SinglePath,
  optional: true,
  name: 'explorer-root-path',
  extendFormatList: [
    { ...SinglePath, name: 'explorer-upload-merge-path' }
  ]
}

// statusCollectPath, statusCollectUrl, statusCollectInterval
const StatusCollectFormatConfig = {
  ...SinglePath,
  optional: true,
  name: 'status-collect-path',
  extendFormatList: [
    { ...SingleString, optional: true, name: 'status-collect-url' },
    { ...SingleInteger, optional: true, name: 'status-collect-interval' }
  ]
}

// statusReportProcessTag
const StatusReportFormatConfig = { ...SingleString, optional: true, name: 'status-report-process-tag' }

const TaskRunnerFormatConfig = { ...SinglePath, optional: true, name: 'task-runner-root-path' }

export {
  getServerFormatConfig,
  TokenCacheFormatConfig,
  AuthFormatConfig,
  AuthGroupFormatConfig,
  ExplorerFormatConfig,
  StatusCollectFormatConfig,
  StatusReportFormatConfig,
  TaskRunnerFormatConfig
}
