import PLUGIN_ULTISNIPS from '../src/index'

import { ULTI_SNIPPETS } from '../../../tools/test-tool/src/ultisnips'

const { parse } = PLUGIN_ULTISNIPS

describe('parse ultisnips', () => {
  it('extract trigger and description', () => {
    const { definitions } = parse(ULTI_SNIPPETS.SIMPLE, { verbose: true })
    const definition = definitions[0]
    expect(definition.trigger).toBe('subsec')
    expect(definition.description).toBe('seperator')
  })

  describe('variables', () => {
    it('extract variable location', () => {
      const { definitions } = parse(ULTI_SNIPPETS.VARIABLE_SIMPLE)
      const definition = definitions[0]
      expect(definition.placeholders[0]).toMatchObject({
        id: 1,
        description: 'argument',
      })
      expect(definition.placeholders[1]).toMatchObject({
        id: 2,
        description: '',
      })
    })

    it("can extract 'VISUAL' ", () => {
      const { definitions } = parse(ULTI_SNIPPETS.VISUAL)
      const definition = definitions[0]
      expect(definition.placeholders[0]).toMatchObject({
        id: 'UNI_VISUAL',
        description: 'code',
      })
    })
  })
})
