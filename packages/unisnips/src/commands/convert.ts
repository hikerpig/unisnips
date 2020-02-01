import fs from 'fs'
import path from 'path'
import signale from 'signale'

import yargs, { CommandModule } from 'yargs'
import { getCliOptionsByDefault } from '../common/util'
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
    const options = getCliOptionsByDefault(argv, DEFAULT_OPTIONS)

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
      const outputPath = path.resolve(cwd, options.output)
      fs.writeFileSync(outputPath, result)
      signale.success(`Written to: ${outputPath}`)
    } else {
      console.log(result)
    }
  },
}

export default CONVERT_MODULE
