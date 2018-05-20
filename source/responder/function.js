import { gzip } from 'zlib'
import { promisify } from 'util'
import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { getEntityTagByContentHashAsync } from 'dr-js/module/node/module/EntityTag'

const gzipAsync = promisify(gzip)

const prepareBufferData = async (buffer, type) => ({
  type,
  buffer,
  bufferGzip: await gzipAsync(buffer),
  entityTag: await getEntityTagByContentHashAsync(buffer),
  length: buffer.length
})

const prepareBufferDataHTML = (buffer) => prepareBufferData(buffer, BASIC_EXTENSION_MAP.html)
const prepareBufferDataJSON = (buffer) => prepareBufferData(buffer, BASIC_EXTENSION_MAP.json)
const prepareBufferDataPNG = (buffer) => prepareBufferData(buffer, BASIC_EXTENSION_MAP.png)

export {
  prepareBufferData,
  prepareBufferDataHTML,
  prepareBufferDataJSON,
  prepareBufferDataPNG
}
