import { describe, it } from 'node:test';
import assert from 'node:assert';
import { colorToHex, rgbToHex, normalizeHex, isValidAndroidColor } from '../src/utils/ColorUtils.js';

describe('ColorUtils', () => {
  describe('colorToHex', () => {
    it('should return null for null input', () => {
      assert.strictEqual(colorToHex(null), null);
    });

    it('should return none for none input', () => {
      assert.strictEqual(colorToHex('none'), 'none');
    });

    it('should pass through hex colors', () => {
      assert.strictEqual(colorToHex('#FF0000'), '#FF0000');
      assert.strictEqual(colorToHex('#abc'), '#AABBCC');
    });

    it('should convert named colors', () => {
      assert.strictEqual(colorToHex('red'), '#FF0000');
      assert.strictEqual(colorToHex('black'), '#000000');
      assert.strictEqual(colorToHex('white'), '#FFFFFF');
    });

    it('should be case insensitive for named colors', () => {
      assert.strictEqual(colorToHex('RED'), '#FF0000');
      assert.strictEqual(colorToHex('Black'), '#000000');
    });

    it('should convert rgb format', () => {
      assert.strictEqual(colorToHex('rgb(255, 0, 0)'), '#FF0000');
      assert.strictEqual(colorToHex('rgb(0, 255, 0)'), '#00FF00');
    });

    it('should extract fallback from CSS var', () => {
      assert.strictEqual(colorToHex('var(--fill-0, #C12031)'), '#C12031');
      assert.strictEqual(colorToHex('var(--stroke-0, #D1D1D6)'), '#D1D1D6');
    });

    it('should handle nested var with named color', () => {
      assert.strictEqual(colorToHex('var(--color, red)'), '#FF0000');
    });

    it('should return original value if conversion not possible', () => {
      assert.strictEqual(colorToHex('unknown-color'), 'unknown-color');
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      assert.strictEqual(rgbToHex(255, 0, 0), '#FF0000');
      assert.strictEqual(rgbToHex(0, 255, 0), '#00FF00');
      assert.strictEqual(rgbToHex(0, 0, 255), '#0000FF');
    });

    it('should clamp values to 0-255', () => {
      assert.strictEqual(rgbToHex(300, -10, 128), '#FF0080');
    });

    it('should pad single digit hex values', () => {
      assert.strictEqual(rgbToHex(0, 0, 0), '#000000');
      assert.strictEqual(rgbToHex(1, 2, 3), '#010203');
    });
  });

  describe('normalizeHex', () => {
    it('should expand 3-digit hex to 6-digit', () => {
      assert.strictEqual(normalizeHex('#abc'), '#AABBCC');
      assert.strictEqual(normalizeHex('#123'), '#112233');
    });

    it('should uppercase 6-digit hex', () => {
      assert.strictEqual(normalizeHex('#aabbcc'), '#AABBCC');
    });

    it('should keep 6-digit hex unchanged if already uppercase', () => {
      assert.strictEqual(normalizeHex('#AABBCC'), '#AABBCC');
    });
  });

  describe('isValidAndroidColor', () => {
    it('should accept null/undefined/none', () => {
      assert.strictEqual(isValidAndroidColor(null), true);
      assert.strictEqual(isValidAndroidColor(undefined), true);
      assert.strictEqual(isValidAndroidColor('none'), true);
    });

    it('should accept 3-digit hex', () => {
      assert.strictEqual(isValidAndroidColor('#abc'), true);
      assert.strictEqual(isValidAndroidColor('#ABC'), true);
    });

    it('should accept 6-digit hex', () => {
      assert.strictEqual(isValidAndroidColor('#aabbcc'), true);
      assert.strictEqual(isValidAndroidColor('#AABBCC'), true);
    });

    it('should accept 8-digit hex (with alpha)', () => {
      assert.strictEqual(isValidAndroidColor('#aabbccdd'), true);
    });

    it('should reject invalid formats', () => {
      assert.strictEqual(isValidAndroidColor('red'), false);
      assert.strictEqual(isValidAndroidColor('rgb(0,0,0)'), false);
      assert.strictEqual(isValidAndroidColor('#ab'), false);
      assert.strictEqual(isValidAndroidColor('#abcde'), false);
    });
  });
});
