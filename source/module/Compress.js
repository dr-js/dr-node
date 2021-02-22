import { createReadStream, createWriteStream, promises as fsAsync } from 'fs'
import { quickRunletFromStream } from '@dr-js/core/module/node/data/Stream'
import { existPath } from '@dr-js/core/module/node/file/Path'
import { isBufferGzip, isFileGzip, createGzipMax } from './Software/function'

const compressFile = ( // TODO: DEPRECATE
  inputFile,
  outputFile,
  compressStream = createGzipMax()
) => quickRunletFromStream(
  createReadStream(inputFile),
  compressStream,
  createWriteStream(outputFile)
)
const compressFileList = async ({ // TODO: DEPRECATE
  fileList,
  fileSuffix = '.gz',
  createCompressStream = createGzipMax,
  deleteBloat = false,
  keepExist = false,
  bloatRatio = 1 // expect value >= 1, like 1.10
}) => {
  for (const filePath of fileList) {
    if (filePath.endsWith(fileSuffix)) continue
    __DEV__ && console.log('[compressFileList]', filePath)
    const compressFilePath = `${filePath}${fileSuffix}`
    if (!keepExist || !await existPath(compressFilePath)) await compressFile(filePath, compressFilePath, createCompressStream()) // NOTE: do not re-compress existing file, if `keepExist` is set, careful since old gz may keep the wrong content
    deleteBloat && await checkBloat(filePath, compressFilePath, bloatRatio) && await fsAsync.unlink(compressFilePath)
  }
}
const checkBloat = async (inputFile, outputFile, bloatRatio) => { // TODO: DEPRECATE
  const { size: inputSize } = await fsAsync.stat(inputFile)
  const { size: outputSize } = await fsAsync.stat(outputFile)
  return (outputSize * bloatRatio) >= inputSize
}

export {
  isBufferGzip, isFileGzip, compressFile, compressFileList, checkBloat // TODO: DEPRECATE
}
