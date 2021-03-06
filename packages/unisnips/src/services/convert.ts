import {
  UnisnipsGenerator,
  ParseOptions,
  ParseResult,
  SnippetDefinition,
  UnisnipsParser,
} from '@unisnips/core'

import PLUGIN_ULTISNIPS, { stripSnippetsByPriority } from '@unisnips/ultisnips'

import { UNISNIPS_SUPPORTED_SOURCES, UNISNIPS_SUPPORTED_TARGETS } from '../const'
import { pluginManager } from '../plugin-manager'
import { parse } from '../common/parse'

/**
 * Options for universal convert function
 */
interface UnisnipsConvertOptions extends ParseOptions {
  inputContent: string
  source?: string
  target?: string
}

export function convert(opts: UnisnipsConvertOptions) {
  const source = opts.source || UNISNIPS_SUPPORTED_SOURCES.ultisnips
  const target = opts.target || UNISNIPS_SUPPORTED_TARGETS.vscode
  const parser = pluginManager.getParser(source)
  const generator = pluginManager.getGenerator(target)
  if (!parser) {
    console.error(`Source '${source}' parsing not supported`)
    return
  }
  if (!generator) {
    console.error(`Target '${generator}' parsing not supported`)
    return
  }

  const parseResult = parse(opts.inputContent, {
    ...opts,
    parser,
  })
  let definitions = parseResult.definitions
  if (source === UNISNIPS_SUPPORTED_SOURCES.ultisnips) {
    definitions = stripSnippetsByPriority(parseResult.definitions)
  }
  return generator.generateSnippets(definitions, opts)
}
