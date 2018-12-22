import { getDrBrowserScriptHTML } from 'dr-js/bin/function'

let scriptStringCache
const DR_BROWSER_SCRIPT = () => { // TODO: expect extra file, not good after webpack (`${__dirname}/../library/Dr.browser.js`)
  if (scriptStringCache === undefined) scriptStringCache = getDrBrowserScriptHTML()
  return scriptStringCache
}

export { DR_BROWSER_SCRIPT }
