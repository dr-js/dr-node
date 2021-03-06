import { probeSync, createArgListPack } from './function'

// $ docker version --format "{{.Server.Version}}"
// Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get http://%2Fvar%2Frun%2Fdocker.sock/v1.24/version: dial unix /var/run/docker.sock: connect: permission denied
// $ sudo docker version --format '{{.Server.Version}}'
// 20.10.2

// test sudo prefix: docker version

// $ docker version
// Client: Docker Engine - Community
//  Version:           20.10.2
//  ...
// Server: Docker Engine - Community
//  Engine:
//   Version:          20.10.2
//   ...
// # GitHub Ubuntu:
// Server:
//  Engine:
//   Version:          19.03.13+azure
//   API version:      1.40 (minimum version 1.12)
// # GitHub Windows:
// Server: Mirantis Container Runtime
//  Engine:
//   Version:          19.03.13
//   API version:      1.40 (minimum version 1.24)
// # GitHub Macos: NO docker installed

const { getArgs, setArgs, check, verify } = createArgListPack(
  () => probeSync([ 'docker', 'version' ], 'Server:') ? [ 'docker' ]
    : probeSync([ 'sudo', 'docker', 'version' ], 'Server:') ? [ 'sudo', 'docker' ]
      : undefined,
  'expect "docker" in PATH, with server up'
)

const { getArgs: getArgsCompose, setArgs: setArgsCompose, check: checkCompose, verify: verifyCompose } = createArgListPack(
  () => {
    if (!check()) return undefined // expect docker command available
    const argsList = [ ...getArgs().slice(0, -1), 'docker-compose' ]
    if (probeSync([ ...argsList, 'version' ], 'docker-compose')) return argsList
  },
  'expect both "docker-compose" and "docker" in PATH, with server up'
)

export {
  getArgs, setArgs, check, verify,
  getArgsCompose, setArgsCompose, checkCompose, verifyCompose
}
