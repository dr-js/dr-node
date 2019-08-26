# @dr-js/node

[![i:npm]][l:npm]
[![i:ci]][l:ci]
[![i:size]][l:size]
[![i:npm-dev]][l:npm]

A collection of strange functions, for node

[i:npm]: https://img.shields.io/npm/v/@dr-js/node.svg?colorB=blue
[i:npm-dev]: https://img.shields.io/npm/v/@dr-js/node/dev.svg
[l:npm]: https://npm.im/@dr-js/node
[i:ci]: https://img.shields.io/travis/dr-js/dr-node/master.svg
[l:ci]: https://travis-ci.org/dr-js/dr-node
[i:size]: https://packagephobia.now.sh/badge?p=@dr-js/node
[l:size]: https://packagephobia.now.sh/result?p=@dr-js/node

[//]: # (NON_PACKAGE_CONTENT)

- 📁 [source/](source/)
  - main source code, in output package will be:
    - `@dr-js/node/library`: for direct use, use `require() / exports.*=`
    - `@dr-js/node/module`: for re-pack, keep `import / export` and readability
- 📁 [source-bin/](source-bin/)
  - bin source code, in output package will be `@dr-js/node/bin`
- 📁 [source-sample/](source-sample/)
  - sample server source code, in output package will be `@dr-js/node/sample`
- 📁 [example/](example/)
  - some example (unsorted tests)
- 📄 [SPEC.md](SPEC.md)
  - list of all directly accessible codes, sort of an API lockfile
