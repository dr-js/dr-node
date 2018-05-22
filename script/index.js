import { resolve } from 'path'
import { execSync } from 'child_process'

import { argvFlag, runMain } from 'dev-dep-tool/library/__utils__'
import { getLogger } from 'dev-dep-tool/library/logger'
import { wrapFileProcessor, fileProcessorBabel } from 'dev-dep-tool/library/fileProcessor'
import { initOutput, packOutput, publishOutput } from 'dev-dep-tool/library/commonOutput'
import { getUglifyESOption, minifyFileListWithUglifyEs } from 'dev-dep-tool/library/uglify'

import { binary as formatBinary } from 'dr-js/module/common/format'
import { getFileList } from 'dr-js/module/node/file/Directory'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore' ] : 'inherit', shell: true }

const filterScriptFile = (path) => path.endsWith('.js') && !path.endsWith('.test.js')

const processOutput = async ({ packageJSON, logger }) => {
  const { padLog, stepLog } = logger

  padLog(`minify output`)

  stepLog(`minify library`)
  await minifyFileListWithUglifyEs({
    fileList: (await getFileList(fromOutput('library'))).filter(filterScriptFile),
    option: getUglifyESOption({ isDevelopment: false, isModule: false }),
    rootPath: PATH_OUTPUT,
    logger
  })

  stepLog(`minify module`)
  await minifyFileListWithUglifyEs({
    fileList: (await getFileList(fromOutput('module'))).filter(filterScriptFile),
    option: getUglifyESOption({ isDevelopment: false, isModule: true }),
    rootPath: PATH_OUTPUT,
    logger
  })

  stepLog(`minify sample`)
  await minifyFileListWithUglifyEs({
    fileList: (await getFileList(fromOutput('sample'))).filter(filterScriptFile),
    option: getUglifyESOption({ isDevelopment: false, isModule: true }),
    rootPath: PATH_OUTPUT,
    logger
  })

  padLog(`process output`)
  const processBabel = wrapFileProcessor({ processor: fileProcessorBabel, logger })
  let sizeCodeReduce = 0
  const outputFilePathList = (await getFileList(fromOutput())).filter(filterScriptFile)
  for (const filePath of outputFilePathList) sizeCodeReduce += await processBabel(filePath)
  stepLog(`output size reduce: ${formatBinary(sizeCodeReduce)}B`)
}

runMain(async (logger) => {
  const { padLog, stepLog } = logger

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  padLog(`generate spec`)
  execSync('npm run script-generate-spec', execOptionRoot)

  if (!argvFlag('pack')) return

  padLog(`build`)
  stepLog(`build library`)
  execSync('npm run build-library', execOptionRoot)
  stepLog(`build module`)
  execSync('npm run build-module', execOptionRoot)
  stepLog(`build sample`)
  execSync('npm run build-sample', execOptionRoot)

  await processOutput({ packageJSON, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
