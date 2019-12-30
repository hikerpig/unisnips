/**
 * Convert snippet text file into logical units called Tokens.
 * Ports https://github.com/SirVer/ultisnips/blob/master/pythonx/UltiSnips/snippet/parsing/lexer.py
 */

/* eslint-disable @typescript-eslint/no-use-before-define */

import { TextPosition } from '../util/position'
import { pick } from '../util/util'
import { ExtensibleError } from '@bestminr/control-flow'
import { SnippetPlaceholder, TokenNode } from '@unisnips/core'

export class StopIteration extends ExtensibleError {}

/**
 * Helper class to make iterating over text easier.
 * A simplified char stream
 */
export class TextIterator {
  protected text: string
  protected line: number
  protected col: number

  protected textLineContents: string[]

  protected idx = 0
  /**
   * holds startPosition for parsing inside TabStop,
   * but will still start idx from 0
   */
  protected startPosition: TextPosition

  constructor(text: string, startPosition: TextPosition) {
    this.text = text
    this.textLineContents = text.split('\n')
    this.line = startPosition.line
    this.col = startPosition.column
    this.startPosition = startPosition
  }

  peek(len = 1) {
    if (len > 1) return this.text.substr(this.idx, len)
    else return this.text[this.idx]
  }

  /** return the next n characters */
  next(n = 1) {
    if (n === 1) return this.nextOne()

    const chars = []
    for (let i = 0; i < n; i++) {
      chars.push(this.nextOne())
    }
    return chars.join('')
  }

  /** roll back the stream n characters, won't return chars */
  rollback(n = 1) {
    if (n === 1) return this.rollbackOne()

    for (let i = 0; i < n; i++) {
      this.rollbackOne()
    }
  }

  /** return the next character */
  protected nextOne() {
    if (this.idx > this.text.length) {
      throw new StopIteration()
    }
    const rv = this.text[this.idx]
    if (this.text[this.idx] === '\n') {
      this.line += 1
      this.col = 0
    } else {
      this.col += 1
    }
    this.idx += 1
    return rv
  }

  protected rollbackOne() {
    if (this.idx < 0) {
      return
    }
    if (this.col <= 0) {
      this.line -= 1
      this.col = this.textLineContents[this.line].length - 1
    } else {
      this.col -= 1
    }
    this.idx -= 1
  }

  get position() {
    const startOffset = this.startPosition.offset || 0
    return new TextPosition(this.line, this.col, startOffset + this.idx)
  }
}

const CHARS = {
  digits: '0123456789'.split(''),
}

function parseIndexNumber(iter: TextIterator) {
  let rv = ''
  let peekedV = iter.peek()
  while (peekedV && CHARS.digits.includes(peekedV)) {
    rv += iter.next()
    peekedV = iter.peek()
  }
  return parseInt(rv)
}

export function parseTillClosingBrace(iter: TextIterator) {
  let braceDepth = 1
  const retChars = []
  while (true) {
    if (EscapeCharToken.startsWithChar(iter, '{}')) {
      retChars.push(iter.next(2))
    } else {
      const char = iter.next()
      if (char === '{') braceDepth += 1
      else if (char === '}') braceDepth -= 1

      if (braceDepth < 1) {
        break
      }
      retChars.push(char)
    }
  }
  return retChars.join('')
}

/**
 * Returns all chars till a non-escaped char is found.
 *
 * Will also consume the closing char, but and return it as second return value
 */
export function parseTillUnescapedChar(iter: TextIterator, str: string, validWhenEndOfText = false) {
  const retChars = []
  let char
  try {
    while (true) {
      const chars = str.split('')
      let escaped = false
      for (const c of chars) {
        char = c
        if (EscapeCharToken.startsWithChar(iter, char)) {
          retChars.push(iter.next(2))
          escaped = true
        }
      }
      if (!escaped) {
        char = iter.next()
        if (chars.includes(char)) {
          break
        } else {
        }
        retChars.push(char)
      }
    }
  } catch (error) {
    if (error instanceof StopIteration) {
      if (!validWhenEndOfText) {
        throw error
      }
    } else {
      throw error
    }
  }
  return [retChars.join(''), char]
}

