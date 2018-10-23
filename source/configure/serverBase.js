import { createServer } from 'dr-js/module/node/server/Server'
import { readFileAsync } from 'dr-js/module/node/file/function'

const loadFile = (filePath) => filePath ? readFileAsync(filePath) : null

const configureServerBase = async ({
  protocol = 'http:',
  hostname = 'localhost',
  port,
  fileSSLKey,
  fileSSLCert,
  fileSSLChain,
  fileSSLDHParam, // Diffie-Hellman Key Exchange
  extraHostContextList = [] // [ [ 'hostname', { key, cert, ca, dhparam, .. or other SSL option } ] ]
}) => {
  const isHttps = protocol === 'https:'
  const server = createServer({
    protocol,
    hostname,
    port,
    key: await loadFile(isHttps && fileSSLKey),
    cert: await loadFile(isHttps && fileSSLCert),
    ca: await loadFile(isHttps && fileSSLChain),
    dhparam: await loadFile(isHttps && fileSSLDHParam)
  })

  // for multi HTTPS host server, check:
  //   https://en.wikipedia.org/wiki/Server_Name_Indication
  //   https://nodejs.org/api/tls.html#tls_server_addcontext_hostname_context
  extraHostContextList.length && extraHostContextList.forEach(([ hostname, contextOption ]) => isHttps
    ? server.addContext(hostname, contextOption)
    : console.warn(`[ServerBase] non-HTTPS server, skipped SNI secure context: ${hostname}`)
  )
  return server
}

export { configureServerBase }
