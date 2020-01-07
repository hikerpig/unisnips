import { UnisnipsParser } from '@unisnips/core'

import { parse } from './parse'

export * from './util/position'

const PLUGIN_ULTISNIPS: UnisnipsParser = {
  parse,
}

export default PLUGIN_ULTISNIPS
