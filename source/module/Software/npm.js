import { resolve } from 'path'
import { statSync, realpathSync } from 'fs'
import { execFileSync, spawnSync } from 'child_process'
import { resolveCommandName } from '@dr-js/core/module/node/system/ResolveCommand'
import { tryRequireResolve } from '@dr-js/core/module/env/tryRequire'

const parsePackageNameAndVersion = (nameAndVersion) => {
  const nameAndVersionList = nameAndVersion.split('@')
  if (nameAndVersionList.length < 2) return []
  const version = nameAndVersionList.pop()
  const name = nameAndVersionList.join('@')
  if (!name || !version) return []
  return [ name, version ]
}

const findUpPackageRoot = (path = __dirname) => {
  path = resolve(path) // normalize
  let prevPath
  while (path !== prevPath) {
    if (tryRequireResolve(resolve(path, 'package.json'))) return path
    prevPath = path
    path = resolve(path, '..')
  }
}

// check: https://github.com/npm/cli/blob/v6.14.5/lib/pack.js#L67-L71
const toPackageTgzName = (name, version) => `${
  name[ 0 ] === '@' ? name.substr(1).replace(/\//g, '-') : name
}-${
  version
}.tgz`

// TODO: NOTE:
//   the location for npm itself and npm global install can be different normally, with `npm list -g --depth=0` we see npm it self get listed
//   but by changing `NPM_CONFIG_PREFIX` env we can move where npm put the global install and cache
//   so to borrow npm dependency package, we need to locate the npm executable
//   to borrow npm global package, we need the npm prefix path

// win32 has 2 copy of npm (global and bundled)
//   C:\Program Files\nodejs\npm.cmd <========================= npm executable, will try load prefix/global npm first
//   C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js
//   C:\Program Files\nodejs\node_modules\npm\node_modules <=== bundled npm, lower priority
//   C:\Program Files\nodejs\node_modules\npm\ <=============== path npm, lower priority
//   C:\Program Files\nodejs\node_modules\ <=================== NOT global install root
//   C:\Users\{USER-NAME}\AppData\Roaming\npm\npm.cmd <========================= npm executable, lower priority
//   C:\Users\{USER-NAME}\AppData\Roaming\npm\node_modules\npm\node_modules <=== borrow file
//   C:\Users\{USER-NAME}\AppData\Roaming\npm\node_modules\npm\ <=============== path npm
//   C:\Users\{USER-NAME}\AppData\Roaming\npm\node_modules\ <=================== global install root

// linux/darwin 1 copy normally (can change if prefix is changed)
//   /usr/lib/node_modules/npm/bin/npm-cli.js <== npm executable
//   /usr/lib/node_modules/npm/node_modules/ <=== borrow file
//   /usr/lib/node_modules/npm/ <================ path npm
//   /usr/lib/node_modules/ <==================== global install root

let cachePathNpmExecutable // npm executable (.js or .cmd)
const getPathNpmExecutable = () => {
  if (cachePathNpmExecutable === undefined) {
    const command = resolveCommandName('npm')
    cachePathNpmExecutable = command && realpathSync(command) // could be '' if npm is not found
  }
  return cachePathNpmExecutable
}

let cachePathNpmGlobalRoot // npm global package install path
const getPathNpmGlobalRoot = () => {
  if (cachePathNpmGlobalRoot === undefined) cachePathNpmGlobalRoot = getPathNpmExecutable() && String(execFileSync(getPathNpmExecutable(), [ 'root', '-g' ])).trim()
  return cachePathNpmGlobalRoot
}
const fromGlobalNodeModules = (...args) => resolve(getPathNpmGlobalRoot(), ...args) // should resolve to global installed package

let cachePathNpm // npm package path
const getPathNpm = () => {
  if (cachePathNpm === undefined) {
    { // npm help fast hack
      const npmHelpText = String(spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm').stdout).trim()
      const npmHelpLastLine = npmHelpText && npmHelpText.split('\n').pop() // should be: npm@{version} {npm-full-path}
      const npmFullPath = npmHelpLastLine && npmHelpLastLine.split(' ').pop()
      if (npmFullPath) cachePathNpm = npmFullPath
    }
    const tryPath = (pathFrom, relativeNpm) => {
      try {
        if (statSync(resolve(pathFrom, relativeNpm, './node_modules/libnpx/')).isDirectory()) cachePathNpm = resolve(pathFrom, relativeNpm)
      } catch (error) { __DEV__ && console.log(`tryPath failed: ${error}`) }
    }
    !cachePathNpm && getPathNpmExecutable().endsWith('npm-cli.js') && tryPath(getPathNpmExecutable(), '../../') // linux/darwin fast hack
    !cachePathNpm && tryPath(getPathNpmGlobalRoot(), './npm/') // global npm
    !cachePathNpm && getPathNpmExecutable().endsWith('npm.cmd') && tryPath(getPathNpmExecutable(), '../node_modules/npm/') // win32 bundled fast hack
    if (!cachePathNpm) cachePathNpm = '' // not found, set to empty to stop repeated search
  }
  return cachePathNpm
}
const fromNpmNodeModules = (...args) => getPathNpm() && resolve(getPathNpm(), './node_modules/', ...args) // should resolve to npm bundled package

export {
  parsePackageNameAndVersion,
  findUpPackageRoot,
  toPackageTgzName,

  getPathNpmExecutable,
  getPathNpmGlobalRoot, fromGlobalNodeModules,
  getPathNpm, fromNpmNodeModules
}
