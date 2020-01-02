import fs from 'fs'
import path from 'path'

import yargs, { CommandModule } from 'yargs'
import { convert } from '../services/convert'

const cwd = process.cwd()

const DEFAULT_OPTIONS = {
  input: '',
  output: '',
  source: '',
  target: '',
}

const CONVERT_MODULE: CommandModule<any> = {
  command: 'convert',
  describe: 'Convert snippet from one source to another target',
  builder: {
    input: {
      alias: 'i',
      describe: 'input file path',
      required: true,
    },
    output: {
      alias: 'o',
      describe: 'output file path',
    },
    source: {
      alias: 's',
      describe: "Source type, default is 'ultisnips'",
    },
    target: {
      alias: 't',
      describe: "Target type, default is 'vscode'",
    },
  },
  handler(argv) {
    const options = { ...DEFAULT_OPTIONS }

    Object.keys(DEFAULT_OPTIONS).forEach((k: any) => {
      if (k in options) {
        if (argv[k] !== undefined) {
          ;(options as any)[k] = argv[k] as any
        }
      }
    })

    // console.log('options', options)
    if (!options.input) {
      return yargs.showHelp()
    }

    const fileContent = fs.readFileSync(options.input).toString()

    const result = convert({
      source: options.source,
      target: options.target,
      inputContent: fileContent,
      snippetsFilePath: options.input,
    }).content

    if (options.output) {
      fs.writeFileSync(path.resolve(cwd, options.output), result)
    } else {
      console.log(result)
    }
  },
}

export default CONVERT_MODULE
