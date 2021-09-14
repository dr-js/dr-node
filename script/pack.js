import { runKit, argvFlag } from '@dr-js/core/module/node/kit.js'

import { getSourceJsFileListFromPathList } from '@dr-js/dev/module/node/filePreset.js'
import { initOutput, packOutput, clearOutput, verifyNoGitignore, verifyGitStatusClean, verifyOutputBin, publishPackage } from '@dr-js/dev/module/output.js'
import { getTerserOption, minifyFileListWithTerser } from '@dr-js/dev/module/minify.js'
import { processFileList, fileProcessorBabel } from '@dr-js/dev/module/fileProcessor.js'

runKit(async (kit) => {
  const processOutput = async () => {
    const fileListLibraryBin = await getSourceJsFileListFromPathList([ 'library', 'bin' ], kit.fromOutput)
    const fileListModuleSample = await getSourceJsFileListFromPathList([ 'module' ], kit.fromOutput)
    const fileListAll = [ ...fileListLibraryBin, ...fileListModuleSample ]
    let sizeReduce = 0
    sizeReduce += await minifyFileListWithTerser({ fileList: fileListLibraryBin, option: getTerserOption(), kit })
    sizeReduce += await minifyFileListWithTerser({ fileList: fileListModuleSample, option: getTerserOption({ isReadable: true }), kit })
    sizeReduce += await processFileList({ fileList: fileListAll, processor: fileProcessorBabel, kit })
    kit.padLog(`size reduce: ${sizeReduce}B`)
  }

  await verifyNoGitignore({ path: kit.fromRoot('source'), kit })
  await verifyNoGitignore({ path: kit.fromRoot('source-bin'), kit })
  const packageJSON = await initOutput({ kit })
  if (!argvFlag('pack')) return

  const isPublish = argvFlag('publish')
  kit.padLog('generate spec')
  kit.RUN('npm run script-generate-spec')
  kit.padLog('build bin')
  kit.RUN('npm run build-bin')
  kit.padLog('build library')
  kit.RUN('npm run build-library')
  kit.padLog('build module')
  kit.RUN('npm run build-module')

  await processOutput()
  const isTest = argvFlag('test', 'publish')
  isTest && kit.padLog('lint source')
  isTest && kit.RUN('npm run lint')
  isTest && await processOutput() // once more
  isTest && kit.padLog('test output')
  isTest && kit.RUN('npm run test-output-library')
  isTest && kit.RUN('npm run test-output-module')
  isTest && kit.padLog('test test-server')
  isTest && kit.RUN('npm run test-server')
  await clearOutput({ kit })
  await verifyOutputBin({ packageJSON, kit })
  isTest && await verifyGitStatusClean({ kit })
  const pathPackagePack = await packOutput({ kit })
  isPublish && await publishPackage({ packageJSON, pathPackagePack, kit })
})
