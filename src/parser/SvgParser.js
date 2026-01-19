import { DOMParser } from '@xmldom/xmldom';
import { SvgTree, SvgGroupNode, SvgPathNode } from '../tree/index.js';
import { PathBuilder } from '../utils/PathBuilder.js';
import { PRESENTATION_ATTR_MAP, UNSUPPORTED_ELEMENTS, CONVERTIBLE_ELEMENTS } from '../constants.js';

/**
 * SvgParser - Parses SVG content into an SvgTree structure
 */
export class SvgParser {
  /**
   * Parse SVG content string into SvgTree
   * @param {string} svgContent - SVG XML content
   * @returns {SvgTree}
   */
  parse(svgContent) {
    const tree = new SvgTree();
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'image/svg+xml');
      
      const svgElements = doc.getElementsByTagName('svg');
      if (svgElements.length !== 1) {
        tree.logError('Not a valid SVG file: missing or multiple <svg> elements');
        return tree;
      }
      
      const svgElement = svgElements[0];
      this.parseDimensions(tree, svgElement);
      
      if (!tree.viewBox) {
        tree.logError('Missing "viewBox" attribute in <svg> element');
        return tree;
      }
      
      const root = new SvgGroupNode(tree, 'root');
      tree.setRoot(root);
      this.parseChildren(tree, root, svgElement);
      
