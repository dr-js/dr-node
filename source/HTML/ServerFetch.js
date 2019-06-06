import { binary } from 'dr-js/module/common/format'

import { parseBufferPacket, packBufferPacket } from 'dr-js/module/node/data/BufferPacket'
import { responderSendBufferCompress } from 'dr-js/module/node/server/Responder/Send'
import { fetchLikeRequest } from 'dr-js/module/node/net'

const responderServerFetch = async (store) => {
  const [ headerString, requestBodyBuffer ] = parseBufferPacket(await store.requestBuffer())
  const { url, option = {} } = JSON.parse(headerString)
  __DEV__ && console.log(`   - [ResponderServerFetch] url: ${url}, method: ${option.method}, request-body: ${binary(requestBodyBuffer.length)}B`)

  const { status, headers, buffer } = await fetchLikeRequest(url, { ...option, body: requestBodyBuffer })
  const responseBodyBuffer = await buffer()
  __DEV__ && console.log(`   - [ResponderServerFetch] url: ${url}, status: ${status}, response-body: ${binary(responseBodyBuffer.length)}B`)

  return responderSendBufferCompress(store, { buffer: packBufferPacket(JSON.stringify({ status, headers }), responseBodyBuffer) })
}

const initServerFetch = ({
  urlServerFetch,
  fetch = window.fetch // or use authFetch, fetchLikeRequest
}) => {
  const {
    Blob,
    Dr: {
      Browser: {
        Data: {
          Blob: { parseBlobAsArrayBuffer, parseBlobAsText },
          BlobPacket: { packBlobPacket, parseBlobPacket }
        }
      }
    }
  } = window

  const toBodyBlob = (body) => (body === undefined || body instanceof Blob)
    ? body
    : new Blob([ body ])

  const fetchBlobCORS = async (url, { body, ...option } = {}) => {
    const response = await fetch(urlServerFetch, {
      method: 'POST',
      body: packBlobPacket(
        JSON.stringify({ url, option }),
        toBodyBlob(body)
      )
    })
    const [ headerString, payloadBlob ] = await parseBlobPacket(await response.blob())
    const { status, headers } = JSON.parse(headerString)
    const text = () => parseBlobAsText(payloadBlob)
    return { // like fetch
      status,
      ok: (status >= 200 && status < 300),
      headers,
      arrayBuffer: () => parseBlobAsArrayBuffer(payloadBlob),
      blob: () => payloadBlob,
      text,
      json: async () => JSON.parse(await text())
    }
  }

  return { fetchBlobCORS }
}

export {
  responderServerFetch,
  initServerFetch
}
