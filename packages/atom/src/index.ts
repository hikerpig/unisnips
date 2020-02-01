import path from 'path'
import {
  UnisnipsPlugin,
  SyncEntry,
  SyncProviderOptions,
  UnisnipsSyncProvider,
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
      filename: `${fileBaseName}.cson`,
      content: generated.content,
    },
  ]
  return {
    entries,
  }
}

const PLUGIN_ATOM: UnisnipsPlugin = {
  install(pluginManager) {
    pluginManager.registerGenerator('atom', { generateSnippets })
    pluginManager.registerSyncProvider('atom', { getSyncInfo })
  },
}

export default PLUGIN_ATOM
