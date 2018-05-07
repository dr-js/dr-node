import { createServer } from 'dr-js/module/node/server/Server'
import { readFileAsync } from 'dr-js/module/node/file/function'

const configureServerBase = async ({ protocol = 'http:', hostname = 'localhost', port, fileSSLKey, fileSSLCert, fileSSLChain, fileSSLDHParam }) => {
  const isHttps = protocol === 'https:'
  return createServer({
    protocol,
    hostname,
    port,
    key: isHttps && fileSSLKey ? await readFileAsync(fileSSLKey) : null,
    cert: isHttps && fileSSLCert ? await readFileAsync(fileSSLCert) : null,
    ca: isHttps && fileSSLChain ? await readFileAsync(fileSSLChain) : null,
    dhparam: isHttps && fileSSLDHParam ? await readFileAsync(fileSSLDHParam) : null // Diffie-Hellman Key Exchange
  })
}

export { configureServerBase }
