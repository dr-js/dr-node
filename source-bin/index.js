#!/usr/bin/env node

import { getServerInfo } from 'dr-js/bin/server/function'

import { createServer as createServerPathContent } from 'dr-server/sample/pathContent'
import { createServer as createServerStatusCollect } from 'dr-server/sample/statusCollect'
import { createServer as createServerStatusReport } from 'dr-server/sample/statusReport'
import { clientFileUpload, clientFileDownload, clientFileModify } from 'dr-server/module/clientFile'

import { MODE_FORMAT_LIST, parseOption, formatUsage } from './option'
import { name as packageName, version as packageVersion } from '../package.json'

const runMode = async (modeFormat, { optionMap, getOption, getOptionOptional, getSingleOption, getSingleOptionOptional }) => {
  const startServer = async (createServer, extraConfig) => {
    const { start, option, logger } = await createServer({ ...getServerConfig(), ...extraConfig })
    start()
    logger.add(getServerInfo(
      modeFormat.name,
      option.protocol,
      option.hostname,
      option.port,
      Object.entries(extraConfig).map((key, value) => ` - ${key}: ${value}`))
    )
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
    case 'server-path-content':
      return startServer(createServerPathContent, {
        uploadRootPath: getSingleOptionOptional('file-upload-root-path'),
        uploadMergePath: getSingleOptionOptional('file-upload-merge-path')
      })
    case 'server-status-collect':
      return startServer(createServerStatusCollect, {
        statusCollectPath: getSingleOptionOptional('status-collect-path'),
        statusCollectUrl: getSingleOptionOptional('status-collect-url'),
        statusCollectInterval: getSingleOptionOptional('status-collect-interval')
      })
    case 'server-status-report':
      return startServer(createServerStatusReport, {
        statusReportProcessTag: getSingleOptionOptional('status-report-process-tag')
      })

    case 'client-file-upload':
      return clientFileUpload({
        fileInputPath: getSingleOption('file-upload-path'),
        filePath: getSingleOption('file-upload-key'),
        urlFileUpload: getSingleOption('file-upload-server-url'),
        fileAuth: getSingleOption('auth-file')
      })
    case 'client-file-download':
      return clientFileDownload({
        fileOutputPath: getSingleOption('file-download-path'),
        filePath: getSingleOption('file-download-key'),
        urlFileDownload: getSingleOption('file-download-server-url'),
        fileAuth: getSingleOption('auth-file')
      })
    case 'client-file-modify':
      return logJSON(await clientFileModify({
        modifyType: getSingleOption('modify-type'),
        filePath: getSingleOptionOptional('file-modify-key'),
        filePathTo: getSingleOptionOptional('file-modify-key-to'),
        urlFileModify: getSingleOption('file-modify-server-url'),
        fileAuth: getSingleOption('auth-file')
      }))
  }
}

const logJSON = (object) => console.log(JSON.stringify(object, null, '  '))

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
