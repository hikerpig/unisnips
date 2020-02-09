# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.8.0](https://github.com/hikerpig/unisnips/compare/v0.7.3...v0.8.0) (2020-02-09)


### Features

* [ultisnips] Adjust `newStart` calculation during parsing nested tabstop, keep original position in snippet text ([bcebb06](https://github.com/hikerpig/unisnips/commit/bcebb065c6ba52b4c2f552dc618a5753f1e1063e))





## [0.7.3](https://github.com/hikerpig/unisnips/compare/v0.7.2...v0.7.3) (2020-02-09)


### Bug Fixes

* [ultisnips] script block wrong 'bodyPosition.offset' ([af4aaf7](https://github.com/hikerpig/unisnips/commit/af4aaf725a59ad671f6653fc0c381cedc7466ead))





## [0.7.2](https://github.com/hikerpig/unisnips/compare/v0.7.1...v0.7.2) (2020-02-07)


### Bug Fixes

* [ultisnips] script block 'bodyPosition' line error ([4c08771](https://github.com/hikerpig/unisnips/commit/4c08771323873171d807bef0e215217742f6fde8))





## [0.7.1](https://github.com/hikerpig/unisnips/compare/v0.7.0...v0.7.1) (2020-02-05)


### Bug Fixes

* [ultisnips] script type detection should be correct in line's end ([a8f6e6b](https://github.com/hikerpig/unisnips/commit/a8f6e6b4767eed6736e52e7cd0d1121ce4aa67e4))





# [0.7.0](https://github.com/hikerpig/unisnips/compare/v0.7.0-alpha.0...v0.7.0) (2020-02-03)


### Features

* :sparkles: Implement 'sync' command ([#11](https://github.com/hikerpig/unisnips/issues/11)) ([8a59fee](https://github.com/hikerpig/unisnips/commit/8a59fee544ab722550ae25cbf3fcd017721a439d))
* Add 'flags' field to SnippetDefinition ([feae407](https://github.com/hikerpig/unisnips/commit/feae407fdf39253cdd41b24c29f8a07eab6050bd))



# [0.7.0-alpha.0](https://github.com/hikerpig/unisnips/compare/v0.6.0...v0.7.0-alpha.0) (2020-01-31)

### Bug Fixes

* [jetbrains] add missing dep ([a019ae7](https://github.com/hikerpig/unisnips/commit/a019ae71957a2eb419435c9c07eaff0426f394e9))


### Features

* replace valueType 'positional' with 'tabstop' ([9489fa0](https://github.com/hikerpig/unisnips/commit/9489fa0f70b2de0f0b98284baffb142f675c67f8))
* Strip redundant ultisnips snippets by priority [#10](https://github.com/hikerpig/unisnips/issues/10) ([901f732](https://github.com/hikerpig/unisnips/commit/901f7320e4405b332d9318c53e7cc08136da807a))


### BREAKING CHANGES

valueType 'positional' -> 'tabstop'


# [0.6.0-alpha.0](https://github.com/hikerpig/unisnips/compare/v0.5.1-alpha.0...v0.6.0-alpha.0) (2020-01-25)


### Features

* [jetbrains] :sparkles: Add generator for jetbrain's live template ([7da6bf9](https://github.com/hikerpig/unisnips/commit/7da6bf9c9ae7c672e57bc94ecba3f9d86d55c5e3))
* [ultisnips] Add `ParseOptions.onExtends` to enable custimizable snippet manangement ([cd27032](https://github.com/hikerpig/unisnips/commit/cd27032f9367f253836aa82dc8e4ca4fa639845a))





# [0.5.0](https://github.com/hikerpig/unisnips/compare/v0.5.0-alpha.0...v0.5.0) (2020-01-16)


### Features

* remove `placeholder.position`; replace `codePosition` it with `bodyPosition` ([60ae58a](https://github.com/hikerpig/unisnips/commit/60ae58a14081de5e9b2a88ed2d05c7f6c9cc3d3b))



# [0.5.0-alpha.0](https://github.com/hikerpig/unisnips/compare/v0.4.0...v0.5.0-alpha.0) (2020-01-15)


### Features

* Add transformations related parsing, can convert to vscode, related [#1](https://github.com/hikerpig/unisnips/issues/1) ([daee276](https://github.com/hikerpig/unisnips/commit/daee276b59bd4d5b62cd1bd401d42b7304091ebe))



# [0.4.0](https://github.com/hikerpig/unisnips/compare/v0.4.0-alpha.1...v0.4.0) (2020-01-12)


### Bug Fixes

* [ultisnips] nested tabstop position error ([2f9da82](https://github.com/hikerpig/unisnips/commit/2f9da82c5ca7b763dcbc5cd7fe7bb3b63442a190))



# [0.4.0-alpha.1](https://github.com/hikerpig/unisnips/compare/v0.4.0-alpha.0...v0.4.0-alpha.1) (2020-01-11)


### Features

* Can parse nested tabstops, and extract correct positions ([9b794a0](https://github.com/hikerpig/unisnips/commit/9b794a015cbaf6ff5bea905fdd6d7d82c5c10e2e))



# [0.4.0-alpha.0](https://github.com/hikerpig/unisnips/compare/67d548642796a88231b72dc4bcdea25f632e794a...v0.4.0-alpha.0) (2020-01-07)


### Bug Fixes

* [atom] :bug: unquoted prefix ([f77d13d](https://github.com/hikerpig/unisnips/commit/f77d13d6123b8024807ee5ff3216b41121a812b4))
* [ultisnips] token position and 'codePosition' error ([deef176](https://github.com/hikerpig/unisnips/commit/deef176b11055b7bdd1151a616c0c9e86930bc3b))
* add missing deps ([2b1b092](https://github.com/hikerpig/unisnips/commit/2b1b092cde68f5865bd2a4f9b82b61f27031e3b3))


### Features

* [atom] Add comment header and footer to wrap generated conetent ([de64cf1](https://github.com/hikerpig/unisnips/commit/de64cf1702bb6ce750681084bd04556af0ccfe72))
* [atom] remove cson, dump cson strings by hand ([8ef2dee](https://github.com/hikerpig/unisnips/commit/8ef2dee070fee92c1cf609a2b62edd47e225988c))
* [core] add missing '@types/unist' dep ([6aacff5](https://github.com/hikerpig/unisnips/commit/6aacff5e50bac8cb1c0594483a3a3d4bc71299e1))
* [sublime] add generation target 'sublime' for Sublime Text ([60c82bb](https://github.com/hikerpig/unisnips/commit/60c82bb0e084401948122b05a1cb9815da7db5ef))
* [unisnips] more friendly log ([81a7c49](https://github.com/hikerpig/unisnips/commit/81a7c491328c69a71296dacd2a5db7023db33f2e))
* A cli program in '@unisnips/unisnips' for universal converting ([cea413a](https://github.com/hikerpig/unisnips/commit/cea413a585c0da9ed7498f99cf7593883311829e))
* Add 'position' info to SnippetDefinition, supports multiple snippets in one file ([ddfdb78](https://github.com/hikerpig/unisnips/commit/ddfdb78b712e3a419f6a44defe8b58b448aa5d0b))
* Add atom snippets generation support. ([8c580e3](https://github.com/hikerpig/unisnips/commit/8c580e3aa62e1d293af8517e96028e4bf26ed40d))
* add extra.token to Placeholder ([dc585d2](https://github.com/hikerpig/unisnips/commit/dc585d2f7d3d7f612bd9e88966f4cc7f28f8c5db))
* Add initial packages, complete ultisnips -> vscode functionalities ([67d5486](https://github.com/hikerpig/unisnips/commit/67d548642796a88231b72dc4bcdea25f632e794a))
* Add plop-templates for quick setup ([9051720](https://github.com/hikerpig/unisnips/commit/9051720c10e734010775123e291230e38b5fd148))
* Add tests for @unisnips/ultisnips package ([6d68ad1](https://github.com/hikerpig/unisnips/commit/6d68ad1920afb87d51d9226b5b511575889bf7c4))
* add UNISNIPS_SPECIAL_HOLDER_NAMES for special replacements ([63bf6bc](https://github.com/hikerpig/unisnips/commit/63bf6bcf4ada923339cefc096251639dc3f59a8a))
* change to lerna 'fixed' version mode ([63fb1e9](https://github.com/hikerpig/unisnips/commit/63fb1e9f23e57fe0db4d13eca0f3d5788371924f))
* explicit token type ([f5b643b](https://github.com/hikerpig/unisnips/commit/f5b643b924f63ef58f5fe5856cc6d6d22731e7c1))
* multi command cli, 'unisnips convert' ([603e694](https://github.com/hikerpig/unisnips/commit/603e6947928bb6b56c4d4d71b9cdef0942891ae2))
* port a subset of ultisnips lexer/parser ([c55e7c0](https://github.com/hikerpig/unisnips/commit/c55e7c006725a2b90deda5b7b4884464178d3c6a))
* Redefine interchange data types, to support more complicated UltiSnips functionality ([57ef061](https://github.com/hikerpig/unisnips/commit/57ef0615e99cd3fecc5fc58baf63717fd71ab325))
