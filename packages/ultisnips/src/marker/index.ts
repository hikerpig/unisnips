import { OrNull } from '@unisnips/core'
import { TextPosition } from '../util/position'
import { Token, tokenize, TabStopToken, VisualToken, ScriptCodeToken } from '../parse/tokenizer'

export type MarkerClass = new (opts: MarkerInitOpts) => Marker

type MarkerInitOpts = {
  parent: Marker
  token?: Token
  start?: TextPosition
  end?: TextPosition
  tieBreaker?: TextPosition
  initialText?: string
}

/**
 * Represents any object in the text that has a span in any ways.
 */
export class Marker {
  start: TextPosition
  end: TextPosition
  initialText: string

  tabStops: { [key: number]: TabStop } = {}

  parent: OrNull<Marker>
  token: OrNull<Token>

  protected children: Marker[] = []
  protected tieBreaker: TextPosition

  constructor(opts: MarkerInitOpts) {
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
      parent.addChild(this)
    }
    this.init(opts)
  }

  addChild(child: Marker) {
    this.children.push(child)
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
class EditableMarker extends Marker {
  get editableChildren() {
    return this.children.filter(child => child instanceof EditableMarker)
  }
}

class NoneditableMarker extends Marker {}

export class TabStop extends EditableMarker {
  number: number

  init(opts: MarkerInitOpts) {
    super.init(opts)
    const { token, parent } = opts
    if (token && token instanceof TabStopToken) {
      this.number = token.number
    }
    parent.tabStops[this.number] = this
  }
}

export class SnippetInstance extends EditableMarker {
  visualContent: string

  init(opts: MarkerInitOpts) {
    super.init(opts)

    this.start = opts.start || new TextPosition(0, 0)
    this.end = opts.end || new TextPosition(0, 0)
  }
}

export class Mirror extends Marker {
  protected tabStop: TabStop

  init(opts: MarkerInitOpts) {
    super.init(opts)
  }
}

/**
 * A ${VISUAL} placeholder that will use the text that was last visually
 * selected and insert it here.
 *
 * If there was no text visually selected, this will be the empty string.
 *
 * TODO: Transformation ?
 */
export class Visual extends EditableMarker {
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
    // Transformation
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
}
