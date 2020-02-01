import {
  UnisnipsSyncProvider,
  SyncProviderOptions,
  SyncEntry,
  UnisnipsPlugin,
} from '@unisnips/core'
import path from 'path'

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

const PLUGIN_JETBRAINS: UnisnipsPlugin = {
  install(pluginManager) {
    pluginManager.registerGenerator('jetbrains', { generateSnippets })
    pluginManager.registerSyncProvider('jetbrains', { getSyncInfo })
  },
}

export default PLUGIN_JETBRAINS
