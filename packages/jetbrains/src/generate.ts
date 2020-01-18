import path from 'path'
import {
  SnippetDefinition,
  GenerateOptions,
  SnippetPlaceholder,
  PlaceholderReplacement,
  UnisnipsGenerator,
  applyReplacements,
} from '@unisnips/core'

type ResultPair = {
  variable: JetBrainsVariable
  replacement: PlaceholderReplacement
}

function detectVariableReplacements(placeholders: SnippetPlaceholder[]): ResultPair[] {
  const resultPairs: ResultPair[] = []
  placeholders.forEach(placeholder => {
    const { valueType, variable, description, index } = placeholder
    let newDesc: string
    let jbVariable: JetBrainsVariable
    if (valueType === 'positional') {
      // TODO: transform ?
      if (placeholder.transform) {
        const transform = placeholder.transform
        const transformStr = ['', transform.search, transform.replace, transform.options].join('/')
        newDesc = `$\{${index}${transformStr}\}`
      } else {
        newDesc = `$${index}$`
        jbVariable = {
          name: index.toString(),
          defaultValue: index.toString(),
          alwaysStopAt: true,
        }
      }
    } else if (valueType === 'variable') {
      // if (variable.type === 'builtin') {
      //   newDesc = variable.name
      // }
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

type XMLAttribute = {
  name: string
  value: string | boolean | number
}

type XMLNode = {
  tagName: string
  attributes: XMLAttribute[]
  children?: XMLNode[]
}

function indent(str: string, cols: number) {
  let prefix = ''
  for (let i = 0; i < cols; i++) {
    prefix += ' '
  }
  return str
    .split('\n')
    .map(l => {
      return prefix + l
    })
    .join('\n')
}

function nodeTreeToXml(root: XMLNode, level = 0): string {
  const attrStr = root.attributes
    .filter(attr => attr.value !== undefined)
    .map(attr => {
      return `${attr.name}="${attr.value.toString()}"`
    })
    .join(' ')
  const childrenStr = root.children
    ? root.children
        .map(child => {
          return nodeTreeToXml(child, 1)
        })
        .join('\n')
    : ''

  if (childrenStr) {
    return indent(
      `<${root.tagName} ${attrStr}>
${childrenStr}
</${root.tagName}>`,
      level * 2,
    )
  } else {
    return indent(`<${root.tagName} ${attrStr} />`, level * 2)
  }
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

function attr(name: string, value: string | boolean) {
  return { name, value }
}

function makeTag(name: string, attrs: XMLAttribute[], children?: XMLNode[]): XMLNode {
  return {
    tagName: name,
    attributes: attrs,
    children,
  }
}

/* eslint-disable prettier/prettier */
function snippetItemToXml(item: JetBrainsSnippetItem) {
  const uniqueVariableMap: {[key: string]: JetBrainsVariable} = {}
  if (item.variables) {
    item.variables.forEach((variable) => {
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
