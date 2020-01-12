import PLUGIN_ULTISNIPS from '../src/index'

import { ULTI_SNIPPETS } from '../../../tools/test-tool/src/ultisnips'
import { SnippetPlaceholder, SnippetDefinition } from '@unisnips/core'

const { parse } = PLUGIN_ULTISNIPS

type PartialDef = Partial<SnippetDefinition>
type PartialPlaceholder = Partial<SnippetPlaceholder>

describe('parse ultisnips', () => {
  it('extract trigger and description', () => {
    const { definitions } = parse(ULTI_SNIPPETS.SIMPLE, { verbose: true })
    const definition = definitions[0]
    // console.log(JSON.stringify(definition.placeholders[0].extra))
    expect(definition).toMatchObject<PartialDef>({
      trigger: 'subsec',
      description: 'seperator',
    })
  })

  describe('variables', () => {
    it('extract variable location', () => {
      const { definitions } = parse(ULTI_SNIPPETS.VARIABLE_SIMPLE)
      const definition = definitions[0]
      expect(definition.placeholders[0]).toMatchObject<PartialPlaceholder>({
        valueType: 'positional',
        index: 1,
        description: 'argument',
      })
      expect(definition.placeholders[1]).toMatchObject<PartialPlaceholder>({
        valueType: 'positional',
        index: 2,
        description: '',
      })
      // expect(definitions).toMatchSnapshot()
    })

    it("can extract 'VISUAL' ", () => {
      const { definitions } = parse(ULTI_SNIPPETS.VISUAL)
      const definition = definitions[0]
      expect(definition.placeholders[0]).toMatchObject<PartialPlaceholder>({
        valueType: 'variable',
        variable: {
          type: 'builtin',
          name: 'UNI_SELECTED_TEXT',
        },
      })
    })

    it("can extract 'VISUAL' inside another tabstop ", () => {
      const { definitions } = parse(ULTI_SNIPPETS.VISUAL_INSIDE_PLACEHOLDER)
      const definition = definitions[0]
      // console.log('', definition.placeholders)
      expect(definition.placeholders[0]).toMatchObject<Partial<SnippetPlaceholder>>({
        valueType: 'positional',
        index: 0,
      })
      expect(definition.placeholders[1]).toMatchObject<Partial<SnippetPlaceholder>>({
        valueType: 'variable',
        variable: {
          type: 'builtin',
          name: 'UNI_SELECTED_TEXT',
        },
      })
    })

    it('can parse nested tabstop', () => {
      const { definitions } = parse(ULTI_SNIPPETS.NESTED_TABSTOP)
      const def = definitions.find(def => def.trigger === 'nested')
      expect(def.placeholders[0].codePosition).toMatchObject({
        end: {
          column: 25,
          line: 1,
        },
        start: {
          column: 0,
          line: 1,
        },
      })
      expect(def.placeholders[1].codePosition).toMatchObject({
        end: {
          column: 24,
          line: 1,
        },
        start: {
          column: 14,
          line: 1,
        },
      })

      // expect(def).toMatchSnapshot()
    })
  })

  describe('scripts', () => {
    it('can extract script blocks', () => {
      const { definitions } = parse(ULTI_SNIPPETS.SCRIPTS)
      const def1 = definitions.find(def => def.trigger === 'snip')
      expect(def1.placeholders[0].scriptInfo.scriptType).toEqual('python')

      const defJs = definitions.find(def => def.trigger === 'test_js')
      expect(defJs.placeholders[0]).toMatchObject<PartialPlaceholder>({
        scriptInfo: {
          scriptType: 'js',
          code: 'new Date()',
        },
      })

      const defShell = definitions.find(def => def.trigger === 'test_shell')
      expect(defShell.placeholders[0]).toMatchObject<PartialPlaceholder>({
        scriptInfo: {
          scriptType: 'shell',
          code: 'date',
        },
      })
    })
  })
})
