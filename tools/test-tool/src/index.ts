import fs from 'fs'
import path from 'path'

export function getSnippetFileContent(name: string) {
  return fs.readFileSync(path.join(__dirname, '..', 'snippets', name)).toString()
}

export function getUltisnipsSnippetContent(name: string) {
  return getSnippetFileContent(`ultisnips/${name}`)
}
