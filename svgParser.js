import { DOMParser } from '@xmldom/xmldom';
import { SvgTree, SvgGroupNode, SvgLeafNode } from './svgTree.js';
import { PathBuilder } from './pathBuilder.js';

const UNSUPPORTED_SVG_NODES = new Set([
  // Animation elements
  'animate', 'animateColor', 'animateMotion', 'animateTransform', 'mpath', 'set',
  // Container elements
  'a', 'defs', 'glyph', 'marker', 'mask', 'missing-glyph', 'pattern', 'switch', 'symbol',
  // Filter primitive elements
  'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix',
  'feDiffuseLighting', 'feDisplacementMap', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG',
  'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology',
  'feOffset', 'feSpecularLighting', 'feTile', 'feTurbulence',
  // Font elements
  'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri',
  'hkern', 'vkern',
  // Gradient elements
  'linearGradient', 'radialGradient', 'stop',
  // Graphics elements
  'ellipse', 'polyline', 'text', 'use',
  // Light source elements
  'feDistantLight', 'fePointLight', 'feSpotLight',
  // Text content elements
  'altGlyph', 'altGlyphDef', 'altGlyphItem', 'glyph', 'glyphRef', 'textPath', 'text', 'tref',
  'tspan',
  // Uncategorized elements
  'clipPath', 'color-profile', 'cursor', 'filter', 'foreignObject', 'script', 'view'
]);

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
 * Parse SVG content and create SvgTree
 */
export function parseSvg(svgContent) {
  const svgTree = new SvgTree();
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    
    // Find SVG element
    const svgElements = doc.getElementsByTagName('svg');
    if (svgElements.length !== 1) {
      svgTree.logError('Not a proper SVG file');
      return svgTree;
    }
    
    const rootNode = svgElements[0];
    
    // Parse dimensions
    parseDimension(svgTree, rootNode);
    
    if (!svgTree.viewBox) {
      svgTree.logError('Missing "viewBox" in <svg> element');
      return svgTree;
    }
    
    if ((svgTree.w === 0 || svgTree.h === 0) && svgTree.viewBox[2] > 0 && svgTree.viewBox[3] > 0) {
      svgTree.w = svgTree.viewBox[2];
      svgTree.h = svgTree.viewBox[3];
    }
    
    // Create root group
    const root = new SvgGroupNode(svgTree, rootNode, 'root');
    svgTree.setRoot(root);
    
    // Parse all group and path nodes recursively
    traverseSVGAndExtract(svgTree, root, rootNode);
    
    return svgTree;
  } catch (error) {
    svgTree.logError(`Exception in parsing: ${error.message}`);
    return svgTree;
  }
}

/**
 * Parse dimension attributes from SVG element
 */
function parseDimension(svgTree, node) {
  const attributes = node.attributes;
  
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    const name = attr.name;
    let value = attr.value;
    
    // Remove 'px' suffix if present
    if (value.endsWith('px')) {
      value = value.substring(0, value.length - 2);
    }
    
    if (name === 'width') {
      svgTree.w = parseFloat(value);
    } else if (name === 'height') {
      svgTree.h = parseFloat(value);
    } else if (name === 'viewBox') {
      const parts = value.split(/[\s,]+/);
      svgTree.viewBox = parts.map(p => parseFloat(p));
    }
  }
  
  // If viewBox not set but width/height are, create viewBox
  if (!svgTree.viewBox && svgTree.w !== 0 && svgTree.h !== 0) {
    svgTree.viewBox = [0, 0, svgTree.w, svgTree.h];
  }
}

/**
 * Recursively traverse SVG tree and extract elements
 */
