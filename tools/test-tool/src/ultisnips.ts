import outdent from 'outdent'

import { getUltisnipsSnippetContent } from './index'

export const ULTI_SNIPPETS = {
  SIMPLE: outdent`
    snippet subsec "seperator"
    ---------------- $1 ----------------------
    ----------------end $1 -------------------
    endsnippet
  `,
  VARIABLE_SIMPLE: getUltisnipsSnippetContent('variables.snippets'),
  SCRIPTS: getUltisnipsSnippetContent('scripts.snippets'),
  VISUAL: outdent`
  snippet test_visual "visual"
  \${VISUAL}
  endsnippet
  `,
  VISUAL_AND_POSITION: outdent`
  snippet vccprop "vue class component @Prop"
  @Prop() \${VISUAL}: \${2:type}
  endsnippet
  `,
  VISUAL_INSIDE_PLACEHOLDER: outdent`
  snippet main "fun main"
  function main() {
    \${0:\${VISUAL}}
  }
  endsnippet
  `,
  NESTED_TABSTOP: outdent`
  snippet nested "nested tabstop"
  function main() {
    \${0:\${1://inner}}
  }
  endsnippet
  `,
}
