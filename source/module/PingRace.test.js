import {
  pingRaceUrlList,
  pingStatUrlList
} from './PingRace'

const { describe, it, info = console.log } = global

const TEST_URL_LIST = [
  'http://noop.dr.run', // allow non-exist DNS
  'https://noop.dr.run', // allow non-exist DNS
  'http://dr.run',
  'https://dr.run',
  'http://github.com',
  'https://github.com',
  'https://stackoverflow.com'
]

describe('Node.Module.PingRace', () => {
  it('pingRaceUrlList()', async () => {
    info(`url: ${await pingRaceUrlList([])}`) // fast exit
    info(`url: ${await pingRaceUrlList(TEST_URL_LIST)}`)
  })

  it('pingStatUrlList()', async () => {
    info(`statMap: ${JSON.stringify(await pingStatUrlList([], { timeout: 2 * 1000 }), null, 2)}`)
    info(`statMap: ${JSON.stringify(await pingStatUrlList(TEST_URL_LIST, { timeout: 2 * 1000 }), null, 2)}`)
  })
})
