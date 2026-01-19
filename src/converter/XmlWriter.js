/**
 * XmlWriter - Writes SvgTree as Android VectorDrawable XML
 */
export class XmlWriter {
  /**
   * Write SvgTree to Android VectorDrawable XML string
   * @param {import('../tree/SvgTree.js').SvgTree} tree
   * @returns {string}
   */
  write(tree) {
    const width = tree.getEffectiveWidth();
    const height = tree.getEffectiveHeight();
    const scaleFactor = tree.scaleFactor || 1;
    
    const lines = [];
    
    // Header
    lines.push('<vector xmlns:android="http://schemas.android.com/apk/res/android"');
    lines.push(`        android:width="${Math.round(width * scaleFactor)}dp"`);
    lines.push(`        android:height="${Math.round(height * scaleFactor)}dp"`);
    lines.push(`        android:viewportWidth="${width}"`);
    lines.push(`        android:viewportHeight="${height}">`);
    
    // Paths
    const writer = {
      content: '',
      write(str) {
        this.content += str;
      }
    };
    
    const root = tree.getRoot();
    if (root) {
      root.writeXml(writer, 1);
    }
    
    lines.push(writer.content.trimEnd());
    lines.push('</vector>');
    
    return lines.join('\n') + '\n';
  }
}
