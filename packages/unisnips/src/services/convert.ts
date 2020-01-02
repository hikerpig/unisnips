import {
  UnisnipsGenerator,
  ParseOptions,
  ParseResult,
  SnippetDefinition,
  UnisnipsParser,
} from '@unisnips/core'

import PLUGIN_ULTISNIPS from '@unisnips/ultisnips'
import PLUGIN_VSCODE from '@unisnips/vscode'
import PLUGIN_ATOM from '@unisnips/atom'
import PLUGIN_SUBLIME from '@unisnips/sublime'

const UNISNIPS_SUPPORTED_SOURCES = {
  ultisnips: 'ultisnips',
}

const UNISNIPS_SUPPORTED_TARGETS = {
  vscode: 'vscode',
  atom: 'atom',
  sublime: 'sublime',
}

class PluginManager {
  protected parsers: { [key: string]: UnisnipsParser } = {}
  protected generators: { [key: string]: UnisnipsGenerator } = {}

  registerParser(name: string, parser: UnisnipsParser) {
    this.parsers[name] = parser
  }

  registerGenerator(name: string, generator: UnisnipsGenerator) {
    this.generators[name] = generator
  }

  getParser(name: string) {
    return this.parsers[name]
  }

  getGenerator(name: string) {
    return this.generators[name]
  }
}

// ---------------- Register plugins ----------------------
const pluginManager = new PluginManager()

// parsers
pluginManager.registerParser(UNISNIPS_SUPPORTED_SOURCES.ultisnips, PLUGIN_ULTISNIPS)

// generators
pluginManager.registerGenerator(UNISNIPS_SUPPORTED_TARGETS.vscode, PLUGIN_VSCODE)
pluginManager.registerGenerator(UNISNIPS_SUPPORTED_TARGETS.atom, PLUGIN_ATOM)
pluginManager.registerGenerator(UNISNIPS_SUPPORTED_TARGETS.sublime, PLUGIN_SUBLIME)
// ----------------end Register plugins -------------------

type UnisnipsParseOptions = ParseOptions & {
  parser: UnisnipsParser
}

export function parse(str: string, opts: UnisnipsParseOptions): ParseResult {
  const definitions: SnippetDefinition[] = []
  const parseResult = opts.parser.parse(str, opts)
  if (parseResult.definitions) {
    parseResult.definitions.forEach(def => definitions.push(def))
  }
  return {
    definitions,
  }
}

export function ultisnipsToVscode(str: string, opts: ParseOptions = {}) {
  const parseResult = parse(str, {
    ...opts,
    parser: PLUGIN_ULTISNIPS,
  })
  return PLUGIN_VSCODE.generateSnippets(parseResult.definitions)
}

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
    parser: PLUGIN_ULTISNIPS,
  })
  return generator.generateSnippets(parseResult.definitions)
}
