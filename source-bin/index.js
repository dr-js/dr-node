#!/usr/bin/env node

import { describeServer } from 'dr-js/bin/function'

import { createServer as createSampleServer } from 'dr-server/sample/server'
// import { createServer as createServerTaskRunner } from 'dr-server/sample/taskRunner'
// import { createServer as createServerStatusCollect } from 'dr-server/sample/statusCollect'
// import { createServer as createServerStatusReport } from 'dr-server/sample/statusReport'

import { fileUpload, fileDownload, pathAction } from 'dr-server/module/featureNode/explorer'

import { MODE_FORMAT_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (modeFormat, { optionMap, getOption, getOptionOptional, getSingleOption, getSingleOptionOptional }) => {
  const startServer = async (createServer, extraConfig) => {
    const { start, option, logger } = await createServer({ ...getServerConfig(), ...extraConfig })
    await start()
    logger.add(describeServer(option, modeFormat.name, Object.entries(extraConfig).map(([ key, value ]) => value !== undefined && `${key}: ${value}`).filter(Boolean)))
  }

  const getServerConfig = () => ({
    filePid: getSingleOptionOptional('pid-file'),
    shouldIgnoreExistPid: getSingleOptionOptional('pid-ignore-exist'),

    hostname: getSingleOptionOptional('hostname'),
    port: getSingleOptionOptional('port'),
    protocol: getOptionOptional('https') ? 'https:' : 'http:',
    fileSSLKey: getSingleOptionOptional('file-SSL-key'),
    fileSSLCert: getSingleOptionOptional('file-SSL-cert'),
    fileSSLChain: getSingleOptionOptional('file-SSL-chain'),
    fileSSLDHParam: getSingleOptionOptional('file-SSL-dhparam'),

    pathLogDirectory: getSingleOptionOptional('log-path'),
    logFilePrefix: getSingleOptionOptional('log-file-prefix'),

    fileAuth: getSingleOptionOptional('auth-file'),
    shouldAuthGen: getOptionOptional('auth-gen'),
    authGenTag: getSingleOptionOptional('auth-gen-tag'),
    authGenSize: getSingleOptionOptional('auth-gen-size'),
    authGenTokenSize: getSingleOptionOptional('auth-gen-token-size'),
    authGenTimeGap: getSingleOptionOptional('auth-gen-time-gap')
  })

  switch (modeFormat.name) {
    case 'server':
      return startServer(createSampleServer, {
        explorerRootPath: getSingleOptionOptional('explorer-root-path'),
        explorerUploadMergePath: getSingleOptionOptional('explorer-upload-merge-path'),

        statusCollectPath: getSingleOptionOptional('status-collect-path'),
        statusCollectUrl: getSingleOptionOptional('status-collect-url'),
        statusCollectInterval: getSingleOptionOptional('status-collect-interval'),

        statusReportProcessTag: getSingleOptionOptional('status-report-process-tag'),

        taskRunnerRootPath: getSingleOptionOptional('task-runner-root-path')
      })
    case 'node-file-upload':
      return fileUpload({
        fileInputPath: getSingleOption('file-upload-path'),
        filePath: getSingleOption('file-upload-key'),
        urlFileUpload: getSingleOption('file-upload-server-url'),
        fileAuth: getSingleOption('auth-file')
      })
    case 'node-file-download':
      return fileDownload({
        fileOutputPath: getSingleOption('file-download-path'),
        filePath: getSingleOption('file-download-key'),
        urlFileDownload: getSingleOption('file-download-server-url'),
        fileAuth: getSingleOption('auth-file')
      })
    case 'node-path-action':
      return logJSON(await pathAction({
        nameList: getOptionOptional('path-action-name-list'),
        actionType: getSingleOption('path-action-type'),
        key: getSingleOptionOptional('path-action-key'),
        keyTo: getSingleOptionOptional('path-action-key-to'),
        urlPathAction: getSingleOption('path-action-server-url'),
        fileAuth: getSingleOption('auth-file')
      }))
  }
}

const logJSON = (object) => console.log(JSON.stringify(object, null, 2))

const main = async () => {
  const optionData = await parseOption()
  const modeFormat = MODE_FORMAT_LIST.find(({ name }) => optionData.getOptionOptional(name))

  if (!modeFormat) {
    return optionData.getOptionOptional('version')
      ? logJSON({ packageName, packageVersion })
      : console.log(formatUsage(null, optionData.getOptionOptional('help') ? null : 'simple'))
  }

  await runMode(modeFormat, optionData).catch((error) => {
    console.warn(`[Error] in mode: ${modeFormat.name}:`, error.stack || error)
    process.exit(2)
  })
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