type TokenStatics = {
  startsHere(iter: TextIterator, ...args: any[]): boolean
}

type TokenInitOpts = {
  indent?: TextPosition
  parent?: Token
}

/**
 * Represents a Token as parsed from a snippet definition.
 */
export abstract class Token {
  initialText = ''
  start: TextPosition
  end: TextPosition
  parent?: Token

  isTransformable = false
  // transform?: TransformationToken

  static startsHere(iter: TextIterator, ...args: any[]) {
    return false
  }

  constructor(iter: TextIterator, opts: TokenInitOpts = {}) {
    this.parent = opts.parent
    this.start = iter.position
    this.parse(iter, opts.indent)
    this.end = iter.position
  }

  protected abstract parse(iter: TextIterator, indent: TextPosition): void

  /**
   * will be serialized to TokenNode
   */
  get tokenType() {
    return 'Token'
  }

  getTokenNodeData() {
    return {}
  }

  toTokenNode(): TokenNode<any> {
    return {
      type: this.tokenType,
      position: {
        start: this.start.toUnistPosition(),
        end: this.end.toUnistPosition(),
      },
      data: this.getTokenNodeData(),
    }
  }
}

export class TabStopToken extends Token {
  static PATTERN = /^\$\{\d+[:}]?/

  isTransformable = true
  number: number
  /** if tabstop has ':', further marker construct will skip transformer */
  hasColon: boolean

  static startsHere(iter: TextIterator) {
    return this.PATTERN.test(iter.peek(10))
  }

  getTokenNodeData() {
    return { number: this.number }
  }

  get tokenType() {
    return 'TabStop'
  }

  protected parse(iter: TextIterator) {
    iter.next() // $
    iter.next() // {

    this.number = parseIndexNumber(iter)

    if (iter.peek() === ':') {
      this.hasColon = true
      iter.next()
    }
    this.initialText = parseTillClosingBrace(iter)
  }
}

export class VisualToken extends Token {
  // ${VISUAL}
  static PATTERN = /^\$\{VISUAL[:}\/]/

  static startsHere(iter: TextIterator) {
    return this.PATTERN.test(iter.peek(10))
  }

  isTransformable = true
  alternativeText = ''
  search: string
  replace: string
  options: any = null

  get tokenType() {
    return 'Visual'
  }

  toString() {
    return `VisualToken(${this.start},${this.end})`
  }

  protected parse(iter: TextIterator) {
    iter.next(8) // ${VISUAL

    if (iter.peek() === ':') {
      iter.next()
    }
    const [text, closingChar] = parseTillUnescapedChar(iter, '/}')
    this.alternativeText = unescape(text)

    if (closingChar === '/') {
      try {
        this.search = parseTillUnescapedChar(iter, '/')[0]
        this.replace = parseTillUnescapedChar(iter, '/')[0]
        this.options = parseTillClosingBrace(iter)
      } catch (error) {
        throw new Error("Invalid ${VISUAL} transformation! Forgot to escape a '/'?")
      }
    } else {
      this.search = null
      this.replace = null
    }
  }
}

// export class TransformationToken extends Token {
//   search: string
//   replace: string
//   options: any = null

//   static startsHere(iter: TextIterator) {
//     return iter.peek() === '/'
//   }

//   get tokenType() {
//     return 'Transformation'
//   }

//   getTokenNodeData() {
//     return pick(this, [
//       'number',
//       'search',
//       'replace',
//       'options',
//     ] as Array<keyof this>);
//   }

//   protected parse(iter: TextIterator) {
//     iter.next() // /

//     this.search = parseTillUnescapedChar(iter, '/')[0]
//     this.replace = parseTillUnescapedChar(iter, '/')[0]
//     this.options = parseTillClosingBrace(iter)
//   }
// }

export class MirrorToken extends Token {
  static PATTERN = /^\$\d+/

  static startsHere(iter: TextIterator) {
    return this.PATTERN.test(iter.peek(10))
  }

  number: number

  get tokenType() {
    return 'Mirror'
  }

  toString() {
    return `MirrorToken(${this.start.toString()},${this.end.toString()},${this.number})`
  }

