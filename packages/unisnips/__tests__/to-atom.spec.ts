import outdent from 'outdent'

import { ULTI_SNIPPETS } from '../../../tools/test-tool/src/ultisnips'

import { convert } from '../src/index'

describe('convert to atom', () => {
  const convertToAtom = (inputContent: string) => {
    return convert({
      target: 'atom',
      inputContent,
    })
  }

  it('generate right placeholder', () => {
    const { content } = convertToAtom(ULTI_SNIPPETS.SIMPLE)
    expect(content).toEqual(outdent`
    seperator:
      prefix: 'subsec'
      body: '''
        ---------------- \${1} ----------------------
        ----------------end \${1} -------------------
      '''
    `)
  })

  it('variable will be downgraded to positional placeholder', () => {
    const { content } = convertToAtom(ULTI_SNIPPETS.VISUAL_AND_POSITION)
    expect(content).toEqual(outdent`
    'vue class component @Prop':
      prefix: 'vccprop'
      body: '@Prop() \${3}: \${2:type}'
    `)
  })
})
