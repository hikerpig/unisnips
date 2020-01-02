import {
  SnippetDefinition,
  GenerateOptions,
  UnisnipsGenerator,
  SnippetPlaceholder,
  PlaceholderReplacement,
  applyReplacements,
} from '@unisnips/core'

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
      console.warn('[sublime] variable is not supported')
      variableOffset++
      const mockedIndex = variableOffset + maxIndex
      newDesc = `$\{${mockedIndex}${description ? `:${description}` : ''}\}`
    } else if (valueType === 'script') {
      console.warn('[sublime] script placeholder is not supported')
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



type SublimeSnippetItem = {
  tabTrigger: string
  content: string
  description: string
}

export const generateSnippets: UnisnipsGenerator['generateSnippets'] = (
  defs: SnippetDefinition[],
  opts: GenerateOptions = {},
) => {
  const results: string[] = []
  defs.forEach(def => {
    const replacements = makeReplacements(def.placeholders)
    const newBody = applyReplacements(def, replacements)
    const sublimeSnippet: SublimeSnippetItem = {
      tabTrigger: def.trigger,
      content: newBody,
      description: def.description,
    }
    const str = `
<snippet>
  <content><![CDATA[
${sublimeSnippet.content}
  ]]></content>
  <tabTrigger>${sublimeSnippet.tabTrigger}</tabTrigger>
  <description>${sublimeSnippet.description}</description>
</snippet>
    `
    results.push(str)
  })
  return {
    content: results.join('\n'),
  }
}
