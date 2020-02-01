import outdent from 'outdent'

import { GenerateResult } from '@unisnips/core'

import { ULTI_SNIPPETS } from '../../../tools/test-tool/src/ultisnips'

import { convert, sync } from '../src/index'

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

describe('sync to sublime', () => {
  const syncToSublime = (inputContent: string) => {
    return sync({
      target: 'sublime',
      inputContent,
    })
  }

  it('should sync to one-file-per-snippet', () => {
    const syncInfo = syncToSublime(ULTI_SNIPPETS.VARIABLE_SIMPLE)
    const names = syncInfo.entries.map(o => o.filename)
    expect(names).toEqual(['afn.xml', 'test_visual.xml'])
  })
})
