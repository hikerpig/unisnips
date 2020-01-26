import outdent from 'outdent'

import { ULTI_SNIPPETS } from '../../../tools/test-tool/src/ultisnips'

import { ultisnipsToVscode } from '../src/index'

describe('convert to vscode', () => {
  it("generate right 'VISUAL' placeholder", () => {
    const { content } = ultisnipsToVscode(ULTI_SNIPPETS.VISUAL)
    expect(content).toEqual(outdent`
    {
      "visual": {
        "prefix": "test_visual",
        "body": [
          "$TM_SELECTED_TEXT"
        ],
        "description": "visual"
      }
    }
    `)
  })

  it("combined 'VISUAL' and tabstop placeholder", () => {
    const { content } = ultisnipsToVscode(ULTI_SNIPPETS.VISUAL_AND_POSITION)
    expect(content).toEqual(outdent`
    {
      "vue class component @Prop": {
        "prefix": "vccprop",
        "body": [
          "@Prop() $TM_SELECTED_TEXT: \${2:type}"
        ],
        "description": "vue class component @Prop"
      }
    }
    `)
  })

  it('will keep tabstop transformations', () => {
    const { content } = ultisnipsToVscode(ULTI_SNIPPETS.TRANSFORMATIONS)
    const snippetItem = JSON.parse(content)
    expect(snippetItem).toMatchObject({
      transformation: {
        prefix: 'trans',
        body: ['${1/(\\w+)(.*)/echo second:$1/}'],
        description: 'transformation',
      },
    })
  })
})
