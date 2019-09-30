import { resolve } from 'path'
import { execSync } from 'child_process'

import { getScriptFileListFromPathList } from '@dr-js/dev/module/node/file'
import { runMain, argvFlag } from '@dr-js/dev/module/main'
import { initOutput, verifyOutputBinVersion, verifyNoGitignore, packOutput, publishOutput } from '@dr-js/dev/module/output'
import { processFileList, fileProcessorBabel } from '@dr-js/dev/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from '@dr-js/dev/module/minify'

import { binary as formatBinary } from '@dr-js/core/module/common/format'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

const buildOutput = async ({ logger: { padLog } }) => {
  padLog(`build bin`)
  execSync('npm run build-bin', execOptionRoot)

  padLog(`build library`)
  execSync('npm run build-library', execOptionRoot)

  padLog(`build module`)
  execSync('npm run build-module', execOptionRoot)
}

const processOutput = async ({ logger }) => {
  const fileListLibraryBin = await getScriptFileListFromPathList([ 'library', 'bin' ], fromOutput)
  const fileListModuleSample = await getScriptFileListFromPathList([ 'module' ], fromOutput)
  const fileListAll = [ ...fileListLibraryBin, ...fileListModuleSample ]

  let sizeReduce = 0

  sizeReduce += await minifyFileListWithTerser({ fileList: fileListLibraryBin, option: getTerserOption(), rootPath: PATH_OUTPUT, logger })
  sizeReduce += await minifyFileListWithTerser({ fileList: fileListModuleSample, option: getTerserOption({ isReadable: true }), rootPath: PATH_OUTPUT, logger })

  sizeReduce += await processFileList({ fileList: fileListAll, processor: fileProcessorBabel, rootPath: PATH_OUTPUT, logger })

  logger.padLog(`total size reduce: ${formatBinary(sizeReduce)}B`)
}

runMain(async (logger) => {
  await verifyNoGitignore({ path: fromRoot('source'), logger })
  await verifyNoGitignore({ path: fromRoot('source-bin'), logger })

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  logger.padLog(`generate spec`)
  execSync('npm run script-generate-spec', execOptionRoot)

  if (!argvFlag('pack')) return
  if (argvFlag('test', 'publish', 'publish-dev')) {
    logger.padLog(`lint source`)
    execSync(`npm run lint`, execOptionRoot)
  }

  await buildOutput({ logger })
  await processOutput({ logger })

  if (argvFlag('test', 'publish', 'publish-dev')) {
    await processOutput({ logger }) // once more

    logger.padLog(`test test-server`)
    execSync(`npm run test-server`, execOptionRoot)
  }

  await verifyOutputBinVersion({ fromOutput, packageJSON, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, isPublicScoped: true, packageJSON, pathPackagePack, logger })
})
