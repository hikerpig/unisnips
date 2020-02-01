import outdent from 'outdent'

import { generateSnippets } from '../src'

import PLUGIN_ULTISNIPS from '@unisnips/ultisnips/src/index'

import { ULTI_SNIPPETS } from '../../../tools/test-tool/src/ultisnips'

describe('sublime generation tests', () => {
  const convertToSublime = (inputContent: string) => {
    const { definitions } = PLUGIN_ULTISNIPS.parse(inputContent)
    return generateSnippets(definitions)
  }

  it('generate right placeholder', () => {
    const content = convertToSublime(ULTI_SNIPPETS.VARIABLE_SIMPLE).content
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
    <snippet>
      <content><![CDATA[
    \${1}
      ]]></content>
      <tabTrigger>test_visual</tabTrigger>
      <description>visual</description>
    </snippet>
    `)
  })

  it('variable will be downgraded to tabstop placeholder', () => {
    const content = convertToSublime(ULTI_SNIPPETS.VISUAL_AND_POSITION).content
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
