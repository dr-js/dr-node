import { ConfigPreset } from 'dr-js/module/common/module/Option/preset'

const { SingleString, SingleInteger, BooleanFlag } = ConfigPreset

// protocol, hostname, port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam
// pathLogDirectory, prefixLogFile
// filePid
const SERVER_FORMAT_CONFIG = {
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
        { ...SingleString, isPath: true, name: 'file-SSL-key' },
        { ...SingleString, isPath: true, name: 'file-SSL-cert' },
        { ...SingleString, isPath: true, name: 'file-SSL-chain' },
        { ...SingleString, isPath: true, name: 'file-SSL-dhparam' }
      ]
    },
    { ...SingleString, isPath: true, optional: true, name: 'path-log', extendFormatList: [ { ...SingleString, optional: true, name: 'prefix-log-file' } ] },
    { ...SingleString, isPath: true, optional: true, name: 'file-pid' }
  ]
}

// fileAuthConfig, shouldAuthGen, authGenTag, authGenSize, authGenTokenSize, authGenTimeGap
const AUTH_FORMAT_CONFIG = {
  ...SingleString,
  optional: true,
  isPath: true,
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
const FILE_UPLOAD_FORMAT_CONFIG = {
  ...SingleString,
  optional: true,
  isPath: true,
  name: 'path-upload-root',
  extendFormatList: [ { ...SingleString, isPath: true, name: 'path-upload-merge' } ]
}

// statusCollectPath, statusCollectUrl, statusCollectInterval
const STATUS_COLLECT_FORMAT_CONFIG = {
  ...SingleString,
  optional: true,
  isPath: true,
  name: 'path-status-collect',
  extendFormatList: [
    { ...SingleString, optional: true, name: 'status-collect-url' },
    { ...SingleInteger, optional: true, name: 'status-collect-interval' }
  ]
}

// statusReportProcessTag
const STATUS_REPORT_FORMAT_CONFIG = { ...SingleString, optional: true, name: 'status-report-process-tag' }

export {
  SERVER_FORMAT_CONFIG,
  AUTH_FORMAT_CONFIG,
  FILE_UPLOAD_FORMAT_CONFIG,
  STATUS_COLLECT_FORMAT_CONFIG,
  STATUS_REPORT_FORMAT_CONFIG
}
