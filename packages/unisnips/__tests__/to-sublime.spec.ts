import outdent from 'outdent'

import { GenerateResult } from '@unisnips/core'

import { ULTI_SNIPPETS } from '../../../tools/test-tool/src/ultisnips'

import { convert } from '../src/index'

describe('convert to sublime', () => {
  const convertToSublime = (inputContent: string) => {
    return convert({
      target: 'sublime',
      inputContent,
    })
  }

  const getValuableContent = (result: GenerateResult) => {
    const lines = result.content.split('\n')
    lines.pop()
    lines.shift()
    return lines.join('\n')
  }

  it('generate right placeholder', () => {
    const content = getValuableContent(convertToSublime(ULTI_SNIPPETS.VARIABLE_SIMPLE))
    expect(content).toEqual(outdent`
    <snippet>
      <content><![CDATA[
    function(\${1:argument}, \${2}}) {
      \${3:body}
    }
      ]]></content>
      <tabTrigger>afn</tabTrigger>
      <description>anonymous function</description>
    </snippet>
    `)
  })

  it('variable will be downgraded to positional placeholder', () => {
    const content = getValuableContent(convertToSublime(ULTI_SNIPPETS.VISUAL_AND_POSITION))
    expect(content).toEqual(outdent`
    <snippet>
      <content><![CDATA[
    @Prop() \${3}: \${2:type}
      ]]></content>
      <tabTrigger>vccprop</tabTrigger>
      <description>vue class component @Prop</description>
    </snippet>
    `)
  })
})
