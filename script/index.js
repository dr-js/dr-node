import { resolve } from 'path'
import { execSync } from 'child_process'

import { argvFlag, runMain } from 'dr-dev/module/main'
import { getLogger } from 'dr-dev/module/logger'
import { getScriptFileListFromPathList } from 'dr-dev/module/fileList'
import { initOutput, verifyOutputBinVersion, packOutput, publishOutput } from 'dr-dev/module/commonOutput'
import { processFileList, fileProcessorBabel } from 'dr-dev/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dr-dev/module/minify'

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
  logger.padLog(`generate spec`)
  execSync('npm run script-generate-spec', execOptionRoot)

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  if (!argvFlag('pack')) return

  await buildOutput({ logger })
  await processOutput({ packageJSON, logger })

  await verifyOutputBinVersion({ fromOutput, packageJSON, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
