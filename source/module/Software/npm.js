export {
  parsePackageNameAndVersion,
  findUpPackageRoot,
  toPackageTgzName,

  getPathNpmExecutable, getSudoArgs,
  getPathNpmGlobalRoot, fromGlobalNodeModules,
  getPathNpm, fromNpmNodeModules,

  hasRepoVersion,

  fetchLikeRequestWithProxy, fetchWithJumpProxy
} from '@dr-js/core/module/node/module/Software/npm.js'
