export interface TextPosition {
  line: number
  col: number
  offset?: number
}

/**
 * Represents a Position in a text file: (0 based line index, 0 based column
 *   index) and provides methods for moving them around.
 */
export class TextPosition implements TextPosition {
  constructor(line: number, col: number, offset?: number) {
    this.line = line
    this.col = col
    this.offset = offset
  }

  toString() {
    return `(${this.line},${this.col},${this.offset})`
  }

  toUnistPosition() {
    return {
      line: this.line,
      column: this.col,
      offset: this.offset,
    }
  }
}
