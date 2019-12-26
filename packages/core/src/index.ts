import {
  ParseOptions,
  ParseResult,
  GenerateOptions,
  SnippetDefinition,
  GenerateResult,
} from './type'

export * from './type'

import { applyReplacements } from './replacement'

export { applyReplacements }

export interface UnisnipsParser {
  parse(content: string, opts?: ParseOptions): ParseResult
}

export interface UnisnipsGenerator {
  generateSnippets(definitions: SnippetDefinition[], opts?: GenerateOptions): GenerateResult
}
