import {
  SnippetDefinition,
  GenerateOptions,
  SnippetPlaceholder,
  PlaceholderReplacement,
  UnisnipsGenerator,
  applyReplacements,
} from '@unisnips/core'

/**
 * Map UniSnips variables to vscode builtin variable
 */
const UNI_BUILTIN_VARIABLE_VSCODE_MAP: { [key: string]: string } = {
  UNI_SELECTED_TEXT: '$TM_SELECTED_TEXT',
  UNI_FILENAME: '$TM_FILENAME',
  UNI_FILENAME_BASE: '$TM_FILENAME_BASE',
  UNI_DIRECTORY: '$TM_DIRECTORYH',
  UNI_FILEPATH: '$TM_FILEPATH',
  UNI_CURRENT_YEAR: '$CURRENT_YEAR',
}

function makeReplacements(placeholders: SnippetPlaceholder[]): PlaceholderReplacement[] {
  const replacements: PlaceholderReplacement[] = []
  placeholders.forEach(placeholder => {
    const { valueType, variable, description, index } = placeholder
    let newDesc: string
    if (valueType === 'tabstop') {
      if (placeholder.transform) {
        const transform = placeholder.transform
        const transformStr = ['', transform.search, transform.replace, transform.options].join('/')
        newDesc = `$\{${index}${transformStr}\}`
      } else {
        newDesc = `$\{${index}${description ? `:${description}` : ''}\}`
      }
    } else if (valueType === 'variable') {
      if (variable.type === 'builtin') {
        newDesc = variable.name
        if (UNI_BUILTIN_VARIABLE_VSCODE_MAP[variable.name]) {
          newDesc = UNI_BUILTIN_VARIABLE_VSCODE_MAP[variable.name]
        }
      }
    } else if (valueType === 'script') {
      console.warn('script placeholder is not supported')
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
