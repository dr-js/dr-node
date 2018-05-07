import { ConfigPreset } from 'dr-js/module/common/module/Option/preset'

const { SingleString, SingleInteger, BooleanFlag } = ConfigPreset

const SERVER_FORMAT_CONFIG = {
  ...SingleString,
  optional: true,
  name: 'hostname',
  shortName: 'H',
  extendFormatList: [
    { ...SingleInteger, name: 'port', shortName: 'P' },
    {
      ...BooleanFlag,
      name: 'https',
      shortName: 'S',
      extendFormatList: [
        { ...SingleString, isPath: true, name: 'file-SSL-key' },
        { ...SingleString, isPath: true, name: 'file-SSL-cert' },
        { ...SingleString, isPath: true, name: 'file-SSL-chain' },
        { ...SingleString, isPath: true, name: 'file-SSL-dhparam' }
      ]
    },
    { ...SingleString, isPath: true, optional: true, name: 'path-log', extendFormatList: [ { ...SingleString, optional: true, name: 'prefix-log-file' } ] },
    { ...SingleString, isPath: true, optional: true, name: 'file-pid' }
  ]
}

const AUTH_FORMAT_CONFIG = {
  ...SingleString,
  optional: true,
  isPath: true,
  name: 'file-auth-config',
  extendFormatList: [ {
    ...BooleanFlag,
    name: 'auth-gen',
    extendFormatList: [
      { ...SingleString, optional: true, name: 'auth-gen-tag' },
      { ...SingleInteger, optional: true, name: 'auth-gen-size' },
      { ...SingleInteger, optional: true, name: 'auth-gen-token-size' },
      { ...SingleInteger, optional: true, name: 'auth-gen-time-gap' }
    ]
  } ]
}

export {
  SERVER_FORMAT_CONFIG,
  AUTH_FORMAT_CONFIG
}
