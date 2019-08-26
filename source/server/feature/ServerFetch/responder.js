import { binary } from '@dr-js/core/module/common/format'

import { parseBufferPacket, packBufferPacket } from '@dr-js/core/module/node/data/BufferPacket'
import { responderSendBufferCompress } from '@dr-js/core/module/node/server/Responder/Send'
import { fetchLikeRequest } from '@dr-js/core/module/node/net'

const responderServerFetch = async (store) => {
  const [ headerString, requestBodyBuffer ] = parseBufferPacket(await store.requestBuffer())
  const { url, option = {} } = JSON.parse(headerString)
  __DEV__ && console.log(`   - [ResponderServerFetch] url: ${url}, method: ${option.method}, request-body: ${binary(requestBodyBuffer.length)}B`)

  const { status, headers, buffer } = await fetchLikeRequest(url, { ...option, body: requestBodyBuffer })
  const responseBodyBuffer = await buffer()
  __DEV__ && console.log(`   - [ResponderServerFetch] url: ${url}, status: ${status}, response-body: ${binary(responseBodyBuffer.length)}B`)

  return responderSendBufferCompress(store, { buffer: packBufferPacket(JSON.stringify({ status, headers }), responseBodyBuffer) })
}

export { responderServerFetch }
