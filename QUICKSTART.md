# Quick Start Guide

## Installation

```bash
npm install -g svg2vector-mcp
```

## Configuration for Claude Desktop

### MacOS
Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows
Edit: `%APPDATA%/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "svg2vector": {
      "command": "svg2vector-mcp"
    }
  }
}
```

Restart Claude Desktop.

## Usage Examples

### In Claude Desktop

Once configured, you can simply ask Claude:

```
Convert this SVG file to Android Vector Drawable:
/path/to/icon.svg
Save it as /path/to/output/icon.xml
```

Or:

```
Download and convert this SVG to Vector Drawable:
https://example.com/icon.svg
Save to ./icons/icon.xml
```

### Using the Tool Directly

The MCP server exposes a tool called `convert_svg_to_vector` with parameters:

- `svgPath`: Path to SVG file (local or URL)
- `outputPath`: Where to save the XML file

## Example Output

Input SVG:
```xml
<svg width="24" height="24" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" fill="#FF0000"/>
</svg>
```

Output Vector Drawable:
```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
        android:width="24dp"
        android:height="24dp"
        android:viewportWidth="24"
        android:viewportHeight="24">
    <path
        android:pathData="M12,12 m-10,0 a10,10 0 0,1 20,0 a10,10 0 0,1 -20,0"
        android:fillColor="#FF0000"/>
</vector>
```

## Common Use Cases

1. **Convert local icon file**
   - Input: `/Users/me/icons/star.svg`
   - Output: `/Users/me/android/res/drawable/ic_star.xml`

2. **Download and convert from URL**
   - Input: `https://cdn.example.com/icons/menu.svg`
   - Output: `./drawable/ic_menu.xml`

3. **Batch conversion**
   - Use Claude to convert multiple files by asking it to process a folder

## Troubleshooting

### Server not found
- Make sure you ran `npm install -g svg2vector-mcp`
- Restart Claude Desktop after configuration

### Conversion errors
- Check that your SVG has a `viewBox` attribute
- Ensure the SVG uses supported elements (path, rect, circle, polygon, line)
- Some SVG features (gradients, text, filters) are not supported

### Permission errors
- Check file paths are correct
- Ensure write permissions for output directory

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [PUBLISHING.md](PUBLISHING.md) for npm publishing instructions
- See [CHANGELOG.md](CHANGELOG.md) for version history
