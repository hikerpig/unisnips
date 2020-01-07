import { SnippetDefinition } from '@unisnips/core'

import { TextPosition } from '../util/position'
import {
  tokenize,
  TokenClass,
  TabStopToken,
  Token,
  EscapeCharToken,
  VisualToken,
  MirrorToken,
  ScriptCodeToken,
} from './tokenizer'
import {
  Marker,
  MarkerClass,
  TabStop,
  Mirror,
  SnippetInstance,
  Visual,
  ScriptCode,
} from '../marker'

/**
 * Turns 'text' into a stream of tokens and creates the text objects from
 * those tokens that are mentioned in 'tokenMarkerMap' assuming the
 * current 'indent'
 *
 * The 'allowedTokensInText' define which tokens will be recognized
 * in 'text' while 'allowedTokensInTabstops' are the tokens that
 * will be recognized in TabStop placeholder text.
 */
export function tokenizeSnippetText(
  snippetInstance: Marker,
  text: string,
  indent: TextPosition,
  allowedTokensInText: TokenClass[],
  allowedTokensInTabstops: TokenClass[],
  tokenMarkerMap?: Map<TokenClass, MarkerClass>,
) {
  type ResultPair = { parent: Marker; token: Token; marker: Marker }
  const pairs: ResultPair[] = []
  const seenTabstops: any = {}

  const doParse = (parent: Marker, innerText: string, allowedTokens: TokenClass[]) => {
    const tokens = tokenize(innerText, indent, parent.start, allowedTokens)
    for (const token of tokens) {
      const item: ResultPair = { parent, token, marker: null }
      pairs.push(item)
      if (token instanceof TabStopToken) {
        const ts = new TabStop({ parent, token })
        item.marker = ts
        seenTabstops[token.number] = ts
        doParse(ts, token.initialText, allowedTokensInTabstops)
      } else if (tokenMarkerMap) {
        const ctor = tokenMarkerMap.get(token.constructor as any)
        if (ctor) {
          item.marker = new ctor({ parent, token })
        }
      }
    }
  }

  doParse(snippetInstance, text, allowedTokensInText)
  // console.log('pairs', pairs, seenTabstops)

  return {
    pairs,
    seenTabstops,
  }
}

const ALLOWED_TOKENS: TokenClass[] = [
  EscapeCharToken,
  VisualToken,
  TabStopToken,
  MirrorToken,
  ScriptCodeToken,
]

const TOKEN_MARKER_MAP = new Map()
TOKEN_MARKER_MAP.set(VisualToken, Visual)
TOKEN_MARKER_MAP.set(MirrorToken, Mirror)
TOKEN_MARKER_MAP.set(TabStopToken, TabStop)
TOKEN_MARKER_MAP.set(ScriptCodeToken, ScriptCode)

function definitionToSnippetInstance(snip: SnippetDefinition) {
  const { position } = snip
  const start = position.start ? TextPosition.fromUnistPoint(position.start) : null
  const end = position.end ? TextPosition.fromUnistPoint(position.end) : null
  const snipInstance = new SnippetInstance({
    parent: null,
    start,
    end,
  })
  return snipInstance
}

/**
 * WIP: won't need ultisnips text objects by now
 * @private
 */
export function parseUltiSnips(snip: SnippetDefinition) {
  const snipInstance = definitionToSnippetInstance(snip)

  const result = tokenizeSnippetText(
    snipInstance,
    snip.body,
    snipInstance.start,
    ALLOWED_TOKENS,
    ALLOWED_TOKENS,
    TOKEN_MARKER_MAP,
  )

  return result
}

export function parseUltiSnipsTokens(snip: SnippetDefinition): Token[] {
  const snipInstance = definitionToSnippetInstance(snip)

  const result = tokenizeSnippetText(
    snipInstance,
    snip.body,
    snipInstance.start,
    ALLOWED_TOKENS,
    ALLOWED_TOKENS,
  )

  const tokens = result.pairs.map(item => item.token)
  // console.log('tokens', tokens)

  return tokens
}
