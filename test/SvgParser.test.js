import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SvgParser } from '../src/parser/SvgParser.js';

describe('SvgParser', () => {
  const parser = new SvgParser();

  describe('parse', () => {
    it('should parse valid SVG with viewBox', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10 L20 20"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      
      assert.strictEqual(tree.canConvert(), true);
      assert.deepStrictEqual(tree.viewBox, [0, 0, 24, 24]);
    });

    it('should extract width and height', () => {
      const svg = `<svg width="100" height="50" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      
      assert.strictEqual(tree.width, 100);
      assert.strictEqual(tree.height, 50);
    });

    it('should handle px units', () => {
      const svg = `<svg width="100px" height="50px" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      
      assert.strictEqual(tree.width, 100);
      assert.strictEqual(tree.height, 50);
    });

    it('should handle percentage width/height by using viewBox', () => {
      const svg = `<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      
      assert.strictEqual(tree.getEffectiveWidth(), 24);
      assert.strictEqual(tree.getEffectiveHeight(), 24);
    });

    it('should error on missing viewBox', () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      
      assert.strictEqual(tree.canConvert(), false);
      assert.ok(tree.getErrors().some(e => e.includes('viewBox')));
    });

    it('should error on invalid SVG', () => {
      const svg = '<not-svg></not-svg>';
      
      const tree = parser.parse(svg);
      
      assert.strictEqual(tree.canConvert(), false);
    });
  });

  describe('path extraction', () => {
    it('should extract path with d attribute', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10 L20 20"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      const root = tree.getRoot();
      
      assert.ok(root.hasChildren());
      assert.strictEqual(root.children[0].pathData, 'M10 10 L20 20');
    });

    it('should fix negative number parsing in path', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10-5 L20-10"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      const root = tree.getRoot();
      
      assert.strictEqual(root.children[0].pathData, 'M10,-5 L20,-10');
    });

    it('should extract stroke attributes', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0" stroke="#FF0000" stroke-width="2"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      const path = tree.getRoot().children[0];
      
      assert.strictEqual(path.attributes.get('android:strokeColor'), '#FF0000');
      assert.strictEqual(path.attributes.get('android:strokeWidth'), '2');
    });

    it('should extract fill attributes', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0" fill="#00FF00"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      const path = tree.getRoot().children[0];
      
      assert.strictEqual(path.attributes.get('android:fillColor'), '#00FF00');
    });

    it('should convert CSS var to fallback color', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0" fill="var(--fill-0, #C12031)"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      const path = tree.getRoot().children[0];
      
      assert.strictEqual(path.attributes.get('android:fillColor'), '#C12031');
    });
  });

  describe('rect extraction', () => {
    it('should convert rect to path', () => {
      const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="20" width="30" height="40"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      const path = tree.getRoot().children[0];
      
      assert.ok(path.hasPathData());
      assert.ok(path.pathData.includes('M10,20'));
    });

    it('should skip transparent rect', () => {
      const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="20" width="30" height="40" style="opacity:0"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      
      assert.strictEqual(tree.getRoot().hasChildren(), false);
    });
  });

  describe('circle extraction', () => {
    it('should convert circle to path', () => {
      const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="25"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      const path = tree.getRoot().children[0];
      
      assert.ok(path.hasPathData());
      assert.ok(path.pathData.includes('M50,50'));
      assert.ok(path.pathData.includes('a25,25'));
    });
  });

  describe('polygon extraction', () => {
    it('should convert polygon to path', () => {
      const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,0 100,100 0,100"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      const path = tree.getRoot().children[0];
      
      assert.ok(path.hasPathData());
      assert.ok(path.pathData.includes('M50,0'));
      assert.ok(path.pathData.includes('z'));
    });
  });

  describe('line extraction', () => {
    it('should convert line to path', () => {
      const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <line x1="10" y1="20" x2="80" y2="90"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      const path = tree.getRoot().children[0];
      
      assert.ok(path.hasPathData());
      assert.strictEqual(path.pathData, 'M10,20 L80,90');
    });
  });

  describe('group handling', () => {
    it('should handle nested groups', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g id="outer">
          <g id="inner">
            <path d="M0 0"/>
          </g>
        </g>
      </svg>`;
      
      const tree = parser.parse(svg);
      
      assert.strictEqual(tree.canConvert(), true);
    });

    it('should skip hidden elements', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0" style="display:none"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      
      assert.strictEqual(tree.getRoot().hasChildren(), false);
    });

    it('should skip elements in hidden groups', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g style="display:none">
          <path d="M0 0"/>
        </g>
      </svg>`;
      
      const tree = parser.parse(svg);
      
      // The group exists but has no visible children
      assert.strictEqual(tree.getRoot().children[0]?.hasChildren() ?? false, false);
    });
  });

  describe('unsupported elements', () => {
    it('should warn about unsupported elements', () => {
      const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <text>Hello</text>
        <path d="M0 0"/>
      </svg>`;
      
      const tree = parser.parse(svg);
      
      assert.strictEqual(tree.canConvert(), true);
      assert.ok(tree.getWarnings().some(w => w.includes('text')));
    });
  });
});
