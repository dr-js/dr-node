import { Preset, prepareOption } from '@dr-js/core/module/node/module/Option/preset'

import { SampleServerFormatConfig } from './runServer'
import { CommonFormatConfigList, ModuleFormatConfigList } from './runModule'

const MODE_NAME_LIST = [
  SampleServerFormatConfig,
  ...ModuleFormatConfigList
].map(({ name }) => name)

const OPTION_CONFIG = {
  prefixENV: 'dr-node',
  formatList: [
    Preset.Config,
    ...Preset.parseCompactList(
      'help,h/T|show full help',
      'version,v/T|show version'
    ),
    ...CommonFormatConfigList,
    ...ModuleFormatConfigList,
    SampleServerFormatConfig
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { MODE_NAME_LIST, parseOption, formatUsage }
