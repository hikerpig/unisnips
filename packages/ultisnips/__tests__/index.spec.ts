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

    it("can extract 'VISUAL' inside another placeholder ", () => {
      const { definitions } = parse(ULTI_SNIPPETS.VISUAL_INSIDE_PLACEHOLDER)
      const definition = definitions[0]
      // console.log('', definition.placeholders)
      expect(definition.placeholders[0]).toMatchObject<Partial<SnippetPlaceholder>>({
        valueType: 'variable',
        variable: {
          type: 'builtin',
          name: 'UNI_SELECTED_TEXT',
        },
      })
    })
  })
})
