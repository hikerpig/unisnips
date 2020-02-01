import outdent from 'outdent'

import { convert } from '../src/index'

import { ParseOptions } from '@unisnips/core'

describe('handling priority', () => {
  const convertToVscode = (inputContent: string, opts: ParseOptions = {}) => {
    return convert({
      target: 'vscode',
      inputContent,
      ...opts,
    })
  }

  it('snippets with different priorities, keep only the ones with the highest priority', () => {
    const source = outdent`
    snippet pri "high priority"
    high
    endsnippet

    priority -30
    snippet pri "low priority"
    low
    endsnippet
    `
    const { content } = convertToVscode(source)
    expect(content).toEqual(outdent`
    {
      "high priority": {
        "prefix": "pri",
        "body": [
          "high"
        ],
        "description": "high priority"
      }
    }
    `)
  })

  it('snippets with same trigger and priority will all be kept', () => {
    const source = outdent`
    snippet pri "pri 1"
    pri 1
    endsnippet

    snippet pri "pri 2"
    pri 2
    endsnippet
    `
    const { content } = convertToVscode(source)
    const obj = JSON.parse(content)
    expect(Object.keys(obj)).toEqual(['pri 1', 'pri 2'])
  })
})
