import {
  SnippetDefinition,
  GenerateOptions,
  SnippetPlaceholder,
  PlaceholderReplacement,
  UnisnipsGenerator,
  UNISNIPS_SPECIAL_HOLDER_NAMES,
} from '@unisnips/core'

function makeReplacements(placeholders: SnippetPlaceholder[]): PlaceholderReplacement[] {
  const replacements: PlaceholderReplacement[] = []
  placeholders.forEach(placeholder => {
    const { id, description } = placeholder
    let newDesc: string
    if (id in UNISNIPS_SPECIAL_HOLDER_NAMES) {
      if (id === 'UNI_VISUAL') {
        newDesc = '$TM_SELECTED_TEXT'
      }
    } else {
      newDesc = `$\{${id}${description ? `:${description}` : ''}\}`
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

function applyReplacements(def: SnippetDefinition, replacements: PlaceholderReplacement[]): string {
  const contentChars = Array.from(def.body)
  const reversedReplacements = replacements.slice()
  // will replace chars from end to begin,
  // so old start and end won't be affected by previous replacements
  reversedReplacements.sort((a, b) => {
    return b.placeholder.position.start - a.placeholder.position.start
  })
  reversedReplacements.forEach(replacement => {
    const { placeholder, replaceContent } = replacement
    if (replacement.type === 'string' && replaceContent) {
      const holderPos = placeholder.position
      contentChars.splice(holderPos.start, holderPos.end - holderPos.start, ...replaceContent)
    }
  })
  return contentChars.join('')
}

type VscodeSnippetItem = {
  prefix: string
  body: string[]
  description: string
}

export const generateSnippets: UnisnipsGenerator['generateSnippets'] = (
  defs: SnippetDefinition[],
  opts: GenerateOptions = {},
) => {
  const resultObj: { [key: string]: VscodeSnippetItem } = {}
  defs.forEach(def => {
    const replacements = makeReplacements(def.placeholders)
    const newBody = applyReplacements(def, replacements)
    const name = def.description || def.trigger
    resultObj[name] = {
      prefix: def.trigger,
      body: newBody.split('\n'),
      description: def.description,
    } as VscodeSnippetItem
  })
  return {
    content: JSON.stringify(resultObj, null, 2),
  }
}
