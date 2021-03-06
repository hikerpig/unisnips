import outdent from 'outdent'

import { ULTI_SNIPPETS } from '../../../tools/test-tool/src/ultisnips'

import { convert } from '../src/index'

import { ParseOptions } from '@unisnips/core'

describe('convert to jetbrains live template', () => {
  const convertToJetBrains = (inputContent: string, opts: ParseOptions = {}) => {
    return convert({
      target: 'jetbrains',
      inputContent,
      ...opts,
    })
  }

  it('generate right placeholder', () => {
    const { content } = convertToJetBrains(ULTI_SNIPPETS.SIMPLE)
    // console.log(content)
    expect(content).toEqual(outdent`
    <templateSet group="unisnips">
      <template name="subsec" description="seperator" value="---------------- $TS_1$ ----------------------&#10;----------------end $TS_1$ -------------------">
        <variable name="TS_1" defaultValue="" alwaysStopAt="true" />
        <context >
          <option name="OTHER" value="true" />
        </context>
      </template>
    </templateSet>`)
  })

  it('generate variable content', () => {
    const { content } = convertToJetBrains(ULTI_SNIPPETS.VISUAL_AND_POSITION)
    expect(content).toEqual(outdent`
    <templateSet group="unisnips">
      <template name="vccprop" description="vue class component @Prop" value="@Prop() $SELECTION$: $TS_2$">
        <variable name="TS_2" defaultValue="type" alwaysStopAt="true" />
        <context >
          <option name="OTHER" value="true" />
        </context>
      </template>
    </templateSet>`)
  })
})
