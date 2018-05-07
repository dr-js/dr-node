import { createLogger } from 'dr-js/module/node/module/Logger'
import { addExitListenerAsync, addExitListenerSync } from 'dr-js/module/node/system/ExitListener'

const EMPTY_FUNC = () => {}

const prefixLoggerTime = ({ add, ...logger }) => ({
  ...logger,
  add: (...args) => add(new Date().toISOString(), ...args)
})

const configureLogger = async ({ pathLogDirectory, prefixLogFile }) => {
  __DEV__ && !pathLogDirectory && console.log('[Logger] output with console.log()')

  const logger = prefixLoggerTime(pathLogDirectory
    ? await createLogger({
      pathLogDirectory,
      getLogFileName: () => `${prefixLogFile}${(new Date().toISOString()).replace(/\W/g, '-')}.log`,
      flags: 'a' // append not clear file if name clash
    })
    : { add: console.log, save: EMPTY_FUNC, split: EMPTY_FUNC, end: EMPTY_FUNC }
  )

  addExitListenerAsync((exitState) => {
    __DEV__ && console.log('>> listenerAsync')
    logger.add(`[SERVER DOWN] ${JSON.stringify(exitState)}`)
  })

  addExitListenerSync((exitState) => {
    __DEV__ && console.log('>> listenerSync')
    logger.add(`[SERVER EXIT] ${JSON.stringify(exitState)}`)
    logger.end()
  })

  return logger
}

export { configureLogger }
