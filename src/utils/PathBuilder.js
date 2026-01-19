/**
 * PathBuilder - Builder pattern for constructing SVG/VectorDrawable path data strings
 * 
 * Provides fluent API for building path commands used in Android Vector Drawables.
 */
export class PathBuilder {
  constructor() {
    this.commands = [];
  }

  /**
   * Move to absolute position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {PathBuilder}
   */
  absoluteMoveTo(x, y) {
    this.commands.push(`M${x},${y}`);
    return this;
  }

  /**
   * Move to relative position
   * @param {number} x - X offset
   * @param {number} y - Y offset
   * @returns {PathBuilder}
   */
  relativeMoveTo(x, y) {
    this.commands.push(`m${x},${y}`);
    return this;
  }

  /**
   * Line to absolute position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {PathBuilder}
   */
  absoluteLineTo(x, y) {
    this.commands.push(`L${x},${y}`);
    return this;
  }

  /**
   * Line to relative position
   * @param {number} x - X offset
   * @param {number} y - Y offset
   * @returns {PathBuilder}
   */
  relativeLineTo(x, y) {
    this.commands.push(`l${x},${y}`);
    return this;
  }

  /**
   * Horizontal line to relative position
   * @param {number} x - X offset
   * @returns {PathBuilder}
   */
  relativeHorizontalTo(x) {
    this.commands.push(`h${x}`);
    return this;
  }

  /**
   * Vertical line to relative position
   * @param {number} y - Y offset
   * @returns {PathBuilder}
   */
  relativeVerticalTo(y) {
    this.commands.push(`v${y}`);
    return this;
  }

  /**
   * Arc to relative position
   * @param {number} rx - X radius
   * @param {number} ry - Y radius
   * @param {boolean} largeArc - Use large arc
   * @param {boolean} sweep - Sweep direction
   * @param {boolean} clockwise - Clockwise direction
   * @param {number} x - X offset
   * @param {number} y - Y offset
   * @returns {PathBuilder}
   */
  relativeArcTo(rx, ry, largeArc, sweep, clockwise, x, y) {
    const largeArcFlag = largeArc ? 1 : 0;
    const sweepFlag = (sweep && clockwise) || (!sweep && !clockwise) ? 1 : 0;
    this.commands.push(`a${rx},${ry} 0 ${largeArcFlag},${sweepFlag} ${x},${y}`);
    return this;
  }

  /**
   * Close path with relative command
   * @returns {PathBuilder}
   */
  relativeClose() {
    this.commands.push('z');
    return this;
  }

  /**
   * Build the path data string
   * @returns {string}
   */
  toString() {
    return this.commands.join(' ');
  }

  /**
   * Reset the builder
   * @returns {PathBuilder}
   */
  reset() {
    this.commands = [];
    return this;
  }
}
