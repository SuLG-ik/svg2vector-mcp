 # Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-19

### Changed
- **Major refactoring**: Restructured project to use `src/` directory with modular architecture
- Reorganized codebase into logical modules: `converter/`, `parser/`, `tree/`, `utils/`
- Migrated from flat structure to proper module exports

### Added
- Comprehensive test suite with unit and integration tests
- Proper module exports in `package.json`

### Removed
- Deprecated root-level files and obsolete documentation

## [1.0.0] - 2025-12-04

### Added
- Initial release
- MCP server for converting SVG to Android Vector Drawable XML
- Support for local and remote SVG files
- Conversion of basic SVG shapes (path, rect, circle, polygon, line) to paths
- Preservation of stroke and fill properties
- CSS style and presentation attributes support
- Command-line tool `svg2vector-mcp`
- Comprehensive documentation and examples

### Supported Features
- `<path>` elements
- `<rect>` to path conversion
- `<circle>` to path conversion
- `<polygon>` to path conversion
- `<line>` to path conversion
- `<g>` group elements
- Stroke properties (color, width, opacity, linecap, linejoin)
- Fill properties (color, opacity)
- ViewBox and dimension handling
- Local and remote file support

[1.0.0]: https://github.com/yourusername/svg2vector-mcp/releases/tag/v1.0.0
