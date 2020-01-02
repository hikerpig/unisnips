import fs from 'fs'
import path from 'path'
import yargs from 'yargs'

import CONVERT_MODULE from './commands/convert'

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
  .demandCommand()
  .command(CONVERT_MODULE)
  .alias('h', 'help')
  // .usage('🖖 unisnips')
  .usage('unisnips <command> [options]')
  // .epilogue('for more information, find our at https://github.com/hikerpig/unisnips')
  .example('convert', '--target vscode -i ~/.vim/Ultisnips/typescript.snippets').argv
