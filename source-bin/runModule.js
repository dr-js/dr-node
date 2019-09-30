import { Preset } from '@dr-js/core/module/node/module/Option/preset'

import { time } from '@dr-js/core/module/common/format'
import { createStepper } from '@dr-js/core/module/common/time'
import { isBasicObject } from '@dr-js/core/module/common/check'
import { prettyStringifyTree } from '@dr-js/core/module/common/data/Tree'

import { pipeStreamAsync, bufferToReadableStream } from '@dr-js/core/module/node/data/Stream'
import { writeFileAsync } from '@dr-js/core/module/node/file/function'
import { getFileList, getDirectorySubInfoList, getDirectoryInfoTree } from '@dr-js/core/module/node/file/Directory'
import { runSync } from '@dr-js/core/module/node/system/Run'

import { describeAuthFile, generateAuthFile, generateAuthCheckCode, verifyAuthCheckCode, configureAuthFile } from '@dr-js/node/module/module/Auth'
import { PATH_ACTION_TYPE } from '@dr-js/node/module/module/PathAction'

import { detect as detect7z, compressConfig as compressConfig7z, extractConfig as extractConfig7z } from '@dr-js/node/module/module/Software/7z'
import { detect as detectTar, compressConfig as compressConfigTar, extractConfig as extractConfigTar } from '@dr-js/node/module/module/Software/tar'
import { detect as detectGit, getGitBranch, getGitCommitHash } from '@dr-js/node/module/module/Software/git'

import { getAuthFileOption } from '@dr-js/node/module/server/feature/Auth/option'
import { fileUpload, fileDownload, pathAction } from '@dr-js/node/module/server/feature/Explorer/client'

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
    [ 'path-action-type', pickOneOf(Object.values(PATH_ACTION_TYPE)) ],
    'path-action-key/SS,O',
    'path-action-key-to/SS,O',
    'path-action-name-list/AS,O'
  ) ],

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

  'compress-7z,c7z/SP,O|compress with 7zip: -O=outputFile, $0=inputDirectory',
  'extract-7z,e7z/SP,O|extract with 7zip: -I=inputFile, $0=outputDirectory',

  'compress-tar,ctar/SP,O|compress with tar: -O=outputFile, $0=inputDirectory',
  'extract-tar,etar/SP,O|extract with tar: -I=inputFile, $0=outputDirectory',

  'git-branch,gb/T|print git branch',
  'git-commit-hash,gch/T|print git commit hash'

  // TODO: 'batch-command,bc/AS,O/1-|run batch command use placeholder like {file} {F} {...F} {directory} {D} {...D}: $@=...commands'
)

const runModule = async (optionData, modeName) => {
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
    ? writeFileAsync(outputFile, toBuffer(result))
    : pipeStreamAsync(process.stdout, bufferToReadableStream(toBuffer(result)))

  switch (modeName) {
    case 'file-upload-server-url':
    case 'file-download-server-url':
    case 'path-action-server-url': {
      const { authFetch } = await configureAuthFile({ ...getAuthFileOption(optionData), log })
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
          return outputAuto(await pathAction({
            log, authFetch,
            urlPathAction: argumentList[ 0 ],
            nameList: tryGet('path-action-name-list'),
            actionType: getFirst('path-action-type'),
            key: tryGetFirst('path-action-key'),
            keyTo: tryGetFirst('path-action-key-to')
          }))
      }
      break
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

    case 'compress-7z':
      detect7z()
      return runSync(compressConfig7z(argumentList[ 0 ], outputFile))
    case 'extract-7z':
      detect7z()
      return runSync(extractConfig7z(inputFile, argumentList[ 0 ]))

    case 'compress-tar':
      detectTar()
      return runSync(compressConfigTar(argumentList[ 0 ], outputFile))
    case 'extract-tar':
      detectTar()
      return runSync(extractConfigTar(inputFile, argumentList[ 0 ]))

    case 'git-branch':
      detectGit()
      return outputAuto(getGitBranch())
    case 'git-commit-hash':
      detectGit()
      return outputAuto(getGitCommitHash())
  }
}

const prettyStringifyFileTree = async (rootPath) => {
  const { subInfoListMap } = await getDirectoryInfoTree(rootPath)
  const resultList = []
  prettyStringifyTree(
    [ [ rootPath, 'NAME' ], -1, false ],
    ([ [ path ], level /* , hasMore */ ]) => subInfoListMap[ path ] && subInfoListMap[ path ].map(
      ({ path: subPath, name }, subIndex, { length }) => [ [ subPath, name ], level + 1, subIndex !== length - 1 ]
    ),
    (prefix, [ , name ]) => resultList.push(`${prefix}${name}`)
  )
  return resultList.join('\n')
}

const collectFile = async (modeName, rootPath) => modeName === 'file-list' ? (await getDirectorySubInfoList(rootPath)).map(({ name, stat }) => stat.isDirectory() ? `${name}/` : name)
  : modeName === 'file-list-all' ? getFileList(rootPath)
    : modeName === 'file-tree' ? prettyStringifyFileTree(rootPath)
      : ''

export { CommonFormatConfigList, ModuleFormatConfigList, runModule }
