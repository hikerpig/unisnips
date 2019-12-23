import * as fs from 'fs'
import * as path from 'path'
import { SnippetDefinition, ParseOptions, SnippetPlaceholder } from '@unisnips/core'
import omit from 'lodash.omit'

interface UltiSnippet extends SnippetDefinition {
  code: Array<string>
  /** aka 'options' */
  flags: string
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
        if (snippetsFilePath) {
          const typeExtended = extendsMatch[1]
          const typeExtendedSnippetFile =
            path.join(path.dirname(snippetsFilePath), typeExtended) + '.snippets'
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

        return // extended types
      }

      const m = SNIPPET_HEAD_PATTERN.exec(line)
      if (m) {
        currentSnippet = {
          trigger: m[1],
          description: m[2],
          code: [],
          body: '',
          placeholders: [],
          priority: currentPriority,
          flags: m[4],
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
        currentSnippet.body = currentSnippet.code.join('\n')
        state = ReadState.BLANK
        return // => done reading snippets
      }

      currentSnippet.code.push(line)
    }
  })

  return list
}

/**
 * Detect the placeholders names from a UltiSnips template. The placeholders
 * are surrounded by brackets for easier replacement.
 */
function detectPlaceholders(body: string): SnippetPlaceholder[] {
  const result: SnippetPlaceholder[] = []
  const SHORT_VARIABLE_RE = /\$(\d+)/
  const FULL_VARIABLE_RE = /\$\{(\d+)\:(.*?)\}/
  const VISUAL_VARIABLE_RE = /\$\{VISUAL\:?(.*?)\}/

  let bodyOffset = 0
  let content = body
  let matches: RegExpExecArray | null

  const contentForword = (offset: number) => {
    content = content.slice(offset)
    bodyOffset += offset
  }

  const moveToNextPossiblePlaceholder = () => {
    const pos = content.indexOf('$')
    if (pos > -1) {
      contentForword(pos)
      return true
    }
    return false
  }

  do {
    const hasPossibleVariable = moveToNextPossiblePlaceholder()
    if (!hasPossibleVariable) break

    const nextChar = content[1]
    const partialData: Pick<SnippetPlaceholder, 'id' | 'description'> = {
      id: 0,
      description: '',
    }
    let matchedStr = ''

    if (nextChar === '{') {
      if (VISUAL_VARIABLE_RE.test(content)) {
        matches = VISUAL_VARIABLE_RE.exec(content)
        if (matches) {
          const description = matches[1] || ''
          matchedStr = matches[0]
          partialData.id = 'UNI_VISUAL'
          partialData.description = description
        }
      } else {
        matches = FULL_VARIABLE_RE.exec(content)
        if (matches) {
          matchedStr = matches[0]
          partialData.id = parseInt(matches[1])
          partialData.description = matches[2]
        }
      }
    } else if (SHORT_VARIABLE_RE.test(content)) {
      matches = SHORT_VARIABLE_RE.exec(content)
      if (matches) {
        matchedStr = matches[0]
        partialData.id = parseInt(matches[1])
      }
    }
    if (matchedStr) {
      result.push({
        ...partialData,
        position: {
          start: bodyOffset,
          end: bodyOffset + matchedStr.length,
        },
      })
      contentForword(matchedStr.length)
    } else {
      contentForword(1)
    }
  } while (true)

  return result
}

export function parse(input: string, opts: ParseOptions = {}) {
  const originSnippets = parseSnippets(input, opts)
  const snippets: SnippetDefinition[] = []
  originSnippets.forEach(ultiSnippet => {
    const snippet: SnippetDefinition = omit(ultiSnippet, ['code'])
    const placeholders = detectPlaceholders(ultiSnippet.body)
    placeholders.forEach(placeholder => {
      snippet.placeholders.push(placeholder)
    })
    // console.log('placeholders', placeholders)

    snippets.push(snippet)
  })
  return {
    definitions: snippets,
  }
}
