import path from 'path'
import {
  SnippetDefinition,
  GenerateOptions,
  SnippetPlaceholder,
  PlaceholderReplacement,
  UnisnipsGenerator,
  applyReplacements,
} from '@unisnips/core'

import { makeTag, attr, nodeTreeToXml, indent } from './util/xml'

type ReplacementResultPair = {
  variable: JetBrainsVariable
  replacement: PlaceholderReplacement
}

/**
 * Map UniSnips variables to jetbrains builtin variable
 */
const UNI_BUILTIN_VARIABLE_JB_MAP: { [key: string]: string } = {
  UNI_SELECTED_TEXT: '$SELECTION$',
}

function detectVariableReplacements(placeholders: SnippetPlaceholder[]): ReplacementResultPair[] {
  const resultPairs: ReplacementResultPair[] = []
  placeholders.forEach(placeholder => {
    const { valueType, variable, description, index } = placeholder
    let newDesc: string
    let jbVariable: JetBrainsVariable
    if (valueType === 'positional') {
      if (placeholder.transform) {
        console.warn('[jetbrains] placeholder transform is not supported')
      } else {
        const vName = `TS_${index}`
        newDesc = `$${vName}$`
        jbVariable = {
          name: vName,
          defaultValue: (description || '').toString(),
          alwaysStopAt: true,
        }
      }
    } else if (valueType === 'variable') {
      if (variable.type === 'builtin') {
        const matchedName = UNI_BUILTIN_VARIABLE_JB_MAP[variable.name]
        if (matchedName) {
          newDesc = matchedName
          jbVariable = {
            name: matchedName,
            defaultValue: '',
          }
        }
      }
    } else if (valueType === 'script') {
      console.warn('[jetbrains] script placeholder is not supported')
    }
    if (jbVariable) {
      const replacement: PlaceholderReplacement = {
        type: 'string',
        placeholder,
        replaceContent: newDesc,
      }
      resultPairs.push({
        variable: jbVariable,
        replacement,
      })
    }
  })
  return resultPairs
}

type JetBrainsVariable = {
  name: string
  expression?: string
  defaultValue: string
  alwaysStopAt?: boolean
}

type JetBrainsSnippetItem = {
  name: string
  value: string
  description: string
  variables?: JetBrainsVariable[]
  contexts?: string[]
}

const JB_LANG_MAP: { [key: string]: string } = {
  other: 'OTHER',
  sh: 'SHELL_SCRIPT',
  bash: 'SHELL_SCRIPT',
  javascript: 'JAVA_SCRIPT',
  typescript: 'TypeScript',
  css: 'CSS',
  python: 'Python',
  xml: 'XML',
  html: 'HTML',
  sql: 'SQL',
}

/* eslint-disable prettier/prettier */
function snippetItemToXml(item: JetBrainsSnippetItem) {
  const uniqueVariableMap: {[key: string]: JetBrainsVariable} = {}
  if (item.variables) {
    item.variables.forEach((variable) => {
      if (variable.name === UNI_BUILTIN_VARIABLE_JB_MAP.UNI_SELECTED_TEXT) return
      const k = [variable.name, variable.defaultValue, variable.expression].join('_')
      if (!uniqueVariableMap[k]) {
        uniqueVariableMap[k] = variable
      }
    })
  }

  const variableNodes = Object.values(uniqueVariableMap).map(variable => {
    return makeTag('variable', [
      attr('name', variable.name),
      attr('expression', variable.expression),
      attr('defaultValue', variable.defaultValue),
      attr('alwaysStopAt', variable.alwaysStopAt),
    ])
  })

  const contextNodes = (item.contexts || []).map(contextName => {
    return makeTag(
      'context',
      [],
      [makeTag('option', [attr('name', contextName), attr('value', 'true')])],
    )
  })

  const escapedValue = item.value.replace(/\n/g, '&#10;')
  const template = makeTag(
    'template',
    [attr('name', item.name), attr('description', item.description), attr('value', escapedValue)],
    [...variableNodes, ...contextNodes],
  )
  return nodeTreeToXml(template)
}
/* eslint-enable prettier/prettier */

export const generateSnippets: UnisnipsGenerator['generateSnippets'] = (
  defs: SnippetDefinition[],
  opts: GenerateOptions = {},
) => {
  const segs: string[] = []
  let langName: string
  let groupName = 'unisnips'
  if (opts.snippetsFilePath) {
    langName = path.basename(opts.snippetsFilePath).replace(/\..*/, '')
    groupName = `unisnips-${langName}`
  }

  defs.forEach(def => {
    const pairs = detectVariableReplacements(def.placeholders)
    const replacements = pairs.map(o => o.replacement)
    const variables: JetBrainsVariable[] = []
    pairs.forEach(({ variable }) => {
      variables.push(variable)
    })
    const newBody = applyReplacements(def, replacements)
    const item: JetBrainsSnippetItem = {
      name: def.trigger,
      value: newBody,
      description: def.description,
      variables,
    }
    let jbContextName = JB_LANG_MAP.other
    if (langName) {
      jbContextName = JB_LANG_MAP[langName]
    }
    if (jbContextName) {
      item.contexts = [jbContextName]
    }
    segs.push(snippetItemToXml(item))
  })
  const snippetsContent = segs.join('\n')
  const content = [
    `<templateSet group="${groupName}">`,
    `${indent(snippetsContent, 2)}`,
    '</templateSet>',
  ].join('\n')
  return {
    content,
  }
}
