import { ConfigPresetNode } from 'dr-js/module/node/module/Option'

const { SingleString, SingleInteger, SinglePath, BooleanFlag } = ConfigPresetNode

// protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam
// pathLogDirectory, prefixLogFile
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
      name: 'path-log',
      extendFormatList: [
        { ...SingleString, optional: true, name: 'prefix-log-file' } // TODO: change to `log-file-prefix`
      ]
    },
    {
      ...SinglePath,
      optional: true,
      name: 'file-pid',
      extendFormatList: [
        { ...BooleanFlag, name: 'pid-ignore-exist' }
      ]
    },
    ...extendFormatList
  ]
})

// fileTokenCache, tokenSize, tokenExpireTime
const tokenCacheFormatConfig = {
  ...SinglePath,
  optional: true,
  name: 'file-token-cache',
  extendFormatList: [
    { ...SingleInteger, optional: true, name: 'token-size' },
    { ...SingleInteger, optional: true, name: 'token-expire-time' }
  ]
}

// fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap
const AuthFormatConfig = {
  ...SinglePath,
  optional: true,
  name: 'file-auth-config',
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

// uploadRootPath, uploadMergePath
const FileUploadFormatConfig = {
  ...SinglePath,
  optional: true,
  name: 'path-upload-root',
  extendFormatList: [
    { ...SinglePath, name: 'path-upload-merge' }
  ]
}

// statusCollectPath, statusCollectUrl, statusCollectInterval
const StatusCollectFormatConfig = {
  ...SinglePath,
  optional: true,
  name: 'path-status-collect',
  extendFormatList: [
    { ...SingleString, optional: true, name: 'status-collect-url' },
    { ...SingleInteger, optional: true, name: 'status-collect-interval' }
  ]
}

// statusReportProcessTag
const StatusReportFormatConfig = {
  ...SingleString,
  optional: true,
  name: 'status-report-process-tag'
}

export {
  getServerFormatConfig,
  tokenCacheFormatConfig,
  AuthFormatConfig,
  FileUploadFormatConfig,
  StatusCollectFormatConfig,
  StatusReportFormatConfig
}
