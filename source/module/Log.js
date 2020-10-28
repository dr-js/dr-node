import { createDummyExot } from '@dr-js/core/module/common/module/Exot'
import { createLoggerExot } from '@dr-js/core/module/node/module/Logger'

const prefixTime = ({ add, ...loggerExot }) => ({
  ...loggerExot,
  add: (...args) => add(new Date().toISOString(), ...args)
})

// support `add()` before `up()`
const configureLog = ({
  pathLogDirectory,
  logFilePrefix = ''
} = {}) => ({
  loggerExot: prefixTime(pathLogDirectory
    ? createLoggerExot({
      pathLogDirectory,
      getLogFileName: () => `${logFilePrefix}${(new Date().toISOString()).replace(/\W/g, '-')}.log`,
      flags: 'a' // append, not reset file if exist
    })
    : {
      ...createDummyExot({ idPrefix: 'log-' }),
      add: console.log,
      save: () => {},
      split: () => {}
    }
  )
})

export { configureLog }
