import * as fs from 'fs'
import * as path from 'path'
import omit from 'lodash.omit'
import {
  SnippetDefinition,
  ParseOptions,
  SnippetPlaceholder,
  PlaceholderTransform,
} from '@unisnips/core'
import {
  VisualToken,
  MirrorToken,
  TabStopToken,
  ScriptCodeToken,
  UniSnipsVariableToken,
} from './tokenizer'
import { Marker, TabStop, SnippetInstance } from '../marker'
import { parseUltiSnips } from './ultisnips'
import { TextPosition } from '../util/position'

interface UltiSnippet extends SnippetDefinition {
  code: Array<string>
}

enum ReadState {
  BLANK,
  SNIPPET_CONTENT,
}

const PRIORITY_PATTERN = /^priority (-?\d+)$/
const EXTENDS_PATTERN = /^extends (.+)?$/
const SNIPPET_HEAD_PATTERN = /^snippet\s+(.*)\s+"(.*)"(\s+(\w+)\s*)?$/
const END_SNIPPET_PATTERN = /^endsnippet\s*$/

function parseSnippets(snippetCode: string, opts: ParseOptions): UltiSnippet[] {
  const { snippetsFilePath, verbose } = opts
  const list: UltiSnippet[] = []
  let currentSnippet: UltiSnippet
  let state: ReadState = ReadState.BLANK
  let currentPriority = 0

  snippetCode.split(/\n/).forEach((line, index) => {
    if (state == ReadState.BLANK) {
      if (/^\s*$/.test(line)) {
        return //=> blank line, nothing to do
      }

      if (/^\s*#.*$/.test(line)) {
        return //=> comment line, nothing to do.
      }

      const priorityMatch = PRIORITY_PATTERN.exec(line)
      if (priorityMatch) {
        currentPriority = parseInt(priorityMatch[1])
        return // priority for snippets.
      }

      const extendsMatch = EXTENDS_PATTERN.exec(line)
      if (extendsMatch) {
        const typeExtended = extendsMatch[1]
        if (opts.onExtends) {
          const extendedTypes = [typeExtended]
          try {
            const extraSnippets = opts.onExtends<UltiSnippet>(
              {
                extendedTypes,
                snippetsFilePath: opts.snippetsFilePath,
              },
              {
                parseForDefinitions(innerContent, innerOpts = {}) {
                  return parseSnippets(innerContent, innerOpts)
                },
              },
            )
            list.push(...extraSnippets)
          } catch (error) {
            console.error(`Error in onExtends ${extendedTypes}`)
            if (verbose) {
              console.error(error)
            }
          }
        } else {
          if (snippetsFilePath) {
            const typeExtendedSnippetFile = path.join(path.dirname(snippetsFilePath), typeExtended) + '.snippets'
            try {
              const content = fs.readFileSync(typeExtendedSnippetFile, 'utf-8')
              const extraSnippets = parseSnippets(content, {
                ...opts,
                snippetsFilePath: typeExtendedSnippetFile,
              })

              list.push(...extraSnippets)
            } catch (e) {
              console.error(
                `Unable to parse: ${typeExtendedSnippetFile} required via ${snippetsFilePath}:${index +
                  1} : ${line}`,
                verbose ? e : '',
              )
            }
          }
        }

        return // extended types
      }

      const m = SNIPPET_HEAD_PATTERN.exec(line)
      if (m) {
        const start = {
          line: index,
          column: 0,
        }
        currentSnippet = {
          trigger: m[1],
          description: m[2],
          code: [],
          body: '',
          placeholders: [],
          priority: currentPriority,
          flags: m[4],
          position: {
            start,
            end: { ...start },
          },
        }

        list.push(currentSnippet)
        state = ReadState.SNIPPET_CONTENT

        return //=> done
      } else {
        // console.error('Error at line: ' + (index + 1) + ', unable to parse: ' + line)
      }
    }

    if (state == ReadState.SNIPPET_CONTENT) {
      if (END_SNIPPET_PATTERN.test(line)) {
        Object.assign(currentSnippet.position.end, {
          line: index,
          column: 0,
        })
        currentSnippet.body = currentSnippet.code.join('\n')
        state = ReadState.BLANK
        return // => done reading snippets
      }

      currentSnippet.code.push(line)
    }
  })

  return list
}

