import { ConfigPresetNode, prepareOption } from 'dr-js/module/node/module/Option'
import {
  getServerFormatConfig,
  TokenCacheFormatConfig,
  AuthFormatConfig,
  AuthGroupFormatConfig,
  ExplorerFormatConfig,
  StatusCollectFormatConfig,
  StatusReportFormatConfig,
  TaskRunnerFormatConfig
} from 'dr-server/module/option'

const { SingleString, AllString, SinglePath, BooleanFlag, Config } = ConfigPresetNode

const MODE_FORMAT_LIST = [
  [ 'server|s', [ getServerFormatConfig([
    TokenCacheFormatConfig,
    AuthFormatConfig,
    AuthGroupFormatConfig,
    ExplorerFormatConfig,
    StatusCollectFormatConfig,
    StatusReportFormatConfig,
    TaskRunnerFormatConfig
  ]) ] ],
  [ 'node-file-upload|nfu', [
    { ...SingleString, name: 'file-upload-server-url' },
    { ...SingleString, name: 'file-upload-key' },
    { ...SinglePath, name: 'file-upload-path' }
  ] ],
  [ 'node-file-download|nfd', [
    { ...SingleString, name: 'file-download-server-url' },
    { ...SingleString, name: 'file-download-key' },
    { ...SinglePath, name: 'file-download-path' }
  ] ],
  [ 'node-path-action|npa', [
    { ...SingleString, name: 'path-action-server-url' },
    { ...SingleString, name: 'path-action-type' },
    { ...SingleString, optional: true, name: 'path-action-key' },
    { ...SingleString, optional: true, name: 'path-action-key-to' },
    { ...AllString, optional: true, name: 'path-action-name-list' }
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
    ...MODE_FORMAT_LIST
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { MODE_FORMAT_LIST, parseOption, formatUsage }
