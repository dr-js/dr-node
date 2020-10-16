import { createConnection } from 'net'
import { createInsideOutPromise } from '@dr-js/core/module/common/function'
import { WEBSOCKET_EVENT } from '@dr-js/core/module/node/server/WebSocket/function'

import { parseHostString } from 'source/module/ServerExot'

// TODO: under DEV

const setupTunnel = async ({
  webSocket,
  webSocketTunnelHost,
  loggerExot,
  log = loggerExot && loggerExot.add
}) => {
  // setup tcp tunnel socket
  const { hostname, port } = parseHostString(webSocketTunnelHost, '127.0.0.1')
  const { promise, resolve, reject } = createInsideOutPromise()
  const socket = createConnection(port, hostname, resolve)
  socket.on('error', reject)
  await promise
  socket.off('error', reject)

  // TODO: redo with Runlet

  const cleanup = () => {
    webSocket.close()
    socket.destroy()
    socket.off('error', cleanup)
    socket.off('close', cleanup)
    socket.off('end', cleanup)
    socket.on('error', () => {})
  }
  socket.on('error', cleanup)
  socket.on('close', cleanup)
  socket.on('end', cleanup)
  socket.on('data', (buffer) => { webSocket.isOpen() && webSocket.sendBuffer(buffer) })

  // since this is before WebSocket OPEN, should not have pending data server side
  webSocket.on(WEBSOCKET_EVENT.CLOSE, cleanup)
  // webSocket.on(WEBSOCKET_EVENT.OPEN, () => { log && log('  - websocket open') })
  webSocket.on(WEBSOCKET_EVENT.FRAME, async ({ dataBuffer }) => { socket.writable && socket.write(dataBuffer) })
}

const setup = async ({
  name = 'feature:websocket-tunnel',
  loggerExot, routePrefix = '',
  featureAuth: { createResponderCheckAuth },
  webSocketTunnelHost, // hostname:port
  URL_WEBSOCKET_TUNNEL = `${routePrefix}/websocket-tunnel`
}) => {
  const webSocketRouteList = [
    [ URL_WEBSOCKET_TUNNEL, 'GET', createResponderCheckAuth({
      responderNext: async (store) => {
        const { webSocket } = store
        await setupTunnel({ webSocket, webSocketTunnelHost, loggerExot })
        store.setState({ protocol: webSocket.protocolList[ 0 ] }) // set protocol to allow upgrade and keep socket
      }
    }) ]
  ]

  return {
    URL_WEBSOCKET_TUNNEL,
    webSocketRouteList,
    name
  }
}

export { setup }
