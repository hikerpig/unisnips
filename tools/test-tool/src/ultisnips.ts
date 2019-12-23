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
  VISUAL: outdent`
  snippet test_visual "visual"
  \${VISUAL:code}
  endsnippet
  `,
  VISUAL_AND_POSITION: outdent`
  snippet vccprop "vue class component @Prop"
  @Prop() \${VISUAL}: \${2:type}
  endsnippet
  `,
}
