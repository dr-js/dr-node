import { promises as fsAsync } from 'fs'

import { Preset } from '@dr-js/core/module/node/module/Option/preset'

import { time } from '@dr-js/core/module/common/format'
import { createStepper } from '@dr-js/core/module/common/time'
import { isBasicObject } from '@dr-js/core/module/common/check'
import { prettyStringifyTreeNode } from '@dr-js/core/module/common/data/Tree'

import { writeBufferToStreamAsync } from '@dr-js/core/module/node/data/Stream'
import { PATH_TYPE } from '@dr-js/core/module/node/file/Path'
import { getDirInfoList, getDirInfoTree, getFileList } from '@dr-js/core/module/node/file/Directory'

import { describeAuthFile, generateAuthFile, generateAuthCheckCode, verifyAuthCheckCode, configureAuthFile } from '@dr-js/node/module/module/Auth'
import { ACTION_TYPE as ACTION_TYPE_PATH } from '@dr-js/node/module/module/ActionJSON/path'
import { ACTION_TYPE as ACTION_TYPE_PATH_EXTRA_ARCHIVE } from '@dr-js/node/module/module/ActionJSON/pathExtraArchive'

import { pingRaceUrlList, pingStatUrlList } from '@dr-js/node/module/module/PingRace'

import { compressAutoAsync, extractAutoAsync } from '@dr-js/node/module/module/Software/archive'
import { detect as detectGit, getGitBranch, getGitCommitHash } from '@dr-js/node/module/module/Software/git'

import { runServerExotGroup } from '@dr-js/node/module/server/share/configure'

import { getAuthCommonOption, getAuthFileOption } from '@dr-js/node/module/server/feature/Auth/option'
import { actionJson } from '@dr-js/node/module/server/feature/ActionJSON/client'
import { fileUpload, fileDownload } from '@dr-js/node/module/server/feature/File/client'
import { setupClientWebSocketTunnel } from '@dr-js/node/module/server/feature/WebSocketTunnelDev/client'

import { setupPackageSIGUSR2 } from './function'
import { runQuickSampleExplorerServer } from './runSampleServer'

const { pickOneOf, parseCompactList } = Preset

const EXPLORER_CLIENT_DESC = 'require provide "auth-file" or "auth-file-group"'

const CommonFormatConfigList = parseCompactList(
  'quiet,q/T|less log',
  'input-file,I/SP,O|common option',
  'output-file,O/SP,O|common option'
)
const ModuleFormatConfigList = parseCompactList(
  [ `file-upload-server-url,fusu/SS,O|${EXPLORER_CLIENT_DESC}`, parseCompactList(
    'file-upload-key/SS',
    'file-upload-path/SP'
  ) ],
  [ `file-download-server-url,fdsu/SS,O|${EXPLORER_CLIENT_DESC}`, parseCompactList(
    'file-download-key/SS',
    'file-download-path/SP'
  ) ],
  [ `path-action-server-url,pasu/SS,O|${EXPLORER_CLIENT_DESC}`, parseCompactList(
    [ 'path-action-type', pickOneOf(Object.values({ ...ACTION_TYPE_PATH, ...ACTION_TYPE_PATH_EXTRA_ARCHIVE })) ],
    'path-action-key/SS,O',
    'path-action-key-to/SS,O',
    'path-action-name-list/AS,O'
  ) ],

  `websocket-tunnel-server-url,wtsu/SS,O|${EXPLORER_CLIENT_DESC}, and "websocket-tunnel-host"`,

  [ 'auth-gen-tag,agt/SS,O|generate auth file: -O=outputFile', parseCompactList(
    'auth-gen-size/SI,O',
    'auth-gen-token-size/SI,O',
    'auth-gen-time-gap/SI,O',
    'auth-gen-info/O/1'
  ) ],
  'auth-file-describe,afd/T|describe auth file: -I=authFile',
  'auth-check-code-generate,accg/AI,O/0-1|generate checkCode from auth file: -I=authFile, $0=timestamp/now',
  'auth-check-code-verify,accv/AS,O/1-2|verify checkCode with auth file: -I=authFile, $@=checkCode,timestamp/now',

  'file-list,ls/AP,O/0-1|list file: $0=path/cwd',
  'file-list-all,ls-R,lla/AP,O/0-1|list all file: $0=path/cwd',
  'file-tree,tree/AP,O/0-1|list all file in tree: $0=path/cwd',

  'compress,a/T|compress tar/zip/7z/fsp: -I=inputDirectory, -O=outputFile',
  'extract,x/T|extract tar/zip/7z/fsp: -I=inputFile, -O=outputPath',

  'git-branch,gb/T|print git branch',
  'git-commit-hash,gch/T|print git commit hash',

  // TODO: currently timeout can not change, all lock to 5sec
  'ping-race,pr/AS,O|tcp-ping list of url to find the fastest',
  'ping-stat,ps/AS,O|tcp-ping list of url and print result',

  'quick-server-explorer,qse/AS,O/0-2|start a no-auth explorer server, for LAN use mostly, caution with public ip: -I=rootPath/cwd, $@=hostname/127.0.0.1,port/auto'

  // TODO: 'batch-command,bc/AS,O/1-|run batch command use placeholder like {file} {F} {...F} {directory} {D} {...D}: $@=...commands'
)

