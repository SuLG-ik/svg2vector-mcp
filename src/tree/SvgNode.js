import { colorToHex } from '../utils/ColorUtils.js';
import { PRESENTATION_ATTR_MAP, FILL_RULE_MAP } from '../constants.js';

/**
 * Base class for SVG tree nodes
 */
export class SvgNode {
  constructor(tree, name) {
    this.tree = tree;
    this.name = name;
    this.attributes = new Map();
  }

  /**
   * Write node as Android VectorDrawable XML
   * @param {object} writer - Writer object with write method
   * @param {number} indent - Current indentation level
   */
  writeXml(writer, indent = 1) {
    throw new Error('writeXml must be implemented by subclass');
  }

  /**
   * Get indentation string
   * @param {number} level - Indentation level
   * @returns {string}
   */
  getIndent(level) {
    return '    '.repeat(level);
  }
}

/**
 * Group node representing SVG <g> elements
 */
export class SvgGroupNode extends SvgNode {
  constructor(tree, name) {
    super(tree, name);
    this.children = [];
  }

  /**
   * Add a child node
   * @param {SvgNode} child
   */
  addChild(child) {
    this.children.push(child);
  }

  /**
   * Check if group has children
   * @returns {boolean}
   */
  hasChildren() {
    return this.children.length > 0;
  }

  writeXml(writer, indent = 1) {
    if (!this.hasChildren()) {
      return;
    }

    for (const child of this.children) {
      child.writeXml(writer, indent);
    }
  }
}

/**
 * Leaf node representing path elements
 */
export class SvgPathNode extends SvgNode {
  constructor(tree, name) {
    super(tree, name);
    this.pathData = '';
  }

  /**
   * Set the path data
   * @param {string} data
   */
  setPathData(data) {
    this.pathData = data;
  }

  /**
   * Check if node has valid path data
   * @returns {boolean}
   */
  hasPathData() {
    return Boolean(this.pathData && this.pathData.trim());
  }

  /**
   * Set a presentation attribute
   * @param {string} svgAttr - SVG attribute name
   * @param {string} value - Attribute value
   */
  setAttribute(svgAttr, value) {
    const androidAttr = PRESENTATION_ATTR_MAP[svgAttr];
    if (!androidAttr) {
      return;
    }

    // Convert colors
    if (svgAttr === 'stroke' || svgAttr === 'fill') {
      value = colorToHex(value);
    }

    // Convert fill-rule
    if (svgAttr === 'fill-rule' && FILL_RULE_MAP[value]) {
      value = FILL_RULE_MAP[value];
    }

    this.attributes.set(androidAttr, value);
  }

  writeXml(writer, indent = 1) {
    if (!this.hasPathData()) {
      return;
    }

    const indentStr = this.getIndent(indent);
    const attrIndent = this.getIndent(indent + 1);

    writer.write(`${indentStr}<path\n`);
    writer.write(`${attrIndent}android:pathData="${this.pathData}"`);

    for (const [key, value] of this.attributes.entries()) {
      if (value && value !== 'none') {
        writer.write(`\n${attrIndent}${key}="${value}"`);
      }
    }

    writer.write('/>\n');
  }
}
