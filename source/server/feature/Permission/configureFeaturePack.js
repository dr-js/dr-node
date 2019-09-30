import { configurePermission } from 'source/module/Permission'

const configureFeaturePack = async ({
  option, logger, routePrefix = '',
  permissionType, permissionFunc, permissionFile
}) => {
  const permissionPack = await configurePermission({ permissionType, permissionFunc, permissionFile, logger })

  return { permissionPack }
}

export { configureFeaturePack }
