import PLUGIN_ULTISNIPS from '../src/index'

import { ULTI_SNIPPETS } from '../../../tools/test-tool/src/ultisnips'
import { UNI_SNIPPETS } from '../../../tools/test-tool/src/unisnips'
import { SnippetPlaceholder, SnippetDefinition } from '@unisnips/core'
import { outdent } from 'outdent'

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
        valueType: 'tabstop',
        index: 1,
        description: 'argument',
      })
      expect(definition.placeholders[1]).toMatchObject<PartialPlaceholder>({
        valueType: 'tabstop',
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
        valueType: 'tabstop',
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
      expect(def.placeholders[0].bodyPosition).toMatchObject({
        end: {
          column: 25,
          line: 1,
        },
        start: {
          column: 0,
          line: 1,
        },
      })
      expect(def.placeholders[1].bodyPosition).toMatchObject({
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

      const defNewLine = definitions.find(def => def.trigger === 'test_newline')
      expect(defNewLine.placeholders[0]).toMatchObject<PartialPlaceholder>({
        scriptInfo: {
          scriptType: 'js',
          code: 'new Date()',
        },
      })
    })
  })
})

describe('transformation', () => {
  it('can extract transformation', () => {
    const { definitions } = parse(ULTI_SNIPPETS.TRANSFORMATIONS)
    const def = definitions.find(o => o.trigger === 'trans')
    expect(def.placeholders[0].transform).toMatchObject({
      replace: 'echo second:$1',
      search: '(\\w+)(.*)',
    })
  })

  it('will not mistake mirror inside transform format string', () => {
    const { definitions } = parse(ULTI_SNIPPETS.TRANSFORMATIONS)
    const def = definitions.find(o => o.trigger === 'mirror_careful')
    expect(def.placeholders.length).toBe(1)
    expect(def.placeholders[0].transform).toMatchObject({
      replace: 'echo ext:$2',
      search: '(\\w+)([\\w\\d]+)\\.(.*)',
    })
  })
})

describe('parse unisnips builtin variables', () => {
  it("should extract variable in '$UNI_*' form", () => {
    const { definitions } = parse(UNI_SNIPPETS.BUILTIN_VAR)
    const def = definitions[0]
    expect(def.placeholders[0].variable).toMatchObject<PartialPlaceholder['variable']>({
      type: 'builtin',
      name: 'UNI_FILEPATH',
    })
    expect(def.placeholders[1].variable).toMatchObject<PartialPlaceholder['variable']>({
      type: 'builtin',
      name: 'UNI_SELECTED_TEXT',
    })
  })
})

describe('ParseOptions.onExtends', () => {
  it(`should be called if provided, and snippet has "extends" syntax`, () => {
    const { definitions } = parse(
      outdent`
      extends javascript
      `,
      {
        onExtends({ extendedTypes }, hepler) {
          expect(extendedTypes).toEqual(['javascript'])
          return hepler.parseForDefinitions(ULTI_SNIPPETS.SIMPLE, {})
        },
      },
    )
    const def = definitions[0]
    expect(def).toMatchObject({
      trigger: 'subsec',
    })
  })
})