const runModule = async (optionData, modeName, packageName, packageVersion) => {
  const { tryGet, getFirst, tryGetFirst } = optionData

  const argumentList = tryGet(modeName) || []
  const inputFile = tryGetFirst('input-file')
  const outputFile = tryGetFirst('output-file')

  let log
  if (!tryGet('quiet')) {
    const stepper = createStepper()
    log = (...args) => console.log(...args, `(+${time(stepper())})`)
  }

  const toBuffer = (value) => Buffer.isBuffer(value) ? value
    : isBasicObject(value) ? JSON.stringify(value, null, 2)
      : Buffer.from(value)
  const outputAuto = async (result) => outputFile
    ? fsAsync.writeFile(outputFile, toBuffer(result))
    : writeBufferToStreamAsync(process.stdout, toBuffer(result))

  const setupAuthFile = async () => configureAuthFile({ ...getAuthCommonOption(optionData), ...getAuthFileOption(optionData), log })

  switch (modeName) {
    case 'file-upload-server-url':
    case 'file-download-server-url':
    case 'path-action-server-url': {
      const { authFetch } = await setupAuthFile()
      switch (modeName) {
        case 'file-upload-server-url':
          return fileUpload({
            log, authFetch,
            urlFileUpload: argumentList[ 0 ],
            fileInputPath: getFirst('file-upload-path'),
            key: getFirst('file-upload-key')
          })
        case 'file-download-server-url':
          return fileDownload({
            log, authFetch,
            urlFileDownload: argumentList[ 0 ],
            fileOutputPath: getFirst('file-download-path'),
            key: getFirst('file-download-key')
          })
        case 'path-action-server-url':
          return outputAuto(await actionJson({
            log, authFetch,
            urlActionJSON: argumentList[ 0 ],
            actionType: getFirst('path-action-type'),
            actionPayload: {
              key: tryGetFirst('path-action-key'),
              keyTo: tryGetFirst('path-action-key-to'),
              batchList: tryGet('path-action-batch-list')
            }
          }))
      }
      break
    }

    case 'websocket-tunnel-server-url': {
      const { authKey, generateAuthCheckCode } = await setupAuthFile()
      const serverExot = setupClientWebSocketTunnel({
        log, authKey, generateAuthCheckCode, // from `module/Auth`
        url: argumentList[ 0 ],
        webSocketTunnelHost: getFirst('websocket-tunnel-host'), // hostname:port
        headers: { 'user-agent': `${packageName}@${packageVersion}` }
      })
      setupPackageSIGUSR2(packageName, packageVersion)
      return runServerExotGroup({ serverExot })
    }

    case 'auth-gen-tag':
      await generateAuthFile(outputFile, {
        tag: argumentList[ 0 ],
        size: tryGetFirst('auth-gen-size'),
        tokenSize: tryGetFirst('auth-gen-token-size'),
        timeGap: tryGetFirst('auth-gen-time-gap'),
        info: tryGetFirst('auth-gen-info')
      })
      return log(await describeAuthFile(outputFile))
    case 'auth-file-describe':
      return outputAuto(await describeAuthFile(inputFile))
    case 'auth-check-code-generate':
      return outputAuto(await generateAuthCheckCode(inputFile, argumentList[ 0 ])) // timestamp
    case 'auth-check-code-verify':
      await verifyAuthCheckCode(inputFile, argumentList[ 0 ], argumentList[ 1 ] && Number(argumentList[ 1 ])) // checkCode, timestamp
      return outputAuto('pass verify')

    case 'file-list':
    case 'file-list-all':
    case 'file-tree':
      return outputAuto(await collectFile(modeName, argumentList[ 0 ] || process.cwd()))

    case 'compress':
      return compressAutoAsync(inputFile, outputFile)
    case 'extract':
      return extractAutoAsync(inputFile, outputFile)

    case 'git-branch':
      detectGit()
      return outputAuto(getGitBranch())
    case 'git-commit-hash':
      detectGit()
      return outputAuto(getGitCommitHash())

    case 'ping-race':
      return outputAuto(await pingRaceUrlList(argumentList))
    case 'ping-stat':
      return outputAuto(await pingStatUrlList(argumentList))

    case 'quick-server-explorer': {
      const [ hostname = '127.0.0.1', port ] = argumentList
      return runQuickSampleExplorerServer({
        rootPath: inputFile || process.cwd(),
        hostname,
        port: port && Number(port)
      })
    }
  }
}

const prettyStringifyFileTree = async (rootPath) => {
  const { dirInfoListMap } = await getDirInfoTree(rootPath)
  const resultList = []
  prettyStringifyTreeNode(
    ([ [ path ], level /* , hasMore */ ]) => dirInfoListMap[ path ] && dirInfoListMap[ path ].map(
      ({ name, path: subPath }, subIndex, { length }) => [ [ subPath, name ], level + 1, subIndex !== length - 1 ]
    ),
    [ [ rootPath, 'NAME' ], -1, false ],
    (prefix, [ , name ]) => resultList.push(`${prefix}${name}`)
  )
  return resultList.join('\n')
}

const collectFile = async (modeName, rootPath) => modeName === 'file-list' ? (await getDirInfoList(rootPath)).map(({ type, name }) => type === PATH_TYPE.Directory ? `${name}/` : name)
  : modeName === 'file-list-all' ? getFileList(rootPath)
    : modeName === 'file-tree' ? prettyStringifyFileTree(rootPath)
      : ''

export { CommonFormatConfigList, ModuleFormatConfigList, runModule }
