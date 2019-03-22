import { getDrBrowserScriptHTML } from 'dr-js/bin/function'

let scriptStringCache
const DR_BROWSER_SCRIPT = () => { // TODO: babel only, expect extra file, will create wrong `__dirname` after webpack (`${__dirname}/../library/Dr.browser.js`)
  if (scriptStringCache === undefined) scriptStringCache = getDrBrowserScriptHTML()
  return scriptStringCache
}

export { DR_BROWSER_SCRIPT }
