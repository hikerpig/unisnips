import { Point } from 'unist'

export interface TextPosition {
  line: number
  column: number
  offset?: number
}

/**
 * Represents a Position in a text file: (0 based line index, 0 based column
 *   index) and provides methods for moving them around.
 */
export class TextPosition implements TextPosition {
  static fromUnistPoint(point: Point) {
    return new TextPosition(point.line, point.column, point.offset)
  }

  constructor(line: number, col: number, offset?: number) {
    this.line = line
    this.column = col
    this.offset = offset
  }

  toString() {
    return `(${this.line},${this.column},${this.offset})`
  }

  toUnistPosition() {
    return {
      line: this.line,
      column: this.column,
      offset: this.offset,
    }
  }
}
