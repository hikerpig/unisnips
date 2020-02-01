import fs from 'fs'
import path from 'path'
import signale from 'signale'
import mkdirp from 'mkdirp'
import readline from 'readline'

import yargs, { CommandModule } from 'yargs'
import { getCliOptionsByDefault } from '../common/util'
import { sync } from '../services/sync'

const cwd = process.cwd()

const DEFAULT_OPTIONS = {
  input: '',
  output: '',
  source: '',
  target: '',
}

const SYNC_MODULE: CommandModule<any> = {
  command: 'sync',
  describe: 'Sync snippet from one source to another target',
  builder: {
    input: {
      alias: 'i',
      describe: 'input file path',
      required: true,
    },
    output: {
      alias: 'o',
      describe: 'output directory',
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

    const syncInfo = sync({
      source: options.source,
      target: options.target,
      inputContent: fileContent,
      snippetsFilePath: options.input,
    })
    if (!syncInfo) {
      signale.error('Sync failed')
      return
    }

    if (options.output) {
      const outputDir = path.resolve(cwd, options.output)
      const fileInfos = syncInfo.entries.map(entry => {
        const p = path.join(outputDir, entry.filename)
        return {
          path: p,
          ...entry,
        }
      })
      const filePaths = fileInfos.map(o => o.path)

      signale.info(`Will write to:\n${filePaths.join('\n')}`)

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      rl.question('Confirmed? y/n\n', answer => {
        rl.close()

        if (answer !== 'y') {
          return
        }

        mkdirp.sync(outputDir)

        fileInfos.forEach(entry => {
          fs.writeFileSync(entry.path, entry.content)
        })
        signale.success(`Synced`)
      })
      rl.write('y')
    } else {
      signale.info('No output, just print sync info:')
      syncInfo.entries.forEach(entry => {
        signale.info(`Filename: ${entry.filename}`)
        console.log(entry.content)
      })
    }
  },
}

export default SYNC_MODULE
