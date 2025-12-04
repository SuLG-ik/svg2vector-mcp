# SVG to Vector Drawable MCP Server

MCP (Model Context Protocol) server for converting SVG files to Android Vector Drawable XML format.

## Features

- ✅ Converts SVG files to Android Vector Drawable XML
- ✅ Supports local files and remote URLs
- ✅ Handles common SVG shapes: path, rect, circle, polygon, line
- ✅ Converts shapes to path elements
- ✅ Preserves stroke and fill properties
- ✅ Handles CSS styles and presentation attributes

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
      "args": ["/path/to/svg2vector-mcp/index.js"]
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
```

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
├── index.js          # MCP server entry point
├── svgParser.js      # SVG parsing logic
├── svgTree.js        # SVG tree data structures
├── pathBuilder.js    # Path construction utilities
├── package.json      # Package configuration
└── README.md         # This file
```

### Running Locally

```bash
# Install dependencies
npm install

# Run the server
node index.js
```

### Testing

Test with a simple SVG file:

```bash
# Create a test SVG
echo '<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FF0000"/></svg>' > test.svg

# Use the MCP server through your client to convert it
```

## Publishing to npm

1. Update version in `package.json`
2. Login to npm: `npm login`
3. Publish: `npm publish`

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
