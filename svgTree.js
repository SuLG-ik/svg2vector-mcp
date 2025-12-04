/**
 * SVG node classes for representing the SVG structure
 */

const PRESENTATION_MAP = {
  'stroke': 'android:strokeColor',
  'stroke-opacity': 'android:strokeAlpha',
  'stroke-linejoin': 'android:strokeLinejoin',
  'stroke-linecap': 'android:strokeLinecap',
  'stroke-width': 'android:strokeWidth',
  'fill': 'android:fillColor',
  'fill-opacity': 'android:fillAlpha',
  'clip': 'android:clip',
  'opacity': 'android:fillAlpha'
};

/**
 * Base class for SVG nodes
 */
export class SvgNode {
  constructor(tree, node, name) {
    this.tree = tree;
    this.name = name;
    this.attributes = new Map();
  }

  writeXML(writer) {
    throw new Error('Must be implemented by subclass');
  }
}

/**
 * Group node representing SVG <g> elements
 */
export class SvgGroupNode extends SvgNode {
  constructor(tree, node, name) {
    super(tree, node, name);
    this.children = [];
  }

  addChild(child) {
    this.children.push(child);
  }

  writeXML(writer) {
    if (this.children.length === 0) {
      return;
    }

    // Write all children
    for (const child of this.children) {
      child.writeXML(writer);
    }
  }
}

/**
 * Leaf node representing SVG path elements
 */
export class SvgLeafNode extends SvgNode {
  constructor(tree, node, name) {
    super(tree, node, name);
    this.pathData = '';
  }

  setPathData(data) {
    this.pathData = data;
  }

  fillPresentationAttributes(name, value) {
    if (PRESENTATION_MAP[name]) {
      // Convert color names to hex
      if (name === 'stroke' || name === 'fill') {
        value = this.convertColor(value);
      }
      this.attributes.set(PRESENTATION_MAP[name], value);
    }
  }

  convertColor(color) {
    if (!color || color === 'none') {
      return color;
    }
    
    // If already hex, return as is
    if (color.startsWith('#')) {
      return color;
    }

    // Basic color name to hex conversion
    const colorMap = {
      'black': '#000000',
      'white': '#FFFFFF',
      'red': '#FF0000',
      'green': '#00FF00',
      'blue': '#0000FF',
      'yellow': '#FFFF00',
      'cyan': '#00FFFF',
      'magenta': '#FF00FF',
      'gray': '#808080',
      'grey': '#808080'
    };

    return colorMap[color.toLowerCase()] || color;
  }

  writeXML(writer) {
    if (!this.pathData) {
      return;
    }

    writer.write('    <path\n');
    
    // Write path data
    writer.write(`        android:pathData="${this.pathData}"`);

    // Write other attributes
    for (const [key, value] of this.attributes.entries()) {
      if (value && value !== 'none') {
        writer.write(`\n        ${key}="${value}"`);
      }
    }

    writer.write('/>\n');
  }
}

/**
 * Main SVG tree class
 */
export class SvgTree {
  constructor() {
    this.w = 0;
    this.h = 0;
    this.viewBox = null;
    this.root = null;
    this.errors = [];
    this.mScaleFactor = 1;
  }

  setRoot(root) {
    this.root = root;
  }

  getRoot() {
    return this.root;
  }

  logError(message) {
    this.errors.push(message);
  }

  getErrorLog() {
    return this.errors.join('\n');
  }

  canConvertToVectorDrawable() {
    return this.errors.length === 0 && this.viewBox !== null;
  }

  normalize() {
    // Normalization logic if needed
  }
}