  getTokenNodeData() {
    return { number: this.number }
  }

  protected parse(iter: TextIterator) {
    iter.next() // $
    this.number = parseIndexNumber(iter)
  }
}

/**
 * Represents UniSnips' builtin variable
 */
export class UniSnipsVariableToken extends Token {
  // static VALID_NAME_PATTERN = /[0-9A-Z_]/

  static startsHere(iter: TextIterator) {
    // $UNI_*
    return iter.peek(5) === '$UNI_'
  }

  name: string

  toString() {
    return `UniSnipsVariableToken(${this.start.toString()},${this.end.toString()},${this.name})`
  }

  protected parse(iter: TextIterator) {
    iter.next(5) // $UNI_
    const [restName] = parseTillUnescapedChar(iter, '$,\n./ ', true)
    this.name = 'UNI_' + restName
  }
}

export class EscapeCharToken extends Token {
  static startsHere(iter: TextIterator, charsOrIndent: any) {
    if (typeof charsOrIndent === 'string') {
      return this.startsWithChar(iter, charsOrIndent)
    }
  }

  static startsWithChar(iter: TextIterator, validEscapeChars = '{}\\$`') {
    // console.log('cha', validEscapeChars)
    const chars = iter.peek(2)
    return chars.length === 2 && chars[0] === '\\' && validEscapeChars.indexOf(chars[1]) > -1
  }

  get tokenType() {
    return 'EscapeChar'
  }

  protected parse(iter: TextIterator) {
    iter.next() // \
    this.initialText = iter.next()
  }
}

type ScriptType = SnippetPlaceholder['scriptInfo']['scriptType']

/**
 * There are various script types, but they are all wrapped by '`'
 *
 * - `ehco "unisnips"` , shell
 * - `!js console.log('hello')`, js
 * - `!p snip.rv = "hi"`, python
 */
export class ScriptCodeToken extends Token {
  static startsHere(iter: TextIterator) {
    return iter.peek() === '`'
  }

  scriptType: ScriptType
  scriptCode: string

  get tokenType() {
    return 'ScriptCode'
  }

  getTokenNodeData() {
    return {
      scriptType: this.scriptType,
      scriptCode: this.scriptCode,
    }
  }

  protected parse(iter: TextIterator) {
    iter.next() // `
    const nextChars = iter.peek(5)
    let scriptType: ScriptType
    if (nextChars.substr(0, 2) === '! ') {
      scriptType = 'shell'
      iter.next(2)
    } else if (nextChars.substr(0, 3) === '!p ') {
      scriptType = 'python'
      iter.next(3)
    } else if (nextChars.substr(0, 3) === '!v ') {
      scriptType = 'vim'
      iter.next(3)
    } else if (nextChars.substr(0, 4) === '!js ') {
      scriptType = 'js'
      iter.next(4)
    }
    if (scriptType) {
      this.scriptType = scriptType
      const [content] = parseTillUnescapedChar(iter, '`')
      this.scriptCode = content
    }
  }
}

export class EndOfTextToken extends Token {
  get tokenType() {
    return 'EndOfText'
  }

  protected parse() {
    // nothing
  }
}

export type TokenCtor = new (iter: TextIterator, opts: TokenInitOpts) => Token

export type TokenClass = TokenCtor & TokenStatics

export function tokenize(
  text: string,
  indent: TextPosition,
  position: TextPosition,
  allowedTokens: TokenClass[],
) {
  const iter = new TextIterator(text, position)
  const tokens: Token[] = []
  try {
    while (true) {
      let doneSomething = false
      for (const tokenCtor of allowedTokens) {
        if (tokenCtor.startsHere(iter, indent)) {
          const token = new tokenCtor(iter, { indent })
          tokens.push(token)
          doneSomething = true

          // if (token.isTransformable && token.transform) {
          //   tokens.push(token.transform)
          // }
          break
        } else {
        }
      }

      if (!doneSomething) {
        iter.next()
      }
    }
  } catch (error) {
    if (error instanceof StopIteration) {
      return tokens
    }
    throw error
  }
  return tokens
}
