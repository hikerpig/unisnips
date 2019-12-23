import yargs from 'yargs'
import fs from 'fs'
import path from 'path'

import { convert } from './index'

const cwd = process.cwd()

const DEFAULT_OPTIONS = {
  input: '',
  output: '',
  source: '',
  target: '',
}

let version: string
try {
  const pkgPath = path.join(__dirname, '..', 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath).toString())
  version = pkg.version
} catch (e) {
  //
}

const argv = yargs
  .version(version)
  .option('source', {
    alias: 's',
    description: "Source type, default is 'ultisnips'",
  })
  .option('target', {
    alias: 't',
    description: "Target type, default is 'vscode'",
  })
  .option('input', {
    alias: 'i',
    required: true,
  })
  .option('output', {
    alias: 'o',
  })
  .usage('unisnips usage').argv

const options = { ...DEFAULT_OPTIONS }

function main() {
  Object.keys(DEFAULT_OPTIONS).forEach((k: any) => {
    if (k in options) {
      if (argv[k] !== undefined) {
        ;(options as any)[k] = argv[k] as any
      }
    }
  })

  // console.log('options', options)

  const fileContent = fs.readFileSync(options.input).toString()

  const result = convert({
    source: options.source,
    target: options.target,
    inputContent: fileContent,
    snippetsFilePath: options.input,
  }).content

  if (options.output) {
    fs.writeFileSync(path.join(cwd, options.output), result)
  } else {
    console.log(result)
  }
}

main()
