import { configurePermission } from 'source/module/Permission'

const configureFeaturePack = async ({
  logger, routePrefix = '',
  permissionType, permissionFunc, permissionFile
}) => {
  const permissionPack = await configurePermission({ permissionType, permissionFunc, permissionFile, logger })

  return { permissionPack }
}

export { configureFeaturePack }
