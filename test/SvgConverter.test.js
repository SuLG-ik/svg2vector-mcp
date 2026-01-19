import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SvgConverter } from '../src/converter/SvgConverter.js';

describe('SvgConverter', () => {
  const converter = new SvgConverter();

  describe('convert', () => {
    it('should convert simple SVG to VectorDrawable', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10 L20 20" stroke="#FF0000" stroke-width="2"/>
      </svg>`;
      
      const result = converter.convert(svg);
      
      assert.strictEqual(result.success, true);
      assert.ok(result.xml.includes('xmlns:android'));
      assert.ok(result.xml.includes('android:pathData'));
      assert.ok(result.xml.includes('android:strokeColor="#FF0000"'));
    });

    it('should return error for invalid SVG', () => {
      const svg = '<invalid></invalid>';
      
      const result = converter.convert(svg);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
    });

    it('should include correct dimensions', () => {
      const svg = `<svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0"/>
      </svg>`;
      
      const result = converter.convert(svg);
      
      assert.strictEqual(result.width, 48);
      assert.strictEqual(result.height, 48);
      assert.ok(result.xml.includes('android:width="48dp"'));
      assert.ok(result.xml.includes('android:height="48dp"'));
    });

    it('should use viewBox dimensions when width/height not specified', () => {
      const svg = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0"/>
      </svg>`;
      
      const result = converter.convert(svg);
      
      assert.strictEqual(result.width, 32);
      assert.strictEqual(result.height, 32);
    });

    it('should include viewBox in result', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0"/>
      </svg>`;
      
      const result = converter.convert(svg);
      
      assert.deepStrictEqual(result.viewBox, [0, 0, 24, 24]);
      assert.ok(result.xml.includes('android:viewportWidth="24"'));
      assert.ok(result.xml.includes('android:viewportHeight="24"'));
    });

    it('should handle multiple paths', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 L10 10" fill="#FF0000"/>
        <path d="M20 20 L30 30" fill="#00FF00"/>
      </svg>`;
      
      const result = converter.convert(svg);
      
      assert.strictEqual(result.success, true);
      const pathCount = (result.xml.match(/<path/g) || []).length;
      assert.strictEqual(pathCount, 2);
    });

    it('should properly close vector tag', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0"/>
      </svg>`;
      
      const result = converter.convert(svg);
      
      assert.ok(result.xml.endsWith('</vector>\n'));
    });
  });

  describe('XML output format', () => {
    it('should have proper indentation', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0"/>
      </svg>`;
      
      const result = converter.convert(svg);
      const lines = result.xml.split('\n');
      
      // Vector attributes should be indented with 8 spaces
      assert.ok(lines.some(l => l.startsWith('        android:width')));
      // Path should be indented with 4 spaces
      assert.ok(lines.some(l => l.startsWith('    <path')));
    });

    it('should format path attributes on separate lines', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0" stroke="#FF0000" stroke-width="2"/>
      </svg>`;
      
      const result = converter.convert(svg);
      
      // Path data and stroke color should be on different lines
      assert.ok(result.xml.includes('android:pathData='));
      assert.ok(result.xml.includes('\n        android:strokeColor'));
    });
  });
});