function traverseSVGAndExtract(svgTree, currentGroup, item) {
  const children = item.childNodes;
  
  for (let i = 0; i < children.length; i++) {
    const currentNode = children[i];
    if (currentNode.nodeType !== 1) continue; // Skip non-element nodes
    
    const nodeName = currentNode.nodeName;
    
    if (['path', 'rect', 'circle', 'polygon', 'line'].includes(nodeName)) {
      const child = new SvgLeafNode(svgTree, currentNode, nodeName + i);
      extractAllItemsAs(svgTree, child, currentNode);
      if (child.pathData) {
        currentGroup.addChild(child);
      }
    } else if (nodeName === 'g') {
      const childGroup = new SvgGroupNode(svgTree, currentNode, 'child' + i);
      currentGroup.addChild(childGroup);
      traverseSVGAndExtract(svgTree, childGroup, currentNode);
    } else {
      if (UNSUPPORTED_SVG_NODES.has(nodeName)) {
        svgTree.logError(`<${nodeName}> is not supported`);
      }
      traverseSVGAndExtract(svgTree, currentGroup, currentNode);
    }
  }
}

/**
 * Extract element data and convert to path
 */
function extractAllItemsAs(svgTree, child, currentItem) {
  // Check for display:none in parent groups
  let currentGroup = currentItem.parentNode;
  let styleContent = '';
  let nothingToDisplay = false;
  
  while (currentGroup && currentGroup.nodeName === 'g') {
    const attributes = currentGroup.attributes;
    
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if (attr.name === 'style') {
        styleContent += attr.value + ';';
        if (styleContent.includes('display:none')) {
          nothingToDisplay = true;
          break;
        }
      } else if (attr.name === 'display' && attr.value === 'none') {
        nothingToDisplay = true;
        break;
      }
    }
    
    if (nothingToDisplay) break;
    currentGroup = currentGroup.parentNode;
  }
  
  if (nothingToDisplay) return;
  
  // Add styles from groups
  if (styleContent) {
    addStyleToPath(child, styleContent);
  }
  
  const nodeName = currentItem.nodeName;
  
  if (nodeName === 'path') {
    extractPathItem(svgTree, child, currentItem);
  } else if (nodeName === 'rect') {
    extractRectItem(svgTree, child, currentItem);
  } else if (nodeName === 'circle') {
    extractCircleItem(svgTree, child, currentItem);
  } else if (nodeName === 'polygon') {
    extractPolyItem(svgTree, child, currentItem);
  } else if (nodeName === 'line') {
    extractLineItem(svgTree, child, currentItem);
  }
}

/**
 * Extract path element
 */
function extractPathItem(svgTree, child, node) {
  const attributes = node.attributes;
  
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    const name = attr.name;
    const value = attr.value;
    
    if (name === 'style') {
      addStyleToPath(child, value);
    } else if (PRESENTATION_MAP[name]) {
      child.fillPresentationAttributes(name, value);
    } else if (name === 'd') {
      const pathData = value.replace(/(\d)-/g, '$1,-');
      child.setPathData(pathData);
    }
  }
}

/**
 * Extract rectangle element and convert to path
 */
function extractRectItem(svgTree, child, node) {
  let x = 0, y = 0, width = NaN, height = NaN;
  let pureTransparent = false;
  const attributes = node.attributes;
  
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    const name = attr.name;
    const value = attr.value;
    
    if (name === 'style') {
      addStyleToPath(child, value);
      if (value.includes('opacity:0')) {
        pureTransparent = true;
      }
    } else if (PRESENTATION_MAP[name]) {
      child.fillPresentationAttributes(name, value);
    } else if (name === 'x') {
      x = parseFloat(value);
    } else if (name === 'y') {
      y = parseFloat(value);
    } else if (name === 'width') {
      width = parseFloat(value);
    } else if (name === 'height') {
      height = parseFloat(value);
    }
  }
  
  if (!pureTransparent && !isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {
    const builder = new PathBuilder();
    builder.absoluteMoveTo(x, y);
    builder.relativeHorizontalTo(width);
    builder.relativeVerticalTo(height);
    builder.relativeHorizontalTo(-width);
    builder.relativeClose();
    child.setPathData(builder.toString());
  }
}

/**
 * Extract circle element and convert to path
 */
