import { SvgGroupNode } from './SvgNode.js';

/**
 * SvgTree - Represents parsed SVG structure ready for conversion
 */
export class SvgTree {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.viewBox = null;
    this.root = null;
    this.errors = [];
    this.warnings = [];
    this.scaleFactor = 1;
  }

  /**
   * Set the root node
   * @param {SvgGroupNode} root
   */
  setRoot(root) {
    this.root = root;
  }

  /**
   * Get the root node
   * @returns {SvgGroupNode}
   */
  getRoot() {
    return this.root;
  }

  /**
   * Log an error that prevents conversion
   * @param {string} message
   */
  logError(message) {
    this.errors.push(message);
  }

  /**
   * Log a warning that doesn't prevent conversion
   * @param {string} message
   */
  logWarning(message) {
    this.warnings.push(message);
  }

  /**
   * Get all errors
   * @returns {string[]}
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Get all warnings
   * @returns {string[]}
   */
  getWarnings() {
    return [...this.warnings];
  }

  /**
   * Check if conversion is possible
   * @returns {boolean}
   */
  canConvert() {
    return this.errors.length === 0 && this.viewBox !== null;
  }

  /**
   * Get effective width (from viewBox if width is not set)
   * @returns {number}
   */
  getEffectiveWidth() {
    if (this.width > 0) {
      return this.width;
    }
    return this.viewBox ? this.viewBox[2] : 0;
  }

  /**
   * Get effective height (from viewBox if height is not set)
   * @returns {number}
   */
  getEffectiveHeight() {
    if (this.height > 0) {
      return this.height;
    }
    return this.viewBox ? this.viewBox[3] : 0;
  }
}
