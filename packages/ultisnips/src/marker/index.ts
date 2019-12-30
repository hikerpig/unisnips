import { OrNull, TokenNode } from '@unisnips/core'
import { TextPosition } from '../util/position'
import { pick } from '../util/util'
import {
  TextIterator,
  Token,
  TabStopToken,
  VisualToken,
  ScriptCodeToken,
  UniSnipsVariableToken,
  StopIteration,
  parseTillUnescapedChar,
} from '../parse/tokenizer'

export type MarkerClass = new (opts: MarkerInitOpts) => Marker

type MarkerInitOpts<T = Token> = {
  parent: Marker
  token?: T
  start?: TextPosition
  end?: TextPosition
  tieBreaker?: TextPosition
  initialText?: string
}

/**
 * Represents any object in the text that has a span in any ways.
 */
export class Marker<T extends Token = Token> {
  start: TextPosition
  end: TextPosition
  initialText: string

  tabStops: { [key: number]: TabStop } = {}

  parent: OrNull<Marker>
  token: OrNull<T>

  protected children: Marker[] = []
  protected tieBreaker: TextPosition

  constructor(opts: MarkerInitOpts<T>) {
    const { parent, start, end, token, tieBreaker } = opts
    if (token) {
      // Initialize from token
      this.start = token.start
      this.end = token.end
      this.initialText = token.initialText
      this.token = token
    } else {
      this.start = start
      this.end = end
      this.initialText = opts.initialText
    }
    if (tieBreaker) {
      this.tieBreaker = tieBreaker
    } else {
      if (this.start) {
        if ('line' in this.start) {
          // QUESTION: 两个 line 是不是有问题?
          this.tieBreaker = new TextPosition(this.start.line, this.end.line)
        }
      }
    }

    if (parent) {
      this.parent = parent
      parent.addChild(this)
    }
    this.init(opts)
  }

  addChild(child: Marker) {
    this.children.push(child)
  }

  /**
   * will be serialized to TokenNode
   */
  get markerType() {
    return 'Marker'
  }

  getTokenNodeData() {
    if (this.token) {
      return this.token.getTokenNodeData()
    }
    return {}
  }

  toTokenNode(): TokenNode<any> {
    return {
      type: this.markerType,
      position: {
        start: this.start.toUnistPosition(),
        end: this.end.toUnistPosition(),
      },
      data: this.getTokenNodeData(),
    }
  }

  /** @abstract */
  protected init(opts: MarkerInitOpts) {
    // should be overrided
  }
}

/**
 * This base class represents any object in the text that can be changed by
 * the user.
 */
class EditableMarker<T = Token> extends Marker {
  get editableChildren() {
    return this.children.filter(child => child instanceof EditableMarker)
  }
}

class NoneditableMarker extends Marker {}

export class Transform extends Marker {
  protected regex: RegExp
  protected replace: any
  protected search: string
  protected options: string

  get markerType() {
    return 'Transform'
  }

  getTokenNodeData() {
    return pick(this as any, ['search', 'replace', 'options'])
  }

  initTransformation(opts: { search: string; options: string; replace: string }) {
    this.options = opts.options
    this.search = opts.search

    if (opts.options) {
    }

    this.regex = new RegExp(opts.search, opts.options)
    // curently more clever replace like '\u' is not supported
    this.replace = opts.replace
  }

  protected transformText(text: string) {
    if (!this.regex) {
      return text
    }
    text.replace(this.regex, this.replace)
  }
}

export class TransformableMarker<T = Token> extends EditableMarker<T> {
  transform?: Transform

  search: string
  replace: string
  options: any = null

  getTokenNodeData() {
    const data: any = super.getTokenNodeData()
    if (this.transform) {
      data.transform = this.transform.getTokenNodeData()
    }
    return data
  }

  protected parseTransform(text: string) {
    if (text[0] !== '/') return
    // console.log('parse transform', text)
    const iter = new TextIterator(text, new TextPosition(0, 0, 0))
    iter.next()
    try {
      const search = parseTillUnescapedChar(iter, '/')[0]
      const replace = parseTillUnescapedChar(iter, '/')[0]
      const optionChars = []
      if (iter.peek()) {
        optionChars.push(iter.next())
      }
      const options = optionChars.join('')
      if (search && replace) {
        const transform = new Transform({
          parent: this,
        })
        transform.initTransformation({ search, replace, options })
        this.transform = transform
      }
    } catch (e) {
      if (e instanceof StopIteration) {
        return
      }
      throw e
    }
  }
}

export class TabStop<T = TabStopToken> extends TransformableMarker {
  number: number

  get markerType() {
    return 'TabStop'
  }

  init(opts: MarkerInitOpts<TabStopToken>) {
    super.init(opts)
    const { token, parent } = opts
    if (token) {
      this.number = token.number
    }
    parent.tabStops[this.number] = this

    if (this.initialText && !token.hasColon) {
      this.parseTransform(this.initialText)
      if (this.transform) {
        this.initialText = ''
      }
    }
  }
}

export class SnippetInstance extends EditableMarker {
  // maybe it needs a context?
  visualContent: string

  get markerType() {
    return 'Snippet'
  }

  init(opts: MarkerInitOpts) {
    super.init(opts)

    this.start = opts.start || new TextPosition(0, 0)
    this.end = opts.end || new TextPosition(0, 0)
  }
}

export class Mirror extends Marker {
  protected tabStop: TabStop

  get markerType() {
    return 'Mirror'
  }

  init(opts: MarkerInitOpts) {
    super.init(opts)
  }
}

export class UniSnipsVariable extends NoneditableMarker {
  get name() {
    if (this.token instanceof UniSnipsVariableToken) {
      return this.token.name
    }
  }
}

/**
 * A ${VISUAL} placeholder that will use the text that was last visually
 * selected and insert it here.
 *
 * If there was no text visually selected, this will be the empty string.
 */
export class Visual extends TransformableMarker {
  text: string
  /** QUESTION: may be related to vim's mode? */
  mode: string
  init(opts: MarkerInitOpts) {
    let marker = opts.parent
    while (marker) {
      if (marker instanceof SnippetInstance) {
        // this.text = marker.
        break
      } else {
        marker = marker.parent
      }

      if (!this.text) {
        const token = opts.token as VisualToken
        this.text = token.alternativeText
        this.mode = 'v'
      }
    }
    // this.
    // Transformation
  }

  get markerType() {
    return 'Visual'
  }
}

export class ScriptCode extends NoneditableMarker {
  get code() {
    let code
    if (this.token && this.token instanceof ScriptCodeToken) {
      code = this.token.scriptCode
    }
    return code
  }

  get scriptType() {
    let type
    if (this.token && this.token instanceof ScriptCodeToken) {
      type = this.token.scriptType
    }
    return type
  }

  get markerType() {
    return 'ScriptCode'
  }
}
