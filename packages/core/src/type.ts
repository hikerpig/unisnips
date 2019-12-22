export interface SnippetPlaceholder {
  index: number | string
  /** also default value */
  description?: string
  /** position in snippet body  */
  position: {
    start: number
    end: number
  }
}

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
