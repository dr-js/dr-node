import { responderSendBufferCompress } from 'dr-js/module/node/server/Responder/Send'
import { prepareBufferDataPNG } from './function'

const createResponderFavicon = async () => {
  const bufferData = await prepareBufferDataPNG(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEVjrv/wbTZJAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==', 'base64'))
  return (store) => responderSendBufferCompress(store, bufferData)
}

const createRouteGetFavicon = async () => [ [ '/favicon.ico', '/favicon' ], 'GET', await createResponderFavicon() ]

export {
  createResponderFavicon,
  createRouteGetFavicon
}
