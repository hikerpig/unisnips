Unisips
===

![test](https://img.shields.io/github/workflow/status/hikerpig/unisnips/Test?label=test)
[![codecov](https://codecov.io/gh/hikerpig/unisnips/branch/master/graph/badge.svg)](https://codecov.io/gh/hikerpig/unisnips)

Unisnips is a set of tools to parse and generate expandable snippets, aiming to be the bridge between different editor/plugin/code-exapand-apps. It parses snippet sources (so far only a subset of [UltiSnips](https://github.com/SirVer/ultisnips) is supported) and converts them to different targets.

You can keep only one set of expressive code templates - AKA snippets - and free yourself the chore of rewriting snippets to fit specifications of different platforms.

:construction: Still under active development, feel free to open issues.

[See the demo site](https://unisnips.netlify.com/)

## :sparkles: Features

### Supported sources

#### UltiSnips

1. Positional placholder (aka 'TabStop' in UltiSnips)

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

- [ ] Port UltiSnips parser to TypeScript, to fully understand its `.snippets` file.
- [ ] Add more builtin variables, may be useful in some targets (such as vscode's `$CURRENT_YEAR`).
