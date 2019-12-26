import {
  SnippetDefinition,
  GenerateOptions,
  SnippetPlaceholder,
  PlaceholderReplacement,
  UnisnipsGenerator,
  applyReplacements,
} from '@unisnips/core'

import CSON from 'cson'

function makeReplacements(placeholders: SnippetPlaceholder[]): PlaceholderReplacement[] {
  const replacements: PlaceholderReplacement[] = []
  let maxIndex = 0
  placeholders.forEach(placeholder => {
    if (placeholder.valueType === 'positional') {
      maxIndex = Math.max(maxIndex, placeholder.index)
    }
  })
  let variableOffset = 0
  placeholders.forEach(placeholder => {
    const { valueType, description, index } = placeholder
    let newDesc: string
    if (valueType === 'positional') {
      newDesc = `$\{${index}${description ? `:${description}` : ''}\}`
    } else if (valueType === 'variable') {
      console.warn('[atom] variable is not supported')
      variableOffset++
      const mockedIndex = variableOffset + maxIndex
      newDesc = `$\{${mockedIndex}${description ? `:${description}` : ''}\}`
    } else if (valueType === 'script') {
      console.warn('[atom] script placeholder is not supported')
    }
    const replacement: PlaceholderReplacement = {
      type: 'string',
      placeholder,
      replaceContent: newDesc,
    }
    replacements.push(replacement)
  })
  return replacements
}

type AtomSnippetItem = {
  prefix: string
  body: string
}

export const generateSnippets: UnisnipsGenerator['generateSnippets'] = (
  defs: SnippetDefinition[],
  opts: GenerateOptions = {},
) => {
  const resultObj: { [key: string]: AtomSnippetItem } = {}
  defs.forEach(def => {
    const replacements = makeReplacements(def.placeholders)
    const newBody = applyReplacements(def, replacements)
    const name = def.description || def.trigger
    resultObj[name] = {
      prefix: def.trigger,
      body: newBody,
    } as AtomSnippetItem
  })

  return {
    content: CSON.stringify(resultObj, null, 2),
  }
}