function calcMarkerPositionInSnippet(def: SnippetDefinition, marker: Marker) {
  const defStartPosition = TextPosition.fromUnistPoint(def.position.start)
  // a path from top marker - usually a SnippetInstance - to the one in params
  const markerPath = []
  let parentMarker = marker
  do {
    if (!(parentMarker instanceof SnippetInstance)) {
      markerPath.unshift(parentMarker)
    }
    const parent = parentMarker.parent
    parentMarker = parent
  } while (parentMarker)

  let curMarker = markerPath.shift()
  let colOffset = 0
  let lineOffset = 0
  while (curMarker) {
    lineOffset = Math.max(lineOffset, curMarker.start.line - defStartPosition.line)
    const parent = curMarker.parent
    if (parent && parent instanceof TabStop) {
      colOffset += `\${${parent.number.toString()}:`.length + parent.initialText.indexOf('$')
    } else {
      colOffset += curMarker.start.column
    }
    // console.log('start', JSON.stringify(curMarker.start), 'end', JSON.stringify(curMarker.end))
    curMarker = markerPath.shift()
  }

  // console.log('marker path', markerPath.length, 'colDiff', colDiff)
  const start = defStartPosition.clone()
  start.column += colOffset
  start.line += lineOffset
  if (marker.token) {
    start.offset = marker.token.start.offset
  }
  const end = new TextPosition(start.line, start.column + (marker.end.column - marker.start.column))
  if (marker.token) {
    end.offset = marker.token.end.offset
  }
  return {
    start,
    end,
  }
}

/**
 * Detect the placeholders names from a UltiSnips template. The placeholders
 * are surrounded by brackets for easier replacement.
 */
function detectPlaceholders(def: SnippetDefinition): SnippetPlaceholder[] {
  const result: SnippetPlaceholder[] = []
  const markerIdMap = new Map<Marker, any>()
  const { pairs } = parseUltiSnips(def)
  pairs.forEach((pair, i) => {
    const { token, parent, marker } = pair
    // console.log('token', token)
    let placeholder: SnippetPlaceholder
    let partialData: Omit<SnippetPlaceholder, 'position' | 'bodyPosition' | 'id'>
    if (token instanceof VisualToken) {
      partialData = {
        valueType: 'variable',
        variable: {
          type: 'builtin',
          name: 'UNI_SELECTED_TEXT',
        },
      }
    } else if (token instanceof MirrorToken || token instanceof TabStopToken) {
      partialData = {
        valueType: 'tabstop',
        index: token.number,
        description: token.initialText,
      }
      if ('transform' in marker) {
        if (marker.transform) {
          partialData.transform = marker.transform.getTokenNodeData() as PlaceholderTransform
          partialData.description = ''
        }
      }
    } else if (token instanceof ScriptCodeToken) {
      partialData = {
        valueType: 'script',
        scriptInfo: {
          scriptType: token.scriptType,
          code: token.scriptCode,
        },
      }
    } else if (token instanceof UniSnipsVariableToken) {
      partialData = {
        valueType: 'variable',
        variable: {
          type: 'builtin',
          name: token.name,
        },
      }
    }
    // else if (token instanceof TransformationToken) {
    //   console.log('trans token', token)
    // }

    if (partialData) {
      // const tokenNode = token.toTokenNode()
      const markerNode = marker.toTokenNode()
      const p = calcMarkerPositionInSnippet(def, marker)
      const bodyPosition = {
        start: p.start.toUnistPosition(),
        end: p.end.toUnistPosition(),
      }
      placeholder = {
        ...partialData,
        id: i,
        // position: {
        //   start: token.start.offset,
        //   end: token.end.offset,
        // },
        bodyPosition,
        extra: {
          marker: markerNode,
        },
      }

      markerIdMap.set(marker, placeholder.id)
      if (marker.parent) {
        const parentId = markerIdMap.get(marker.parent)
        if (parentId) {
          placeholder.parentId = parentId
        }
      }

      result.push(placeholder)
    }
  })
  return result
}

export function parse(input: string, opts: ParseOptions = {}) {
  const originSnippets = parseSnippets(input, opts)
  const snippets: SnippetDefinition[] = []
  originSnippets.forEach(ultiSnippet => {
    const snippet: SnippetDefinition = omit(ultiSnippet, ['code'])
    const placeholders = detectPlaceholders(ultiSnippet)
    placeholders.forEach(placeholder => {
      snippet.placeholders.push(placeholder)
    })

    snippets.push(snippet)
  })
  return {
    definitions: snippets,
  }
}
