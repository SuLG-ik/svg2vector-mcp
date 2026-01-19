import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { PathBuilder } from '../src/utils/PathBuilder.js';

describe('PathBuilder', () => {
  describe('absoluteMoveTo', () => {
    it('should create M command with coordinates', () => {
      const builder = new PathBuilder();
      builder.absoluteMoveTo(10, 20);
      assert.strictEqual(builder.toString(), 'M10,20');
    });

    it('should handle decimal values', () => {
      const builder = new PathBuilder();
      builder.absoluteMoveTo(10.5, 20.75);
      assert.strictEqual(builder.toString(), 'M10.5,20.75');
    });

    it('should handle negative values', () => {
      const builder = new PathBuilder();
      builder.absoluteMoveTo(-10, -20);
      assert.strictEqual(builder.toString(), 'M-10,-20');
    });
  });

  describe('relativeMoveTo', () => {
    it('should create m command with offsets', () => {
      const builder = new PathBuilder();
      builder.relativeMoveTo(5, 10);
      assert.strictEqual(builder.toString(), 'm5,10');
    });
  });

  describe('absoluteLineTo', () => {
    it('should create L command with coordinates', () => {
      const builder = new PathBuilder();
      builder.absoluteLineTo(100, 200);
      assert.strictEqual(builder.toString(), 'L100,200');
    });
  });

  describe('relativeLineTo', () => {
    it('should create l command with offsets', () => {
      const builder = new PathBuilder();
      builder.relativeLineTo(15, 25);
      assert.strictEqual(builder.toString(), 'l15,25');
    });
  });

  describe('relativeHorizontalTo', () => {
    it('should create h command with x offset', () => {
      const builder = new PathBuilder();
      builder.relativeHorizontalTo(50);
      assert.strictEqual(builder.toString(), 'h50');
    });
  });

  describe('relativeVerticalTo', () => {
    it('should create v command with y offset', () => {
      const builder = new PathBuilder();
      builder.relativeVerticalTo(75);
      assert.strictEqual(builder.toString(), 'v75');
    });
  });

  describe('relativeArcTo', () => {
    it('should create arc command with correct flags', () => {
      const builder = new PathBuilder();
      builder.relativeArcTo(10, 10, false, true, true, 20, 0);
      assert.strictEqual(builder.toString(), 'a10,10 0 0,1 20,0');
    });

    it('should set largeArc flag correctly', () => {
      const builder = new PathBuilder();
      builder.relativeArcTo(10, 10, true, true, true, 20, 0);
      assert.strictEqual(builder.toString(), 'a10,10 0 1,1 20,0');
    });
  });

  describe('relativeClose', () => {
    it('should create z command', () => {
      const builder = new PathBuilder();
      builder.relativeClose();
      assert.strictEqual(builder.toString(), 'z');
    });
  });

  describe('chaining', () => {
    it('should support method chaining', () => {
      const builder = new PathBuilder();
      const result = builder
        .absoluteMoveTo(0, 0)
        .relativeLineTo(10, 0)
        .relativeLineTo(0, 10)
        .relativeClose();
      
      assert.strictEqual(result, builder);
      assert.strictEqual(builder.toString(), 'M0,0 l10,0 l0,10 z');
    });
  });

  describe('reset', () => {
    it('should clear all commands', () => {
      const builder = new PathBuilder();
      builder.absoluteMoveTo(10, 20);
      builder.reset();
      assert.strictEqual(builder.toString(), '');
    });
  });

  describe('complex paths', () => {
    it('should build rectangle path', () => {
      const builder = new PathBuilder();
      builder
        .absoluteMoveTo(0, 0)
        .relativeHorizontalTo(100)
        .relativeVerticalTo(50)
        .relativeHorizontalTo(-100)
        .relativeClose();
      
      assert.strictEqual(builder.toString(), 'M0,0 h100 v50 h-100 z');
    });

    it('should build circle path', () => {
      const r = 10;
      const builder = new PathBuilder();
      builder
        .absoluteMoveTo(50, 50)
        .relativeMoveTo(-r, 0)
        .relativeArcTo(r, r, false, true, true, 2 * r, 0)
        .relativeArcTo(r, r, false, true, true, -2 * r, 0);
      
      const expected = 'M50,50 m-10,0 a10,10 0 0,1 20,0 a10,10 0 0,1 -20,0';
      assert.strictEqual(builder.toString(), expected);
    });
  });
});
