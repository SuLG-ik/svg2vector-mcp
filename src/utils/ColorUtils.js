/**
 * ColorUtils - Utilities for color conversion and manipulation
 */

const NAMED_COLORS = {
  'black': '#000000',
  'white': '#FFFFFF',
  'red': '#FF0000',
  'green': '#00FF00',
  'blue': '#0000FF',
  'yellow': '#FFFF00',
  'cyan': '#00FFFF',
  'magenta': '#FF00FF',
  'gray': '#808080',
  'grey': '#808080',
  'orange': '#FFA500',
  'purple': '#800080',
  'pink': '#FFC0CB',
  'brown': '#A52A2A',
  'navy': '#000080',
  'lime': '#00FF00',
  'aqua': '#00FFFF',
  'silver': '#C0C0C0',
  'maroon': '#800000',
  'olive': '#808000',
  'teal': '#008080',
  'fuchsia': '#FF00FF',
};

/**
 * Convert color value to hex format
 * @param {string} color - Color value (name, hex, rgb, etc.)
 * @returns {string} Hex color or original value if conversion not possible
 */
export function colorToHex(color) {
  if (!color || color === 'none') {
    return color;
  }
  
  // Already hex
  if (color.startsWith('#')) {
    return normalizeHex(color);
  }

  // Named color
  const lowerColor = color.toLowerCase();
  if (NAMED_COLORS[lowerColor]) {
    return NAMED_COLORS[lowerColor];
  }

  // RGB/RGBA format
  const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return rgbToHex(r, g, b);
  }

  // CSS variable - extract fallback value
  const varMatch = color.match(/var\([^,]+,\s*([^)]+)\)/);
  if (varMatch) {
    return colorToHex(varMatch[1].trim());
  }

  return color;
}

/**
 * Convert RGB values to hex
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color
 */
export function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Normalize hex color to 6 digits
 * @param {string} hex - Hex color
 * @returns {string} Normalized hex color
 */
export function normalizeHex(hex) {
  if (hex.length === 4) {
    // #RGB -> #RRGGBB
    return ('#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]).toUpperCase();
  }
  return hex.toUpperCase();
}

/**
 * Check if color is valid for Android VectorDrawable
 * @param {string} color - Color value
 * @returns {boolean}
 */
export function isValidAndroidColor(color) {
  if (!color || color === 'none') {
    return true;
  }
  // Check for valid hex format
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
}
