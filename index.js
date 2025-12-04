#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { promises as fs } from 'fs';
import { parseSvg, writeVectorDrawableXml } from './svgParser.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Svg2VectorServer {
  constructor() {
    this.server = new Server(
      {
        name: 'svg2vector-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'convert_svg_to_vector',
          description: 'Convert SVG file to Android Vector Drawable XML format. Accepts local file paths or remote URLs.',
          inputSchema: {
            type: 'object',
            properties: {
              svgPath: {
                type: 'string',
                description: 'Path to SVG file (local path or URL starting with http:// or https://)',
              },
              outputPath: {
                type: 'string',
                description: 'Output path for the generated Vector Drawable XML file',
              },
            },
            required: ['svgPath', 'outputPath'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'convert_svg_to_vector') {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      return await this.handleConvert(request.params.arguments);
    });
  }

  async handleConvert(args) {
    const { svgPath, outputPath } = args;

    if (!svgPath || !outputPath) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Both svgPath and outputPath are required',
          },
        ],
      };
    }

    try {
      // Fetch SVG content
      let svgContent;
      if (svgPath.startsWith('http://') || svgPath.startsWith('https://')) {
        // Remote URL
        const response = await axios.get(svgPath);
        svgContent = response.data;
      } else {
        // Local file
        svgContent = await fs.readFile(svgPath, 'utf-8');
      }

      // Parse SVG
      const svgTree = parseSvg(svgContent);

      // Check for errors
      const errorLog = svgTree.getErrorLog();
      if (!svgTree.canConvertToVectorDrawable()) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to convert SVG to Vector Drawable.\n\nErrors:\n${errorLog}`,
            },
          ],
        };
      }

      // Generate Vector Drawable XML
      const vectorXml = writeVectorDrawableXml(svgTree);

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Write to file
      await fs.writeFile(outputPath, vectorXml, 'utf-8');

      let resultMessage = `✅ Successfully converted SVG to Vector Drawable!\n\nOutput saved to: ${outputPath}\n`;
      
      if (errorLog) {
        resultMessage += `\n⚠️ Warnings:\n${errorLog}`;
      }

      resultMessage += `\n\nVector Drawable details:
- Width: ${svgTree.w}
- Height: ${svgTree.h}
- ViewBox: [${svgTree.viewBox.join(', ')}]`;

      return {
        content: [
          {
            type: 'text',
            text: resultMessage,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error converting SVG: ${error.message}\n\nStack trace:\n${error.stack}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SVG to Vector Drawable MCP server running on stdio');
  }
}

const server = new Svg2VectorServer();
server.run().catch(console.error);
