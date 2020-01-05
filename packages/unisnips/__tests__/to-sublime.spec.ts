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

  it('generate right placeholder', () => {
    const content = convertToSublime(ULTI_SNIPPETS.VARIABLE_SIMPLE).content
    expect(content).toEqual(outdent`<snippet>
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
})
