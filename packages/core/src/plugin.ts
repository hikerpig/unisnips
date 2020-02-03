import {
  ParseOptions,
  ParseResult,
  SnippetDefinition,
  GenerateOptions,
  GenerateResult,
  SyncProviderOptions,
  SyncInfo,
} from './index'

export interface UnisnipsParser {
  parse(content: string, opts?: ParseOptions): ParseResult
}

export interface UnisnipsGenerator {
  generateSnippets(definitions: SnippetDefinition[], opts?: GenerateOptions): GenerateResult
}

export interface UnisnipsSyncProvider {
  getSyncInfo(opts: SyncProviderOptions): SyncInfo
}

export interface IPluginManager {
  registerParser(name: string, parser: UnisnipsParser): void

  registerGenerator(name: string, generator: UnisnipsGenerator): void

  registerSyncProvider(name: string, provider: UnisnipsSyncProvider): void
}

export type UnisnipsPlugin = {
  install(pluginManager: IPluginManager): void
}
