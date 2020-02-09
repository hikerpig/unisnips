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
  // TransformationToken,
  UniSnipsVariableToken,
} from './tokenizer'

import {
  Marker,
  MarkerClass,
  TabStop,
  Mirror,
  SnippetInstance,
  Visual,
  ScriptCode,
  TransformableMarker,
  UniSnipsVariable,
} from '../marker'

type ResultPair = { parent: Marker; token: Token; marker: Marker | TransformableMarker }

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
  const pairs: ResultPair[] = []
  const seenTabstops: any = {}

  const doParse = (parent: Marker, innerText: string, allowedTokens: TokenClass[]) => {
    // newStart is different with UltiSnips,
    // coz we are focusing on parsing rather than editing,
    // so we tend to keep track of original position,
    // but UltiSnips treat `text_object.start` as the position in interpreted text during editing
    const newStart = parent.start.add(new TextPosition(0, parent.innerContentOffset))
    newStart.offset = (parent.start.offset || 0) + parent.innerContentOffset

    const tokens = tokenize(innerText, indent, newStart, allowedTokens)
    for (const token of tokens) {
      const item: ResultPair = { parent, token, marker: null }
      pairs.push(item)
      if (token instanceof TabStopToken) {
        const ts = new TabStop({ parent, token })
        item.marker = ts
        seenTabstops[token.number] = ts
        if (ts.initialText) {
          doParse(ts, ts.initialText, allowedTokensInTabstops)
        }
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
  UniSnipsVariableToken,
  VisualToken,
  TabStopToken,
  MirrorToken,
  ScriptCodeToken,
]

function definitionToSnippetInstance(snip: SnippetDefinition) {
  const { position } = snip
  // SnippetInstance's start and end should be relative to snip.body,
  // so we should remove snippet head and end
  const start = position.start ? TextPosition.fromUnistPoint(position.start) : null
  if (position.start) {
    start.line += 1
  }

  const end = position.end ? TextPosition.fromUnistPoint(position.end) : null
  if (position.end) {
    const bodyContents = snip.body.split('\n')
    const bodyLastLine = bodyContents[bodyContents.length - 1]
    end.line -= 1
    end.column = bodyLastLine.length
  }

  const snipInstance = new SnippetInstance({
    parent: null,
    start,
    end,
  })
  return snipInstance
}

const TOKEN_MARKER_PAIRS: Array<[TokenClass, MarkerClass]> = [
  [VisualToken, Visual],
  [MirrorToken, Mirror],
  [TabStopToken, TabStop],
  [ScriptCodeToken, ScriptCode],
  [UniSnipsVariableToken, UniSnipsVariable],
]

const TOKEN_MARKER_MAP = new Map<TokenClass, MarkerClass>()

TOKEN_MARKER_PAIRS.forEach(([tokenCls, markerCls]) => {
  TOKEN_MARKER_MAP.set(tokenCls, markerCls)
})

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

  // result.pairs.forEach((pair: ResultPair) => {
  //   const { token, parent } = pair
  //   if (token instanceof TabStop) {
  //     if (token && parent.token) {
  //       token.parent = parent.token
  //     }
  //   }
  //   // console.log(null, null, parent)
  // })

  const tokens = result.pairs.map(item => item.token)
  // console.log('tokens', tokens)

  return tokens
}
