import { shouldSupportColor, configureTerminalColor } from './TerminalColor'

const { describe, it, info = console.log } = global

describe('Node.Module.TerminalColor', () => {
  it('shouldSupportColor()', async () => {
    info(`shouldSupportColor(): ${shouldSupportColor()}`)
  })

  it('configureTerminalColor()', async () => {
    const TerminalColor = configureTerminalColor()
    info(`TerminalColor.fg.red('test color'): ${TerminalColor.fg.red('test color')}`)
    info(`TerminalColor.bg.darkGray('test color'): ${TerminalColor.bg.darkGray('test color')}`)
  })
})
