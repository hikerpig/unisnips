import {
  ParseOptions,
  ParseResult,
  GenerateOptions,
  SnippetDefinition,
  GenerateResult,
} from './type'

export * from './type'

export interface UnisnipsParser {
  parse(content: string, opts?: ParseOptions): ParseResult
}

export interface UnisnipsGenerator {
  generateSnippets(definitions: SnippetDefinition[], opts?: GenerateOptions): GenerateResult
}