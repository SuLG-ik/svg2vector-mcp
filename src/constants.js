/**
 * Constants for SVG to Android VectorDrawable conversion
 */

/**
 * Mapping from SVG presentation attributes to Android VectorDrawable attributes
 */
export const PRESENTATION_ATTR_MAP = {
  'stroke': 'android:strokeColor',
  'stroke-opacity': 'android:strokeAlpha',
  'stroke-linejoin': 'android:strokeLineJoin',
  'stroke-linecap': 'android:strokeLineCap',
  'stroke-width': 'android:strokeWidth',
  'fill': 'android:fillColor',
  'fill-opacity': 'android:fillAlpha',
  'fill-rule': 'android:fillType',
  'clip': 'android:clip',
  'opacity': 'android:fillAlpha',
};

/**
 * SVG elements that are not supported in Android VectorDrawable
 */
export const UNSUPPORTED_ELEMENTS = new Set([
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
  'ellipse', 'polyline', 'text', 'use', 'image',
  // Light source elements
  'feDistantLight', 'fePointLight', 'feSpotLight',
  // Text content elements
  'altGlyph', 'altGlyphDef', 'altGlyphItem', 'glyphRef', 'textPath', 'tref', 'tspan',
  // Uncategorized elements
  'clipPath', 'color-profile', 'cursor', 'filter', 'foreignObject', 'script', 'view', 'style',
]);

/**
 * SVG elements that can be converted to paths
 */
export const CONVERTIBLE_ELEMENTS = new Set([
  'path', 'rect', 'circle', 'polygon', 'line',
]);

/**
 * Fill rule mapping from SVG to Android
 */
export const FILL_RULE_MAP = {
  'nonzero': 'nonZero',
  'evenodd': 'evenOdd',
};
