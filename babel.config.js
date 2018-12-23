const BABEL_ENV = process.env.BABEL_ENV || ''
const isDev = BABEL_ENV.includes('dev')
const isModule = BABEL_ENV.includes('module')
const isBuildBin = BABEL_ENV.includes('build-bin') // for rewriting import form 'dr-js/module' to 'library'(build) or 'source'(test)

module.exports = {
  presets: [
    [ '@babel/env', { targets: { node: '10' }, modules: isModule ? false : 'commonjs' } ]
  ],
  plugins: [
    !isModule && [ '@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true } ], // NOTE: for Edge(17.17134) support check: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#Spread_in_object_literals
    [ 'minify-replace', { replacements: [ { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value: isDev } } ] } ],
    [ 'module-resolver', {
      root: [ './' ],
      alias: isModule ? undefined : {
        '^dr-dev/module/(.+)': 'dr-dev/library/\\1',
        '^dr-js/module/(.+)': 'dr-js/library/\\1',
        '^dr-server/sample/(.+)': './sample/\\1',
        '^dr-server/module/(.+)': isBuildBin
          ? './source/\\1'
          : './library/\\1'
      }
    } ]
  ].filter(Boolean),
  comments: false
}
