import { resolve } from 'path'
import { execSync } from 'child_process'

import { getScriptFileListFromPathList } from '@dr-js/dev/module/node/file'
import { initOutput, verifyNoGitignore, verifyGitStatusClean, verifyOutputBin, packOutput, publishOutput } from '@dr-js/dev/module/output'
import { getTerserOption, minifyFileListWithTerser } from '@dr-js/dev/module/minify'
import { processFileList, fileProcessorBabel } from '@dr-js/dev/module/fileProcessor'
import { runMain, argvFlag } from '@dr-js/dev/module/main'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execShell = (command) => execSync(command, { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit' })

const buildOutput = async ({ logger }) => {
  logger.padLog('generate spec')
  execShell('npm run script-generate-spec')
  logger.padLog('build bin')
  execShell('npm run build-bin')
  logger.padLog('build library')
  execShell('npm run build-library')
  logger.padLog('build module')
  execShell('npm run build-module')
}

const processOutput = async ({ logger }) => {
  const fileListLibraryBin = await getScriptFileListFromPathList([ 'library', 'bin' ], fromOutput)
  const fileListModuleSample = await getScriptFileListFromPathList([ 'module' ], fromOutput)
  const fileListAll = [ ...fileListLibraryBin, ...fileListModuleSample ]
  let sizeReduce = 0
  sizeReduce += await minifyFileListWithTerser({ fileList: fileListLibraryBin, option: getTerserOption(), rootPath: PATH_OUTPUT, logger })
  sizeReduce += await minifyFileListWithTerser({ fileList: fileListModuleSample, option: getTerserOption({ isReadable: true }), rootPath: PATH_OUTPUT, logger })
  sizeReduce += await processFileList({ fileList: fileListAll, processor: fileProcessorBabel, rootPath: PATH_OUTPUT, logger })
  logger.padLog(`total size reduce: ${sizeReduce}B`)
}

runMain(async (logger) => {
  await verifyNoGitignore({ path: fromRoot('source'), logger })
  await verifyNoGitignore({ path: fromRoot('source-bin'), logger })
  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })
  if (!argvFlag('pack')) return
  await buildOutput({ logger })
  await processOutput({ logger })
  if (argvFlag('test', 'publish', 'publish-dev')) {
    logger.padLog('lint source')
    execShell('npm run lint')
    await processOutput({ logger }) // once more
    logger.padLog('test test-server')
    execShell('npm run test-server')
  }
  await verifyOutputBin({ fromOutput, packageJSON, logger })
  await verifyGitStatusClean({ fromRoot, logger })
  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
})
