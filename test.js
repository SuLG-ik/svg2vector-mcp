#!/usr/bin/env node

import { promises as fs } from 'fs';
import { parseSvg, writeVectorDrawableXml } from './svgParser.js';

async function test() {
  console.log('Testing SVG to Vector Drawable conversion...\n');
  
  try {
    // Read test SVG
    const svgContent = await fs.readFile('./test.svg', 'utf-8');
    console.log('✓ Read test.svg');
    
    // Parse SVG
    const svgTree = parseSvg(svgContent);
    console.log('✓ Parsed SVG');
    
    // Check for errors
    const errorLog = svgTree.getErrorLog();
    if (errorLog) {
      console.log('\nWarnings/Errors:');
      console.log(errorLog);
    }
    
    if (!svgTree.canConvertToVectorDrawable()) {
      console.log('\n✗ Cannot convert to Vector Drawable');
      return;
    }
    
    console.log('✓ SVG is valid for conversion');
    console.log(`  Width: ${svgTree.w}`);
    console.log(`  Height: ${svgTree.h}`);
    console.log(`  ViewBox: [${svgTree.viewBox.join(', ')}]`);
    
    // Generate Vector Drawable XML
    const vectorXml = writeVectorDrawableXml(svgTree);
    console.log('✓ Generated Vector Drawable XML');
    
    // Write to file
    await fs.writeFile('./test_output.xml', vectorXml, 'utf-8');
    console.log('✓ Saved to test_output.xml\n');
    
    console.log('Generated XML:');
    console.log('─'.repeat(50));
    console.log(vectorXml);
    console.log('─'.repeat(50));
    
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
  }
}

test();
