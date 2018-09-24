import { ConfigPresetNode, prepareOption } from 'dr-js/module/node/module/Option'
import {
  getServerFormatConfig,
  TokenCacheFormatConfig,
  AuthFormatConfig,
  FileUploadFormatConfig,
  StatusCollectFormatConfig,
  StatusReportFormatConfig
} from 'dr-server/module/option'

const { SingleString, SinglePath, BooleanFlag, Config } = ConfigPresetNode

const MODE_FORMAT_LIST = [
  // [ 'server-config|sc' ],

  [ 'server-explorer|se', [ FileUploadFormatConfig ] ],
  [ 'server-status-collect|ssc', [ StatusCollectFormatConfig ] ],
  [ 'server-status-report|ssr', [ StatusReportFormatConfig ] ],

  [ 'client-file-upload|cfu', [
    { ...SingleString, name: 'file-upload-server-url' },
    { ...SingleString, name: 'file-upload-key' },
    { ...SinglePath, name: 'file-upload-path' }
  ] ],
  [ 'client-file-download|cfd', [
    { ...SingleString, name: 'file-download-server-url' },
    { ...SingleString, name: 'file-download-key' },
    { ...SinglePath, name: 'file-download-path' }
  ] ],
  [ 'client-file-modify|cfm', [
    { ...SingleString, name: 'file-modify-server-url' },
    { ...SingleString, name: 'modify-type' },
    { ...SingleString, optional: true, name: 'file-modify-key' },
    { ...SingleString, optional: true, name: 'file-modify-key-to' }
  ] ]
].map(([ nameConfig, extendFormatList ]) => {
  const [ name, ...aliasNameList ] = nameConfig.split('|')
  return { ...BooleanFlag, name, aliasNameList, extendFormatList }
})

const OPTION_CONFIG = {
  prefixENV: 'dr-server',
  formatList: [
    Config,
    { ...BooleanFlag, name: 'version', shortName: 'v' },
    { ...BooleanFlag, name: 'help', shortName: 'h', description: `show full help` },
    ...MODE_FORMAT_LIST,
    getServerFormatConfig([ TokenCacheFormatConfig, AuthFormatConfig ])
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { MODE_FORMAT_LIST, parseOption, formatUsage }