function extractCircleItem(svgTree, child, node) {
  let cx = 0, cy = 0, radius = 0;
  let pureTransparent = false;
  const attributes = node.attributes;
  
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    const name = attr.name;
    const value = attr.value;
    
    if (name === 'style') {
      addStyleToPath(child, value);
      if (value.includes('opacity:0')) {
        pureTransparent = true;
      }
    } else if (PRESENTATION_MAP[name]) {
      child.fillPresentationAttributes(name, value);
    } else if (name === 'cx') {
      cx = parseFloat(value);
    } else if (name === 'cy') {
      cy = parseFloat(value);
    } else if (name === 'r') {
      radius = parseFloat(value);
    }
  }
  
  if (!pureTransparent && !isNaN(cx) && !isNaN(cy) && radius > 0) {
    const builder = new PathBuilder();
    builder.absoluteMoveTo(cx, cy);
    builder.relativeMoveTo(-radius, 0);
    builder.relativeArcTo(radius, radius, false, true, true, 2 * radius, 0);
    builder.relativeArcTo(radius, radius, false, true, true, -2 * radius, 0);
    child.setPathData(builder.toString());
  }
}

/**
 * Extract polygon element and convert to path
 */
function extractPolyItem(svgTree, child, node) {
  const attributes = node.attributes;
  
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    const name = attr.name;
    const value = attr.value;
    
    if (name === 'style') {
      addStyleToPath(child, value);
    } else if (PRESENTATION_MAP[name]) {
      child.fillPresentationAttributes(name, value);
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
        child.setPathData(builder.toString());
      }
    }
  }
}

/**
 * Extract line element and convert to path
 */
function extractLineItem(svgTree, child, node) {
  let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
  let pureTransparent = false;
  const attributes = node.attributes;
  
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    const name = attr.name;
    const value = attr.value;
    
    if (name === 'style') {
      addStyleToPath(child, value);
      if (value.includes('opacity:0')) {
        pureTransparent = true;
      }
    } else if (PRESENTATION_MAP[name]) {
      child.fillPresentationAttributes(name, value);
    } else if (name === 'x1') {
      x1 = parseFloat(value);
    } else if (name === 'y1') {
      y1 = parseFloat(value);
    } else if (name === 'x2') {
      x2 = parseFloat(value);
    } else if (name === 'y2') {
      y2 = parseFloat(value);
    }
  }
  
  if (!pureTransparent && !isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
    const builder = new PathBuilder();
    builder.absoluteMoveTo(x1, y1);
    builder.absoluteLineTo(x2, y2);
    child.setPathData(builder.toString());
  }
}

/**
 * Add CSS style properties to path
 */
function addStyleToPath(path, value) {
  if (!value) return;
  
  const parts = value.split(';');
  for (const part of parts) {
    const [name, val] = part.split(':').map(s => s.trim());
    if (name && val) {
      if (PRESENTATION_MAP[name]) {
        path.fillPresentationAttributes(name, val);
      } else if (name === 'opacity') {
        path.fillPresentationAttributes('fill-opacity', val);
      }
    }
  }
}

/**
 * Convert SvgTree to Android Vector Drawable XML
 */
export function writeVectorDrawableXml(svgTree) {
  let xml = '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n';
  
  const finalWidth = svgTree.w;
  const finalHeight = svgTree.h;
  const scaleFactor = svgTree.mScaleFactor;
  
  xml += `        android:width="${Math.round(finalWidth * scaleFactor)}dp"\n`;
  xml += `        android:height="${Math.round(finalHeight * scaleFactor)}dp"\n`;
  xml += `        android:viewportWidth="${svgTree.w}"\n`;
  xml += `        android:viewportHeight="${svgTree.h}">\n`;
  
  svgTree.normalize();
  
  // Write paths
  const writer = {
    content: '',
    write(str) {
      this.content += str;
    }
  };
  
  svgTree.getRoot().writeXML(writer);
  xml += writer.content;
  
  xml += '</vector>\n';
  
  return xml;
}
