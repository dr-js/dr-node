import { pingRaceUrlList } from './PingRace'

const { describe, it, info = console.log } = global

describe('Node.Module.PingRace', () => {
  it('pingRaceUrlList()', async () => {
    const url = await pingRaceUrlList([
      'http://dr.run',
      'https://dr.run',
      'http://github.com',
      'https://github.com'
    ])
    info(`url: ${url}`)
  })
})
