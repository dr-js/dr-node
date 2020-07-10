import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompact } = Preset

// TODO: under DEV

const WebSocketTunnelFormatConfig = parseCompact('websocket-tunnel-host/SS,O|[under DEV] use format: "hostname:port", default hostname: 127.0.0.1')
const getWebSocketTunnelOption = ({ tryGetFirst }) => ({
  webSocketTunnelHost: tryGetFirst('websocket-tunnel-host')
})

export { WebSocketTunnelFormatConfig, getWebSocketTunnelOption }
