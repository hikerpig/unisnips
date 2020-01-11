import { Node, Data, Position } from 'unist'

export interface SnippetPlaceholder {
  /**
   * A uniqueId inside SnippetDefinition
   */
  id: number | string
  /** For nested tabstops */
  parentId?: number | string
  /**
   * Indicates placeholder's value type, by default it should be 'positional'.
   * complicated valueType such as 'script' or 'variable', may be depended on specific interpretor and editor plugin
   * - positional: can be easily translated, such as vscode's `$1`, will need
   * - variable: represented a built-in variable,
   * - : represented a built-in variable,
   */
  valueType: PlaceholderValueType
  /** When valueType is 'positional', indicates placeholder's relative position */
  index?: number
  /** When valueType is 'positional', this is also default value */
  description?: string
  /** When valueType is 'variable' */
  variable?: {
    type: 'builtin' | 'plain'
    name: SpecialHolderName | string
  }
  /** When valueType is 'script' */
  scriptInfo?: {
    scriptType: PlaceholderScriptType
    code: string
  }
  /** position inside snippet body  */
  position: {
    start: number
    end: number
  }
  /** A Unist 'Position', position inside snippet body  */
  codePosition: Position
  extra?: any
}

type PlaceholderValueType = 'positional' | 'variable' | 'script'

type PlaceholderScriptType = 'python' | 'shell' | 'vim' | 'js'

export const UNISNIPS_SPECIAL_HOLDER_NAMES = {
  UNI_SELECTED_TEXT: true,
}

export type SpecialHolderName = keyof typeof UNISNIPS_SPECIAL_HOLDER_NAMES

export interface PlaceholderReplacement {
  placeholder: SnippetPlaceholder
  type: 'string' | 'function'
  replaceContent?: string
}

export interface SnippetDefinition {
  trigger: string
  description: string
  body: string
  /**
   * position inside source file
   */
  position: Position
  placeholders: SnippetPlaceholder[]
  priority?: number
  extra?: any
}

export interface ParseOptions {
  snippetsFilePath?: string | void
  verbose?: boolean
}

export interface ParseResult {
  definitions: SnippetDefinition[]
}

export interface GenerateOptions {
  snippetsFilePath?: string | void
}

export interface GenerateResult {
  content: string
}

export interface TokenNode<D extends Data> extends Node {
  data: D
  parent?: TokenNode<any>
}
