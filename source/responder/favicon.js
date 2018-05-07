import { BASIC_EXTENSION_MAP } from 'dr-js/module/common/module/MIME'
import { responderSendBuffer } from 'dr-js/module/node/server/Responder/Send'

const BUFFER_DATA_FAVICON_PNG = {
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEVjrv/wbTZJAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==', 'base64'),
  type: BASIC_EXTENSION_MAP.png
}

const responderFavicon = (store) => responderSendBuffer(store, BUFFER_DATA_FAVICON_PNG)

const routeGetFavicon = [ [ '/favicon.ico', '/favicon' ], 'GET', responderFavicon ]

export {
  responderFavicon,
  routeGetFavicon
}
