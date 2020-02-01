import path from 'path'
import {
  UnisnipsSyncProvider,
  SyncProviderOptions,
  SyncEntry,
  UnisnipsPlugin,
} from '@unisnips/core'

import { generateSnippets } from './generate'

export { generateSnippets }

export const getSyncInfo: UnisnipsSyncProvider['getSyncInfo'] = (opts: SyncProviderOptions) => {
  const { definitions } = opts
  const generated = generateSnippets(definitions)
  const fileBaseName = opts.snippetsFilePath
    ? path
        .basename(opts.snippetsFilePath)
        .split('.')
        .shift()
    : 'unisnips'

  const entries: SyncEntry[] = [
    {
      filename: `${fileBaseName}.json`,
      content: generated.content,
    },
  ]
  return {
    entries,
  }
}

const PLUGIN_VSCODE: UnisnipsPlugin = {
  install(pluginManager) {
    pluginManager.registerGenerator('vscode', { generateSnippets })
    pluginManager.registerSyncProvider('vscode', { getSyncInfo })
  },
}

export default PLUGIN_VSCODE
