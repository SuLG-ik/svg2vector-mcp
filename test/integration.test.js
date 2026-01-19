import { describe, it } from 'node:test';
import assert from 'node:assert';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SvgConverter } from '../src/converter/SvgConverter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DATA_DIR = path.join(__dirname, '..', 'test-data');

/**
 * Integration tests using real test data files
 */
describe('Integration Tests', () => {
  const converter = new SvgConverter();

  async function getTestCases() {
    const files = await fs.readdir(TEST_DATA_DIR);
    const svgFiles = files.filter(f => f.endsWith('.svg'));
    return svgFiles.map(f => ({
      name: f.replace('.svg', ''),
      svgPath: path.join(TEST_DATA_DIR, f),
      xmlPath: path.join(TEST_DATA_DIR, f.replace('.svg', '.xml')),
    }));
  }

  describe('Test data conversion', () => {
    it('should convert all test SVG files successfully', async () => {
      const testCases = await getTestCases();
      
      for (const testCase of testCases) {
        const svgContent = await fs.readFile(testCase.svgPath, 'utf-8');
        const result = converter.convert(svgContent);
        
        assert.strictEqual(
          result.success, 
          true, 
          `Failed to convert ${testCase.name}: ${result.errors.join(', ')}`
        );
        assert.ok(result.xml, `No XML generated for ${testCase.name}`);
      }
    });

    it('should generate valid VectorDrawable structure for all files', async () => {
      const testCases = await getTestCases();
      
      for (const testCase of testCases) {
        const svgContent = await fs.readFile(testCase.svgPath, 'utf-8');
        const result = converter.convert(svgContent);
        
        if (result.success) {
          // Check essential VectorDrawable elements
          assert.ok(
            result.xml.includes('<vector xmlns:android'),
            `Missing vector tag in ${testCase.name}`
          );
          assert.ok(
            result.xml.includes('android:width'),
            `Missing width in ${testCase.name}`
          );
          assert.ok(
            result.xml.includes('android:height'),
            `Missing height in ${testCase.name}`
          );
          assert.ok(
            result.xml.includes('android:viewportWidth'),
            `Missing viewportWidth in ${testCase.name}`
          );
          assert.ok(
            result.xml.includes('</vector>'),
            `Missing closing vector tag in ${testCase.name}`
          );
        }
      }
    });

    it('should preserve path data from SVG files', async () => {
      const testCases = await getTestCases();
      
      for (const testCase of testCases) {
        const svgContent = await fs.readFile(testCase.svgPath, 'utf-8');
        const result = converter.convert(svgContent);
        
        if (result.success) {
          // Check that paths are present
          const hasPath = result.xml.includes('android:pathData');
          assert.ok(hasPath, `No pathData in output for ${testCase.name}`);
        }
      }
    });
  });

  describe('Specific test cases', () => {
    it('should handle ic_arrow_right.svg', async () => {
      const svgPath = path.join(TEST_DATA_DIR, 'ic_arrow_right.svg');
      const svgContent = await fs.readFile(svgPath, 'utf-8');
      const result = converter.convert(svgContent);
      
      assert.strictEqual(result.success, true);
      assert.deepStrictEqual(result.viewBox, [0, 0, 14, 17]);
      
      // Should have stroke properties
      assert.ok(result.xml.includes('android:strokeColor'));
      assert.ok(result.xml.includes('android:strokeWidth'));
    });

    it('should handle ic_order_cancel.svg', async () => {
      const svgPath = path.join(TEST_DATA_DIR, 'ic_order_cancel.svg');
      const svgContent = await fs.readFile(svgPath, 'utf-8');
      const result = converter.convert(svgContent);
      
      assert.strictEqual(result.success, true);
      assert.deepStrictEqual(result.viewBox, [0, 0, 24, 22]);
      
      // Should have fill properties
      assert.ok(result.xml.includes('android:fillColor'));
    });

    it('should handle ill_connection_error.svg', async () => {
      const svgPath = path.join(TEST_DATA_DIR, 'ill_connection_error.svg');
      const svgContent = await fs.readFile(svgPath, 'utf-8');
      const result = converter.convert(svgContent);
      
      assert.strictEqual(result.success, true);
      assert.deepStrictEqual(result.viewBox, [0, 0, 479, 483]);
      
      // Should handle fill-opacity
      assert.ok(result.xml.includes('android:fillAlpha'));
    });
  });

  describe('Color extraction', () => {
    it('should extract CSS var fallback colors correctly', async () => {
      const svgPath = path.join(TEST_DATA_DIR, 'ic_arrow_right.svg');
      const svgContent = await fs.readFile(svgPath, 'utf-8');
      const result = converter.convert(svgContent);
      
      // Original has var(--stroke-0, #D1D1D6)
      assert.ok(result.xml.includes('#D1D1D6'));
    });
  });
});
