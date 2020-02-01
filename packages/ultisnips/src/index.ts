import { UnisnipsParser, SnippetDefinition, UnisnipsPlugin } from '@unisnips/core'

import { parse } from './parse'

export * from './util/position'

const PLUGIN_ULTISNIPS: UnisnipsParser & UnisnipsPlugin = {
  parse,
  install(pluginManager) {
    pluginManager.registerParser('ultisnips', PLUGIN_ULTISNIPS)
  },
}

export default PLUGIN_ULTISNIPS

/**
 * If there are multiple snippet with the same trigger,
 * keep only those with highest priority
 *
 * @see https://github.com/SirVer/ultisnips/blob/master/doc/UltiSnips.txt#L569
 */
export function stripSnippetsByPriority(defs: SnippetDefinition[]) {
  const groupsByTrigger = defs.reduce((out: { [key: string]: SnippetDefinition[] }, def) => {
    if (!out[def.trigger]) {
      out[def.trigger] = []
    }
    out[def.trigger].push(def)
    return out
  }, {})

  const resultSnippets = []
  for (const defs of Object.values(groupsByTrigger)) {
    let newList = defs
    if (defs.length > 1) {
      const highestPriority = defs.reduce((out, def) => {
        return Math.max(out, def.priority)
      }, defs[0].priority)
      newList = defs.filter(def => def.priority === highestPriority)
    }
    resultSnippets.push(...newList)
  }
  return resultSnippets
}
