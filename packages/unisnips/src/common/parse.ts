import {
  UnisnipsGenerator,
  ParseOptions,
  ParseResult,
  SnippetDefinition,
  UnisnipsParser,
} from '@unisnips/core'

type UnisnipsParseOptions = ParseOptions & {
  parser: UnisnipsParser
}

export function parse(str: string, opts: UnisnipsParseOptions): ParseResult {
  const definitions: SnippetDefinition[] = []
  const parseResult = opts.parser.parse(str, opts)
  if (parseResult.definitions) {
    parseResult.definitions.forEach(def => definitions.push(def))
  }
  return {
    definitions,
  }
}
