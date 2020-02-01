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
  const entries: SyncEntry[] = []
  definitions.forEach(def => {
    const generated = generateSnippets([def])
    entries.push({
      filename: `${def.trigger}.xml`,
      content: generated.content,
    })
  })
  return {
    entries,
  }
}

const PLUGIN_SUBLIME: UnisnipsPlugin = {
  install(pluginManager) {
    pluginManager.registerGenerator('sublime', { generateSnippets })
    pluginManager.registerSyncProvider('sublime', { getSyncInfo })
  },
}

export default PLUGIN_SUBLIME
