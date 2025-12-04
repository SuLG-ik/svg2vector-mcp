/**
 * PathBuilder class for constructing SVG path data
 */
export class PathBuilder {
  constructor() {
    this.path = '';
  }

  absoluteMoveTo(x, y) {
    this.path += `M${x},${y} `;
    return this;
  }

  relativeMoveTo(x, y) {
    this.path += `m${x},${y} `;
    return this;
  }

  absoluteLineTo(x, y) {
    this.path += `L${x},${y} `;
    return this;
  }

  relativeLineTo(x, y) {
    this.path += `l${x},${y} `;
    return this;
  }

  relativeHorizontalTo(x) {
    this.path += `h${x} `;
    return this;
  }

  relativeVerticalTo(y) {
    this.path += `v${y} `;
    return this;
  }

  relativeArcTo(rx, ry, largeArc, sweep, clockwise, x, y) {
    const largeArcFlag = largeArc ? 1 : 0;
    const sweepFlag = (sweep && clockwise) || (!sweep && !clockwise) ? 1 : 0;
    this.path += `a${rx},${ry} 0 ${largeArcFlag},${sweepFlag} ${x},${y} `;
    return this;
  }

  relativeClose() {
    this.path += 'z ';
    return this;
  }

  toString() {
    return this.path.trim();
  }
}
