import { configurePermission } from 'source/module/Permission'

// TODO: NOTE: not fully thought out yet
//   basically permission supported feature should accept a permissionPack
//   and call `await permissionPack.checkPermission(TYPE, ...)` to get a Boolean and decide if abort or continue

const setup = async ({
  name = 'feature:permission',
  logger, routePrefix = '',
  permissionType, permissionFunc, permissionFile
}) => {
  const permissionPack = await configurePermission({ permissionType, permissionFunc, permissionFile, logger })

  return {
    permissionPack,
    name
  }
}

export { setup }
