export interface SnippetPlaceholder {
  /**
   * - can be a number to indicate position,
   * - or a string for special placeholder name, such as ultisnips' 'VISUAL'
   */
  id: number | SpecialHolderName
  /** also default value */
  description?: string
  /** position inside snippet body  */
  position: {
    start: number
    end: number
  }
}

export const UNISNIPS_SPECIAL_HOLDER_NAMES = {
  UNI_VISUAL: true,
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
