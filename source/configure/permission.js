import { tryRequire } from 'dr-js/module/env/tryRequire'
import { catchAsync } from 'dr-js/module/common/error'
import { isBasicFunction } from 'dr-js/module/common/check'

// const PERMISSION_SAMPLE = {
//   checkPermission: (type, { store }) => true
// }

const DENY_ALL = () => false
const ALLOW_ALL = () => true

const configurePermission = async ({
  permissionType, // deny allow func file
  permissionFunc,
  permissionFile,
  logger
}) => {
  let configurePermissionFunc
  switch (permissionType) {
    case 'deny':
      logger.add('use permission: deny-all')
      return { checkPermission: DENY_ALL }

    case 'allow':
      logger.add('use permission: allow-all')
      return { checkPermission: ALLOW_ALL }

    case 'func':
      configurePermissionFunc = permissionFunc
      if (!isBasicFunction(configurePermissionFunc)) throw new Error(`invalid permissionFunc`)
      logger.add('use permissionFunc')
      break

    case 'file' :
      configurePermissionFunc = (tryRequire(permissionFile) || { configurePermission: null }).configurePermission
      if (!isBasicFunction(configurePermissionFunc)) throw new Error(`failed to load permissionFile: ${permissionFile}`)
      logger.add('use permissionFile')
      break

    default:
      throw new Error(`invalid permissionType: ${permissionType}`)
  }

  const { result, error } = await catchAsync(configurePermissionFunc, { logger })
  if (error) throw error

  return result
}

export { configurePermission }