      return tree;
    } catch (error) {
      tree.logError(`Parsing error: ${error.message}`);
      return tree;
    }
  }

  /**
   * Parse SVG dimension attributes
   * @param {SvgTree} tree
   * @param {Element} svgElement
   */
  parseDimensions(tree, svgElement) {
    const attributes = svgElement.attributes;
    
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      const name = attr.name;
      let value = attr.value;
      
      // Handle percentage values - treat as no dimension
      if (value.endsWith('%')) {
        continue;
      }
      
      // Remove unit suffixes
      value = this.stripUnits(value);
      
      if (name === 'width') {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          tree.width = parsed;
        }
      } else if (name === 'height') {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          tree.height = parsed;
        }
      } else if (name === 'viewBox') {
        const parts = value.split(/[\s,]+/).map(p => parseFloat(p));
        if (parts.length === 4 && parts.every(p => !isNaN(p))) {
          tree.viewBox = parts;
        }
      }
    }
    
    // Create viewBox from dimensions if not present
    if (!tree.viewBox && tree.width > 0 && tree.height > 0) {
      tree.viewBox = [0, 0, tree.width, tree.height];
    }
  }

  /**
   * Strip unit suffixes from dimension values
   * @param {string} value
   * @returns {string}
   */
  stripUnits(value) {
    return value.replace(/(px|pt|em|rem|cm|mm|in)$/, '');
  }

  /**
   * Recursively parse child elements
   * @param {SvgTree} tree
   * @param {SvgGroupNode} currentGroup
   * @param {Element} element
   */
  parseChildren(tree, currentGroup, element) {
    const children = element.childNodes;
    
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.nodeType !== 1) continue; // Skip non-element nodes
      
      const nodeName = node.nodeName;
      
      if (CONVERTIBLE_ELEMENTS.has(nodeName)) {
        const pathNode = new SvgPathNode(tree, `${nodeName}_${i}`);
        this.extractElement(tree, pathNode, node);
        
        if (pathNode.hasPathData()) {
          currentGroup.addChild(pathNode);
        }
      } else if (nodeName === 'g') {
        const childGroup = new SvgGroupNode(tree, `group_${i}`);
        currentGroup.addChild(childGroup);
        this.parseChildren(tree, childGroup, node);
      } else if (UNSUPPORTED_ELEMENTS.has(nodeName)) {
        tree.logWarning(`<${nodeName}> element is not supported`);
        // Still traverse children in case there are supported elements
        this.parseChildren(tree, currentGroup, node);
      } else {
        // Unknown element - traverse children
        this.parseChildren(tree, currentGroup, node);
      }
    }
  }

  /**
   * Extract element data and convert to path
   * @param {SvgTree} tree
   * @param {SvgPathNode} pathNode
   * @param {Element} element
   */
  extractElement(tree, pathNode, element) {
    // Check for display:none in parent groups
    if (this.isHidden(element)) {
      return;
    }
    
    // Apply inherited styles from parent groups
    this.applyInheritedStyles(pathNode, element);
    
    const nodeName = element.nodeName;
    
    switch (nodeName) {
      case 'path':
        this.extractPath(pathNode, element);
        break;
      case 'rect':
        this.extractRect(pathNode, element);
        break;
      case 'circle':
        this.extractCircle(pathNode, element);
        break;
      case 'polygon':
        this.extractPolygon(pathNode, element);
        break;
      case 'line':
        this.extractLine(pathNode, element);
        break;
    }
  }

  /**
   * Check if element or any parent has display:none
   * @param {Element} element
   * @returns {boolean}
   */
  isHidden(element) {
    let current = element;
    
    while (current && current.nodeName !== 'svg') {
      if (current.nodeType === 1) {
        const style = current.getAttribute?.('style') || '';
        const display = current.getAttribute?.('display');
        
        if (style.includes('display:none') || display === 'none') {
          return true;
        }
      }
      current = current.parentNode;
    }
    
    return false;
  }

  /**
   * Apply inherited styles from parent groups
   * @param {SvgPathNode} pathNode
   * @param {Element} element
   */
  applyInheritedStyles(pathNode, element) {
    let current = element.parentNode;
    const styles = [];
    
    while (current && current.nodeName === 'g') {
      const style = current.getAttribute?.('style');
      if (style) {
        styles.unshift(style);
      }
      current = current.parentNode;
    }
    
    for (const style of styles) {
      this.applyStyle(pathNode, style);
    }
  }

  /**
   * Parse and apply CSS style string
   * @param {SvgPathNode} pathNode
   * @param {string} styleString
   */
  applyStyle(pathNode, styleString) {
    if (!styleString) return;
    
    const parts = styleString.split(';');
    for (const part of parts) {
      const [name, value] = part.split(':').map(s => s.trim());
      if (name && value && PRESENTATION_ATTR_MAP[name]) {
        pathNode.setAttribute(name, value);
      }
    }
  }

  /**
   * Extract path element
   * @param {SvgPathNode} pathNode
   * @param {Element} element
   */
  extractPath(pathNode, element) {
    const attributes = element.attributes;
    
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      const name = attr.name;
      const value = attr.value;
      
      if (name === 'style') {
        this.applyStyle(pathNode, value);
      } else if (name === 'd') {
        // Fix path data: add comma before negative numbers not preceded by comma or space
        const pathData = value.replace(/(\d)-/g, '$1,-');
        pathNode.setPathData(pathData);
      } else if (PRESENTATION_ATTR_MAP[name]) {
        pathNode.setAttribute(name, value);
      }
    }
  }

  /**
   * Extract rect element and convert to path
   * @param {SvgPathNode} pathNode
   * @param {Element} element
   */
  extractRect(pathNode, element) {
    let x = 0, y = 0, width = NaN, height = NaN;
    let pureTransparent = false;
    const attributes = element.attributes;
    
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      const name = attr.name;
      const value = attr.value;
      
      if (name === 'style') {
        this.applyStyle(pathNode, value);
        if (value.includes('opacity:0')) {
          pureTransparent = true;
        }
      } else if (name === 'x') {
        x = parseFloat(value);
      } else if (name === 'y') {
        y = parseFloat(value);
      } else if (name === 'width') {
        width = parseFloat(value);
      } else if (name === 'height') {
        height = parseFloat(value);
      } else if (PRESENTATION_ATTR_MAP[name]) {
        pathNode.setAttribute(name, value);
      }
    }
    
    if (!pureTransparent && !isNaN(width) && !isNaN(height)) {
      const builder = new PathBuilder();
      builder.absoluteMoveTo(x, y);
      builder.relativeHorizontalTo(width);
      builder.relativeVerticalTo(height);
      builder.relativeHorizontalTo(-width);
      builder.relativeClose();
      pathNode.setPathData(builder.toString());
    }
  }

  /**
   * Extract circle element and convert to path
   * @param {SvgPathNode} pathNode
   * @param {Element} element
   */
  extractCircle(pathNode, element) {
    let cx = 0, cy = 0, radius = 0;
    let pureTransparent = false;
    const attributes = element.attributes;
    
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      const name = attr.name;
      const value = attr.value;
      
      if (name === 'style') {
        this.applyStyle(pathNode, value);
        if (value.includes('opacity:0')) {
          pureTransparent = true;
        }
      } else if (name === 'cx') {
        cx = parseFloat(value);
      } else if (name === 'cy') {
        cy = parseFloat(value);
      } else if (name === 'r') {
        radius = parseFloat(value);
      } else if (PRESENTATION_ATTR_MAP[name]) {
        pathNode.setAttribute(name, value);
      }
    }
    
    if (!pureTransparent && radius > 0) {
      const builder = new PathBuilder();
      builder.absoluteMoveTo(cx, cy);
      builder.relativeMoveTo(-radius, 0);
      builder.relativeArcTo(radius, radius, false, true, true, 2 * radius, 0);
      builder.relativeArcTo(radius, radius, false, true, true, -2 * radius, 0);
      pathNode.setPathData(builder.toString());
    }
  }

  /**
   * Extract polygon element and convert to path
   * @param {SvgPathNode} pathNode
   * @param {Element} element
   */
  extractPolygon(pathNode, element) {
    const attributes = element.attributes;
    
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      const name = attr.name;
      const value = attr.value;
      
      if (name === 'style') {
        this.applyStyle(pathNode, value);
      } else if (name === 'points') {
        const points = value.split(/[\s,]+/).filter(p => p).map(p => parseFloat(p));
        
        if (points.length >= 2) {
          const builder = new PathBuilder();
          let baseX = points[0];
          let baseY = points[1];
          builder.absoluteMoveTo(baseX, baseY);
          
          for (let j = 2; j < points.length; j += 2) {
            const x = points[j];
            const y = points[j + 1];
            builder.relativeLineTo(x - baseX, y - baseY);
            baseX = x;
            baseY = y;
          }
          
          builder.relativeClose();
          pathNode.setPathData(builder.toString());
        }
      } else if (PRESENTATION_ATTR_MAP[name]) {
        pathNode.setAttribute(name, value);
      }
    }
  }

  /**
   * Extract line element and convert to path
   * @param {SvgPathNode} pathNode
   * @param {Element} element
   */
  extractLine(pathNode, element) {
    let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
    let pureTransparent = false;
    const attributes = element.attributes;
    
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      const name = attr.name;
      const value = attr.value;
      
      if (name === 'style') {
        this.applyStyle(pathNode, value);
        if (value.includes('opacity:0')) {
          pureTransparent = true;
        }
      } else if (name === 'x1') {
        x1 = parseFloat(value);
      } else if (name === 'y1') {
        y1 = parseFloat(value);
      } else if (name === 'x2') {
        x2 = parseFloat(value);
      } else if (name === 'y2') {
        y2 = parseFloat(value);
      } else if (PRESENTATION_ATTR_MAP[name]) {
        pathNode.setAttribute(name, value);
      }
    }
    
    if (!pureTransparent) {
      const builder = new PathBuilder();
      builder.absoluteMoveTo(x1, y1);
      builder.absoluteLineTo(x2, y2);
      pathNode.setPathData(builder.toString());
    }
  }
}
