import fs from 'fs';
import * as cheerio from 'cheerio';
import { run } from '@mermaid-js/mermaid-cli';
import path from 'path';

async function renderMermaidWithCli(mermaidCode, index) {
  const inputFile = `diagram-${index}.mmd`;
  const outputFile = `diagram-${index}.svg`;

  // Write Mermaid code to a temporary file
  fs.writeFileSync(inputFile, mermaidCode);

  // Use Mermaid CLI's `run` to render the diagram
  await run(inputFile, outputFile);

  // Read the rendered SVG content
  const svgContent = fs.readFileSync(outputFile, 'utf8');

  // Clean up temporary files
  fs.unlinkSync(inputFile);
  fs.unlinkSync(outputFile);

  return svgContent;
}

async function processHtml(inputFile, outputFile) {
  const html = fs.readFileSync(inputFile, 'utf8');
  const $ = cheerio.load(html);
  const mermaidBlocks = $('div.mermaid, pre.mermaid');

  for (let i = 0; i < mermaidBlocks.length; i++) {
    const element = mermaidBlocks[i];
    const mermaidCode = $(element).text();

    try {
      console.log(`Rendering diagram ${i} with mermaid-cli...`);
      const svg = await renderMermaidWithCli(mermaidCode, i);
      $(element).replaceWith(svg);
    } catch (error) {
      console.error(`Error rendering diagram ${i}:`, error.message);
    }
  }

  fs.writeFileSync(outputFile, $.html());
  console.log(`Processed HTML written to ${outputFile}`);
}

// Get CLI arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node script.js <inputFile> [outputFile]');
  process.exit(1);
}

// Process the HTML
processHtml(args[0], args[0]);
