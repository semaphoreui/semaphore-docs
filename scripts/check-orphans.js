#!/usr/bin/env node
/**
 * Fails (exit 1) if any markdown page under docs/ is not registered in
 * sidebars.js. Every page must be reachable from the sidebar, either as an
 * item or as a category `link` doc (see CLAUDE.md "Docs style guide").
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const docsDir = path.join(root, 'docs');

async function main() {
  const { default: sidebars } = await import(path.join(root, 'sidebars.js'));

  const registered = new Set();
  const collect = (items) => {
    for (const item of items) {
      if (typeof item === 'string') {
        registered.add(item);
      } else if (item && typeof item === 'object') {
        if (item.type === 'doc' && item.id) registered.add(item.id);
        if (item.link && item.link.type === 'doc' && item.link.id) {
          registered.add(item.link.id);
        }
        if (Array.isArray(item.items)) collect(item.items);
      }
    }
  };
  for (const sidebar of Object.values(sidebars)) collect(sidebar);

  const pages = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        pages.push(
          path
            .relative(docsDir, full)
            .replace(/\.mdx?$/, '')
            .split(path.sep)
            .join('/'),
        );
      }
    }
  };
  walk(docsDir);

  const orphans = pages.filter((p) => !registered.has(p));
  const missing = [...registered].filter((id) => !pages.includes(id));

  if (missing.length) {
    console.error('Sidebar entries without a matching file:');
    for (const id of missing) console.error(`  - ${id}`);
  }
  if (orphans.length) {
    console.error('Orphan pages (not registered in sidebars.js):');
    for (const p of orphans) console.error(`  - ${p}`);
    console.error('\nRegister each page in sidebars.js or delete it.');
  }
  if (orphans.length || missing.length) process.exit(1);
  console.log(`OK: ${pages.length} pages, all registered in the sidebar.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
