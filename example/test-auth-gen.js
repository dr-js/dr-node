const { generateAuthFile } = require('../output-gitignore/library/module/Auth')

generateAuthFile(`${__dirname}/.timed-lookup-gitignore.key`, { tag: 'TEST_AUTH' })
  .catch(console.error)
