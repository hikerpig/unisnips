import { SnippetPlaceholder, PlaceholderReplacement } from './type'

/**
 * Interprete placeholder with valueType === 'script' and certain 'scriptInfo.scriptType',
 * 'js'/'shell'/'python' should be interpreted by different interpreter
 */
export abstract class PlaceholderScriptInterpreter {
  abstract interprete(opts: InterpreteOptions): InterpreteResult
}

/**
 * Pass a placeholder to be interpreted,
 * with some extra 'data' provided, a sketchy notation,
 * TODO: should be completed when implementating first real interpreter
 */
export type InterpreteOptions = {
  placeholder: SnippetPlaceholder
  data?: any
}

export type InterpreteResult = {
  replacement: PlaceholderReplacement
}
