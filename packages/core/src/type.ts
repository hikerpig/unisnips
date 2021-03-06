import { Node, Data, Position } from 'unist'

/**
 * A snippet's definition
 */
export interface SnippetDefinition {
  trigger: string
  description: string
  body: string
  /** aka 'options' in ultisnips */
  flags: string
  /**
   * position inside source file
   */
  position: Position
  placeholders: SnippetPlaceholder[]
  priority?: number
  extra?: any
}

export interface SnippetPlaceholder {
  /**
   * A unique id inside SnippetDefinition
   */
  id: number | string
  /** For nested tabstops */
  parentId?: number | string
  /** A Unist 'Position', position inside snippet body  */
  bodyPosition: Position
  /**
   * Indicates placeholder's value type, by default it should be 'tabstop'.
   * complicated valueType such as 'script' or 'variable', may be depended on specific interpretor and editor plugin
   * - tabstop: can be easily translated, such as vscode's `$1`, will need
   * - variable: represented a built-in variable,
   * - : represented a built-in variable,
   */
  valueType: PlaceholderValueType
  /** When valueType is 'tabstop', indicates placeholder's relative position */
  index?: number
  /** When valueType is 'tabstop', this is also default value */
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
  /**
   * A transformation against the placeholder
   */
  transform?: PlaceholderTransform
  extra?: any
}

type PlaceholderValueType = 'tabstop' | 'variable' | 'script'

type PlaceholderScriptType = 'python' | 'shell' | 'vim' | 'js'

export const UNISNIPS_SPECIAL_HOLDER_NAMES = {
  UNI_SELECTED_TEXT: true,
}

export type SpecialHolderName = keyof typeof UNISNIPS_SPECIAL_HOLDER_NAMES

export type PlaceholderTransform = {
  search: string
  replace: string
  options: string
}

export interface PlaceholderReplacement {
  placeholder: SnippetPlaceholder
  type: 'string' | 'function'
  replaceContent?: string
}

export interface ParseOptions {
  snippetsFilePath?: string | void
  verbose?: boolean
  /**
   * A synchronous function which, will be called if the snippet has 'extends something' syntax,
   * and returned value will be added to raw parsed definitions
   */
  onExtends?<T extends SnippetDefinition>(
    info: {
      extendedTypes: string[]
      snippetsFilePath: string | void
    },
    helper: {
      parseForDefinitions(content: string, opts?: ParseOptions): T[]
    },
  ): T[]
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

// ---------------- About sync ----------------------
export interface SyncProviderOptions {
  definitions: SnippetDefinition[]
  snippetsFilePath?: string | void
}

export type SyncEntry = {
  filename: string
  content: string
}

export interface SyncInfo {
  entries: SyncEntry[]
}
// ----------------end About sync -------------------
