import { createDummyExot } from '@dr-js/core/module/common/module/Exot'
import { createLoggerExot } from '@dr-js/core/module/node/module/Logger'
// import { addExitListenerAsync, addExitListenerSync } from '@dr-js/core/module/node/system/ExitListener'

const prefixLoggerTime = ({ add, ...logger }) => ({
  ...logger,
  add: (...args) => add(new Date().toISOString(), ...args)
})

const configureLog = ({
  pathLogDirectory,
  logFilePrefix = ''
} = {}) => ({
  loggerExot: prefixLoggerTime(pathLogDirectory
    ? createLoggerExot({
      pathLogDirectory,
      getLogFileName: () => `${logFilePrefix}${(new Date().toISOString()).replace(/\W/g, '-')}.log`,
      flags: 'a' // append, not reset file if exist
    })
    : {
      ...createDummyExot({ idPrefix: 'log' }),
      add: console.log,
      save: () => {},
      split: () => {}
    }
  )
})

// // TODO: merge to server ExotGroup management
// await loggerExot.up()
// addExitListenerAsync((exitState) => {
//   __DEV__ && console.log('>> listenerAsync')
//   loggerExot.add(`[EXITING] ${JSON.stringify(exitState)}`)
// })
// addExitListenerSync((exitState) => {
//   __DEV__ && console.log('>> listenerSync')
//   loggerExot.add(`[EXIT] ${JSON.stringify(exitState)}`)
//   exitState.error && loggerExot.add(`[EXIT][ERROR] ${exitState.error.stack || exitState.error}`)
//   loggerExot.down()
// })

export { configureLog }
