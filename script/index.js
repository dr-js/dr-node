import { resolve } from 'path'
import { execSync } from 'child_process'

import { getScriptFileListFromPathList } from 'dr-dev/module/node/fileList'
import { runMain, argvFlag } from 'dr-dev/module/main'
import { initOutput, verifyOutputBinVersion, verifyNoGitignore, packOutput, publishOutput } from 'dr-dev/module/output'
import { processFileList, fileProcessorBabel } from 'dr-dev/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dr-dev/module/minify'
import { writeLicenseFile } from 'dr-dev/module/license'

import { binary as formatBinary } from 'dr-js/module/common/format'

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

  padLog(`build sample`)
  execSync('npm run build-sample', execOptionRoot)
}

const processOutput = async ({ packageJSON, logger }) => {
  const fileListLibraryBin = await getScriptFileListFromPathList([ 'library', 'bin' ], fromOutput)
  const fileListModuleSample = await getScriptFileListFromPathList([ 'module', 'sample' ], fromOutput)
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
  await verifyNoGitignore({ path: fromRoot('source-sample'), logger })

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })
  writeLicenseFile(fromRoot('LICENSE'), packageJSON.license, packageJSON.author)

  logger.padLog(`generate spec`)
  execSync('npm run script-generate-spec', execOptionRoot)

  if (!argvFlag('pack')) return

  await buildOutput({ logger })
  await processOutput({ packageJSON, logger })

  if (argvFlag('test', 'publish', 'publish-dev')) {
    await processOutput({ packageJSON, logger }) // once more

    logger.padLog(`test test-server`)
    execSync(`npm run test-server`, execOptionRoot)
  }

  await verifyOutputBinVersion({ fromOutput, packageJSON, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
})
