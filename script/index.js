import { resolve } from 'path'
import { execSync } from 'child_process'

import { argvFlag, runMain } from 'dev-dep-tool/library/main'
import { getLogger } from 'dev-dep-tool/library/logger'
import { getScriptFileListFromPathList } from 'dev-dep-tool/library/fileList'
import { initOutput, verifyOutputBinVersion, packOutput, publishOutput } from 'dev-dep-tool/library/commonOutput'
import { wrapFileProcessor, fileProcessorBabel } from 'dev-dep-tool/library/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dev-dep-tool/library/minify'

import { binary as formatBinary } from 'dr-js/module/common/format'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

const buildOutput = async ({ logger: { padLog, stepLog } }) => {
  padLog(`build`)

  stepLog(`build bin`)
  execSync('npm run build-bin', execOptionRoot)

  stepLog(`build library`)
  execSync('npm run build-library', execOptionRoot)

  stepLog(`build module`)
  execSync('npm run build-module', execOptionRoot)

  stepLog(`build sample`)
  execSync('npm run build-sample', execOptionRoot)
}

const processOutput = async ({ packageJSON, logger }) => {
  const { padLog, stepLog } = logger

  padLog(`minify output`)

  stepLog(`minify bin & library`)
  await minifyFileListWithTerser({
    fileList: await getScriptFileListFromPathList([ 'bin', 'library' ], fromOutput),
    option: getTerserOption(),
    rootPath: PATH_OUTPUT,
    logger
  })

  stepLog(`minify module & sample`)
  await minifyFileListWithTerser({
    fileList: await getScriptFileListFromPathList([ 'module', 'sample' ], fromOutput),
    option: getTerserOption({ isModule: true }),
    rootPath: PATH_OUTPUT,
    logger
  })

  padLog(`process output`)
  const processBabel = wrapFileProcessor({ processor: fileProcessorBabel, logger })
  let sizeCodeReduce = 0
  for (const filePath of await getScriptFileListFromPathList([ '.' ], fromOutput)) sizeCodeReduce += await processBabel(filePath)
  stepLog(`output size reduce: ${formatBinary(sizeCodeReduce)}B`)
}

runMain(async (logger) => {
  const { padLog } = logger

  padLog(`generate spec`)
  execSync('npm run script-generate-spec', execOptionRoot)

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  if (!argvFlag('pack')) return

  await buildOutput({ logger })
  await processOutput({ packageJSON, logger })

  await verifyOutputBinVersion({ fromOutput, packageJSON, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
