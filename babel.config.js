const { getBabelConfig } = require('dr-dev/library/babel')

const BABEL_ENV = process.env.BABEL_ENV || ''
const isUseSource = BABEL_ENV.includes('use-source')

module.exports = getBabelConfig({
  extraModuleResolverList: [ {
    '^dr-server/sample/(.+)': isUseSource
      ? './source-sample/\\1' // when direct use/test with `@babel/register`
      : './sample/\\1', // when build to output
    '^dr-server/module/(.+)': isUseSource
      ? './source/\\1' // when direct use/test with `@babel/register`
      : './library/\\1' // when build to output
  } ]
})
