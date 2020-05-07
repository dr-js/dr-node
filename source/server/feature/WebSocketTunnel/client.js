import { WEBSOCKET_EVENT } from '@dr-js/core/module/node/server/WebSocket/function'
import { createWebSocketClient } from '@dr-js/core/module/node/server/WebSocket/WebSocketClient'
import { createServerPack } from '@dr-js/core/module/node/server/Server'

import { parseHostString } from 'source/module/ServerPack'
import { packWebSocketProtocolListParam } from 'source/module/RequestCommon'

// TODO: add Permission support
// TODO: change to multi socket on single WS to reduce WS count

const setupClientWebSocketTunnel = ({
  url, // like: 'wss://127.0.0.1:3000/websocket-tunnel'
  webSocketTunnelHost, // hostname:port
  authKey, generateAuthCheckCode, // from `module/Auth`
  headers,
  log
}) => {
  log && log(`[ClientWebSocketTunnel] url: ${url}, webSocketTunnelHost: ${webSocketTunnelHost}`)

  // setup tcp tunnel server
  const { hostname, port } = parseHostString(webSocketTunnelHost, '127.0.0.1')
  const serverPack = createServerPack({ protocol: 'tcp:', hostname, port })

  serverPack.server.on('connection', async (socket) => {
    log && log(`- tcp connection (${serverPack.socketSet.size} total)`)

    let tunnelWebSocket
    const pendingBuffer = []
    const cleanup = () => {
      // log && log('- cleanup')
      // console.log(new Error().stack)
      tunnelWebSocket && tunnelWebSocket.close()
      tunnelWebSocket = undefined
      socket.destroy()
      socket.off('error', cleanup)
      socket.off('close', cleanup)
      socket.off('end', cleanup)
      socket.on('error', () => {})
    }
    socket.on('error', cleanup)
    socket.on('close', cleanup)
    socket.on('end', cleanup)
    socket.on('data', (buffer) => {
      // log && log(`  - socket data ${buffer.length} | ${tunnelWebSocket}`)
      if (tunnelWebSocket === undefined) pendingBuffer.push(buffer)
      else tunnelWebSocket.isOpen() && tunnelWebSocket.sendBuffer(buffer)
    })
    createWebSocketClient({
      url,
      option: {
        headers, // TODO: NOTE: can also just send auth code in header, though in browser there's no API to set header
        requestProtocolString: [ 'websocket-tunnel', packWebSocketProtocolListParam(authKey, await generateAuthCheckCode()) ].join(',')
      },
      onUpgradeResponse: (webSocket, response, bodyHeadBuffer) => {
        webSocket.on(WEBSOCKET_EVENT.CLOSE, cleanup)
        webSocket.on(WEBSOCKET_EVENT.OPEN, () => {
          log && log('  - websocket open')
          tunnelWebSocket = webSocket
          pendingBuffer.length !== 0 && tunnelWebSocket.sendBuffer(Buffer.concat(pendingBuffer)) // flush pending buffer
          pendingBuffer.length = 0
        })
        webSocket.on(WEBSOCKET_EVENT.FRAME, async ({ dataBuffer }) => {
          // log && log(`  - websocket frame ${dataBuffer.length} | ${socket.writable}`)
          socket.writable && socket.write(dataBuffer)
        })
      }, // return webSocket.doCloseSocket() // can just close here
      onError: (error) => { log && log(`[ClientWebSocketTunnel|Error] ${error.stack || error}`) }
    })
  })

  return serverPack
}

export { setupClientWebSocketTunnel }
