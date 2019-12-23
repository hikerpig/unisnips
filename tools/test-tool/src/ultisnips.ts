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
}
