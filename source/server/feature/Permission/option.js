import { Preset } from '@dr-js/core/module/node/module/Option/preset'

const { parseCompactList, pickOneOf } = Preset

const PermissionFormatConfig = {
  ...pickOneOf([ 'allow', 'deny', 'func', 'file' ]),
  name: 'permission-type',
  extendFormatList: parseCompactList(
    'permission-func/SF,O',
    'permission-file/SP,O'
  )
}
const getPermissionOption = ({ tryGetFirst }) => ({
  permissionType: tryGetFirst('permission-type'),
  permissionFunc: tryGetFirst('permission-func'),
  permissionFile: tryGetFirst('permission-file')
})

export {
  PermissionFormatConfig,
  getPermissionOption
}
