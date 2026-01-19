import { SvgParser } from '../parser/SvgParser.js';
import { XmlWriter } from './XmlWriter.js';

/**
 * SvgConverter - Main converter class for SVG to Android VectorDrawable
 */
export class SvgConverter {
  constructor() {
    this.parser = new SvgParser();
    this.xmlWriter = new XmlWriter();
  }

  /**
   * Convert SVG content to Android VectorDrawable XML
   * @param {string} svgContent - SVG XML content
   * @returns {ConversionResult}
   */
  convert(svgContent) {
    const tree = this.parser.parse(svgContent);
    
    if (!tree.canConvert()) {
      return {
        success: false,
        errors: tree.getErrors(),
        warnings: tree.getWarnings(),
        xml: null,
        width: 0,
        height: 0,
        viewBox: null,
      };
    }

    const xml = this.xmlWriter.write(tree);

    return {
      success: true,
      errors: [],
      warnings: tree.getWarnings(),
      xml,
      width: tree.getEffectiveWidth(),
      height: tree.getEffectiveHeight(),
      viewBox: tree.viewBox,
    };
  }
}

/**
 * @typedef {Object} ConversionResult
 * @property {boolean} success - Whether conversion was successful
 * @property {string[]} errors - Error messages
 * @property {string[]} warnings - Warning messages
 * @property {string|null} xml - Generated XML content
 * @property {number} width - Vector drawable width
 * @property {number} height - Vector drawable height
 * @property {number[]|null} viewBox - ViewBox values [minX, minY, width, height]
 */
