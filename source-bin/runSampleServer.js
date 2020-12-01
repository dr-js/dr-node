import { tmpdir } from 'os'

import { Preset } from '@dr-js/core/module/node/module/Option/preset'

import { autoTestServerPort } from '@dr-js/core/module/node/server/function'

import {
  getServerExotOption, getLogOption, getPidOption,
  getServerExotFormatConfig, LogFormatConfig, PidFormatConfig
} from 'source/server/share/option'
import { runServer } from 'source/server/share/configure'

import {
  getAuthCommonOption, getAuthSkipOption, getAuthFileOption, getAuthFileGroupOption,
  AuthCommonFormatConfig, AuthSkipFormatConfig, AuthFileFormatConfig, AuthFileGroupFormatConfig
} from 'source/server/feature/Auth/option'
import { getPermissionOption, PermissionFormatConfig } from 'source/server/feature/Permission/option'
import { getFileOption, FileFormatConfig } from 'source/server/feature/File/option'
import { getExplorerOption, ExplorerFormatConfig } from 'source/server/feature/Explorer/option'
import { getStatCollectOption, StatCollectFormatConfig } from 'source/server/feature/StatCollect/option'
import { getStatReportOption, StatReportFormatConfig } from 'source/server/feature/StatReport/option'
import { getWebSocketTunnelOption, WebSocketTunnelFormatConfig } from 'source/server/feature/WebSocketTunnelDev/option'

import { configureSampleServer } from './sampleServer'

import { name as packageName, version as packageVersion } from '../package.json'

const SampleServerFormatConfig = getServerExotFormatConfig([
  Preset.parseCompact('debug-route/T|show debug route list on "/"'),

  LogFormatConfig,
  PidFormatConfig,

  AuthCommonFormatConfig, AuthSkipFormatConfig, AuthFileFormatConfig, AuthFileGroupFormatConfig,
  PermissionFormatConfig,

  FileFormatConfig,
  ExplorerFormatConfig,
  StatCollectFormatConfig,
  StatReportFormatConfig,

  WebSocketTunnelFormatConfig
])

const runSampleServer = async (optionData) => runServer(configureSampleServer, {
  ...getPidOption(optionData),
  ...getLogOption(optionData),
  ...getServerExotOption(optionData)
}, {
  packageName, packageVersion, isDebugRoute: optionData.getToggle('debug-route'),
  ...getAuthCommonOption(optionData), ...getAuthSkipOption(optionData), ...getAuthFileOption(optionData), ...getAuthFileGroupOption(optionData),
  ...getPermissionOption(optionData),
  ...getFileOption(optionData),
  ...getExplorerOption(optionData),
  ...getStatCollectOption(optionData),
  ...getStatReportOption(optionData),
  ...getWebSocketTunnelOption(optionData)
})

const runQuickSampleExplorerServer = async ({ rootPath, hostname, port }) => runServer(configureSampleServer, {
  hostname,
  port: port || await autoTestServerPort([ 80, 8080, 8888, 8800, 8000 ], hostname)
}, {
  packageName, packageVersion,
  permissionType: 'allow',
  authSkip: true,
  fileRootPath: rootPath,
  fileUploadMergePath: `${tmpdir()}/${packageName}@${packageVersion}-quick-sample-explorer-merge/`,
  explorer: true
})

export {
  SampleServerFormatConfig,
  runSampleServer, runQuickSampleExplorerServer
}
