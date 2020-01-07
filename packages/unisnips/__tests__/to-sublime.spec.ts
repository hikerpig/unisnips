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
    const content = convertToSublime(ULTI_SNIPPETS.SIMPLE).content
    expect(content).toEqual(outdent`<snippet>
      <content><![CDATA[
    ---------------- \${1} ----------------------
    ----------------end \${1} -------------------
      ]]></content>
      <tabTrigger>subsec</tabTrigger>
      <description>seperator</description>
    </snippet>
    `)
  })
})
