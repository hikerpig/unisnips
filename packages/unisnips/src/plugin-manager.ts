import {
  UnisnipsGenerator,
  UnisnipsParser,
  UnisnipsSyncProvider,
  IPluginManager,
} from '@unisnips/core'

import PLUGIN_ULTISNIPS from '@unisnips/ultisnips'

import PLUGIN_VSCODE from '@unisnips/vscode'
import PLUGIN_ATOM from '@unisnips/atom'
import PLUGIN_SUBLIME from '@unisnips/sublime'
import PLUGIN_JETBRAINS from '@unisnips/jetbrains'

export class PluginManager implements IPluginManager {
  protected parsers: { [key: string]: UnisnipsParser } = {}
  protected generators: { [key: string]: UnisnipsGenerator } = {}
  protected syncProviders: { [key: string]: UnisnipsSyncProvider } = {}

  registerParser(name: string, parser: UnisnipsParser) {
    this.parsers[name] = parser
  }

  registerGenerator(name: string, generator: UnisnipsGenerator) {
    this.generators[name] = generator
  }

  registerSyncProvider(name: string, provider: UnisnipsSyncProvider) {
    this.syncProviders[name] = provider
  }

  getParser(name: string) {
    return this.parsers[name]
  }

  getGenerator(name: string) {
    return this.generators[name]
  }

  getSyncProvider(name: string) {
    return this.syncProviders[name]
  }
}

// ---------------- Register plugins ----------------------
export const pluginManager = new PluginManager()

PLUGIN_ULTISNIPS.install(pluginManager)

PLUGIN_VSCODE.install(pluginManager)
PLUGIN_SUBLIME.install(pluginManager)
PLUGIN_ATOM.install(pluginManager)
PLUGIN_JETBRAINS.install(pluginManager)
// ----------------end Register plugins -------------------
