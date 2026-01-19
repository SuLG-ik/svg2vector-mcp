# SVG to Vector Drawable MCP Server

MCP (Model Context Protocol) server for converting SVG files to Android Vector Drawable XML format.

## Features

- ✅ Converts SVG files to Android Vector Drawable XML
- ✅ Supports local files and remote URLs
- ✅ Handles common SVG shapes: path, rect, circle, polygon, line
- ✅ Converts shapes to path elements
- ✅ Preserves stroke and fill properties
- ✅ Handles CSS styles and presentation attributes
- ✅ Works seamlessly with SVGs exported from [Figma MCP](https://developers.figma.com/docs/figma-mcp-server/)

## Installation

### From npm (recommended)

```bash
npm install -g svg2vector-mcp
```

### From source

```bash
git clone <your-repo>
cd svg2vector-mcp
npm install
npm link
```

## Usage

### As an MCP Server

Add to your MCP client configuration (e.g., Claude Desktop):

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "svg2vector": {
      "command": "svg2vector-mcp"
    }
  }
}
```

Or if installed from source:

```json
{
  "mcpServers": {
    "svg2vector": {
      "command": "node",
      "args": ["/path/to/svg2vector-mcp/src/index.js"]
    }
  }
}
```

### Available Tools

#### `convert_svg_to_vector`

Converts an SVG file to Android Vector Drawable XML format.

**Parameters:**
- `svgPath` (string, required): Path to SVG file (local path or URL)
- `outputPath` (string, required): Output path for the generated XML file

**Example:**

```javascript
// Convert local SVG file
{
  "svgPath": "/path/to/icon.svg",
  "outputPath": "/path/to/output/icon.xml"
}

// Convert remote SVG file
{
  "svgPath": "https://example.com/icon.svg",
  "outputPath": "./output/icon.xml"
}

// Convert SVG exported from Figma MCP
{
  "svgPath": "/path/to/figma-export.svg",
  "outputPath": "./android/res/drawable/ic_figma_icon.xml"
}
```

## Integration with Figma MCP

This MCP server works seamlessly with the [official Figma MCP server](https://developers.figma.com/docs/figma-mcp-server/). You can use Figma MCP to export SVG assets from Figma designs, and then use this server to convert them to Android Vector Drawables.

**Workflow example:**
1. Use Figma MCP to export SVG from your Figma design
2. Use svg2vector-mcp to convert the exported SVG to Android Vector Drawable XML
3. Use the generated XML in your Android project

This makes it easy to maintain design consistency between Figma and Android applications.

## Supported SVG Elements

### Fully Supported
- `<path>` - Path elements
- `<rect>` - Rectangles (converted to paths)
- `<circle>` - Circles (converted to paths)
- `<polygon>` - Polygons (converted to paths)
- `<line>` - Lines (converted to paths)
- `<g>` - Groups

### Supported Attributes
- `stroke` - Stroke color
- `stroke-opacity` - Stroke alpha
- `stroke-width` - Stroke width
- `stroke-linecap` - Stroke line cap
- `stroke-linejoin` - Stroke line join
- `fill` - Fill color
- `fill-opacity` - Fill alpha
- `opacity` - Overall opacity

### Not Supported
- Text elements
- Gradients
- Filters
- Animations
- Ellipses (use circle or convert manually)
- Polylines (use polygon instead)
- Embedded images
- Clipping paths

## Output Format

The tool generates Android Vector Drawable XML files compatible with Android API 21+:

```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
        android:width="24dp"
        android:height="24dp"
        android:viewportWidth="24"
        android:viewportHeight="24">
    <path
        android:pathData="M12,2 L2,22 L22,22 Z"
        android:fillColor="#000000"/>
</vector>
```

## Development

### Project Structure

```
svg2vector-mcp/
├── src/
│   ├── index.js              # MCP server entry point
│   ├── constants.js          # Shared constants and mappings
│   ├── converter/
│   │   ├── index.js          # Converter module exports
│   │   ├── SvgConverter.js   # Main converter class
│   │   └── XmlWriter.js      # XML output writer
│   ├── parser/
│   │   ├── index.js          # Parser module exports
│   │   └── SvgParser.js      # SVG parsing logic
│   ├── tree/
│   │   ├── index.js          # Tree module exports
│   │   ├── SvgNode.js        # SVG node classes
│   │   └── SvgTree.js        # SVG tree container
│   └── utils/
│       ├── index.js          # Utils module exports
│       ├── ColorUtils.js     # Color conversion utilities
│       └── PathBuilder.js    # Path construction builder
├── test/
│   ├── ColorUtils.test.js    # Color utilities tests
│   ├── PathBuilder.test.js   # Path builder tests
│   ├── SvgParser.test.js     # Parser tests
│   ├── SvgConverter.test.js  # Converter tests
│   └── integration.test.js   # Integration tests
├── test-data/                # Test SVG/XML files
├── package.json
└── README.md
```

### Running Locally

```bash
# Install dependencies
npm install

# Run the server
npm start

# Or directly
node src/index.js
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Using the Converter Programmatically

```javascript
import { SvgConverter } from 'svg2vector-mcp/converter';

const converter = new SvgConverter();
const result = converter.convert(svgContent);

if (result.success) {
  console.log(result.xml);
} else {
  console.error(result.errors);
}
```

## Troubleshooting

### "Not a proper SVG file"
- Ensure the file contains a valid `<svg>` root element

### "Missing viewBox in <svg> element"
- Add a `viewBox` attribute to your SVG element
- Or ensure `width` and `height` attributes are present

### Unsupported element warnings
- The converter will log warnings for unsupported SVG features
- The conversion will continue but may not include all visual elements

## License

MIT

## Credits

Based on the Android SVG to VectorDrawable converter from the Android Open Source Project.
