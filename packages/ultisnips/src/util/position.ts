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

  /**
   * A function that compares positions, useful for sorting
   */
  public static compare(a: TextPosition, b: TextPosition): number {
    const aLineNumber = a.line | 0
    const bLineNumber = b.line | 0

    if (aLineNumber === bLineNumber) {
      const aColumn = a.column | 0
      const bColumn = b.column | 0
      return aColumn - bColumn
    }

    return aLineNumber - bLineNumber
  }

  constructor(line: number, col: number, offset?: number) {
    this.line = line
    this.column = col
    this.offset = offset
  }

  toString() {
    return `(${this.line},${this.column},${this.offset})`
  }

  clone() {
    return new TextPosition(this.line, this.column, this.offset)
  }

  toUnistPosition() {
    return {
      line: this.line,
      column: this.column,
      offset: this.offset,
    }
  }

  /**
   * Returns the difference that the cursor must move to come from 'pos' to us
   */
  delta(pos: TextPosition) {
    if (this.line === pos.line) {
      return new TextPosition(0, this.column - pos.column)
    }
    return new TextPosition(this.line - pos.line, this.column)
  }

  /**
   * Create a new position that, moved 'delta' from us.
   * Slightly different than `add` method
   */
  moveWith(delta: TextPosition) {
    const newLine = this.line + delta.line
    let newCol = this.column
    if (delta.line === 0) {
      newCol = this.column + delta.column
    } else {
      newCol = delta.column
    }
    return new TextPosition(newLine, newCol)
  }

  add(pos: TextPosition) {
    return new TextPosition(this.line + pos.line, this.column + pos.column)
  }

  substract(pos: TextPosition) {
    return new TextPosition(this.line - pos.line, this.column - pos.column)
  }

  /**
   * Create a new position from this position.
   *
   * @param newLineNumber new line number
   * @param newColumn new column
   */
  with(newLineNumber: number = this.line, newColumn: number = this.column): TextPosition {
    if (newLineNumber === this.line && newColumn === this.column) {
      return this
    } else {
      return new TextPosition(newLineNumber, newColumn)
    }
  }
}
