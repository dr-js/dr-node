import { createGzip } from 'zlib'
import { createReadStream, createWriteStream, promises as fsAsync } from 'fs'
import { quickRunletFromStream } from '@dr-js/core/module/node/data/Stream'
import { existPath } from '@dr-js/core/module/node/file/Path'

const compressFile = (
  inputFile,
  outputFile,
  compressStream = createGzip()
) => quickRunletFromStream(
  createReadStream(inputFile),
  compressStream,
  createWriteStream(outputFile)
)

const compressFileList = async ({
  fileList,
  fileSuffix = '.gz',
  createCompressStream = createGzip,
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

const checkBloat = async (inputFile, outputFile, bloatRatio) => {
  const { size: inputSize } = await fsAsync.stat(inputFile)
  const { size: outputSize } = await fsAsync.stat(outputFile)
  return (outputSize * bloatRatio) >= inputSize
}

// the `0x1f8b08` check for: containing a magic number (1f 8b), the compression method (08 for DEFLATE)
// https://en.wikipedia.org/wiki/Gzip
// https://github.com/kevva/is-gzip
// https://stackoverflow.com/questions/6059302/how-to-check-if-a-file-is-gzip-compressed
const isBufferGzip = (buffer) => (
  buffer && buffer.length > 3 &&
  buffer[ 0 ] === 0x1f &&
  buffer[ 1 ] === 0x8b &&
  buffer[ 2 ] === 0x08
)
const isFileGzip = async (file) => {
  const buffer = Buffer.allocUnsafe(3)
  await fsAsync.read(file, buffer, 0, 3, 0)
  return isBufferGzip(buffer)
}

export {
  compressFile,
  compressFileList,
  checkBloat,
  isBufferGzip, isFileGzip
}
