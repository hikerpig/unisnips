Unisips
===

![test](https://img.shields.io/github/workflow/status/hikerpig/unisnips/Test?label=test)
[![codecov](https://codecov.io/gh/hikerpig/unisnips/branch/master/graph/badge.svg)](https://codecov.io/gh/hikerpig/unisnips) [![Greenkeeper badge](https://badges.greenkeeper.io/hikerpig/unisnips.svg)](https://greenkeeper.io/)

Unisnips is a set of tools to parse and generate expandable snippets, aiming to be the bridge between different editor/plugin/code-expand-apps. It parses snippet sources (so far only a subset of [UltiSnips](https://github.com/SirVer/ultisnips) is supported) and converts them to different targets.

You can keep only one set of expressive code templates - AKA snippets - and free yourself the chore of rewriting snippets to fit specifications of different platforms.

:construction: Still under active development, feel free to open issues.

[See the demo site](https://unisnips.netlify.com/)

## :sparkles: Features

### Parses source to a list of [interchangable data](https://github.com/hikerpig/unisnips/blob/master/packages/core/src/type.ts) for further use

See the [demo site](https://unisnips.netlify.com/?result=debug)'s DEBUG panel.

### Supported sources

#### UltiSnips

1. Positional placeholder (aka 'TabStop' in UltiSnips)

```vim-snippet
snippet subsec "most common and simple"
---------------- $1 ----------------------
----------------end $1 -------------------
endsnippet

snippet with_default "with default value"
function ${1:name} {
  ${2://body}
}
endsnippet

snippet nested "nested tabstop"
${0:outer and ${1://inner}}
endsnippet
```

2. 'VISUAL' placeholder

```vim-snippet
snippet ret  "return value"
ret ${VISUAL}
endsnippet
```

3. script code block

```vim-snippet
snippet test_shell "shell code"
should print date: `! date`
endsnippet

snippet test_js "javascript code"
should print date: `!js new Date()`
endsnippet
```

4. transformations

```vim-snippet
snippet tabstop_transformation "import vue component"
import ${1/(.*)\/([\w]*)\.vue/$2/g} from '${1}'
endsnippet
```

### Supported targets

- vscode, [Visual Studio Code](https://code.visualstudio.com/docs/editor/userdefinedsnippets)
- atom, [Atom](https://flight-manual.atom.io/using-atom/sections/snippets/)
- sublime , [Sublime Text](http://www.sublimetext.info/docs/en/extensibility/snippets.html)

## Usage

### Node cli

#### Install

```bash
npm i -g @unisnips/unisnips
# or
yarn global add @unisnips/unisnips
```
#### Example

```bash
unisnips convert --target vscode -i ~/.vim/Ultisnips/typescript.snippets -o ~/vscodesnippets/typescript.json
```

## Roadmaps

- [x] Port a subset of UltiSnips parser to TypeScript, enable some basic and mostly used features

- [x] Add more builtin variables, may be useful in some targets (such as vscode's `$CURRENT_YEAR`)

- [x] Parses `transformations` and convert them to vscode
