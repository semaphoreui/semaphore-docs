#!/usr/bin/env node
/**
 * Structural checks for the documentation. Run from the repository root:
 *
 *   node scripts/check-docs.mjs
 *
 * Checks:
 *   1. front matter  — every non-empty English page has `title` and `description`.
 *   2. sidebar        — every non-empty English page is reachable from sidebars.js.
 *   3. translations   — every locale copy matches the English page structurally:
 *                       same explicit heading ids, same number of code fences,
 *                       links, headings and import lines, and is not a verbatim
 *                       copy of the English text.
 *
 * The third check is what keeps ten locales honest: a translation that silently
 * lost a section, an anchor, or a code block fails here instead of shipping.
 *
 * Exit code 1 on any failure, so it can gate CI.
 */

import {readFileSync, readdirSync, statSync, existsSync} from 'node:fs';
import {join, relative} from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const DOCS = join(ROOT, 'docs');
const I18N = join(ROOT, 'i18n');
const MIN_SIZE = 30; // bytes; smaller files are placeholders, not pages

const failures = [];
const fail = (msg) => failures.push(msg);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (entry.endsWith('.md') || entry.endsWith('.mdx')) out.push(p);
  }
  return out;
}

const pages = walk(DOCS)
  .filter((p) => statSync(p).size > MIN_SIZE)
  .map((p) => relative(DOCS, p).replace(/\.mdx?$/, ''));

// --- 1. front matter -------------------------------------------------------

for (const id of pages) {
  const text = readFileSync(join(DOCS, `${id}.md`), 'utf8');
  if (!text.startsWith('---\n')) {
    fail(`${id}: no front matter (title and description are required)`);
    continue;
  }
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) {
    fail(`${id}: front matter is not terminated`);
    continue;
  }
  const fm = text.slice(4, end);
  if (!/^title: .+$/m.test(fm)) fail(`${id}: front matter has no title`);
  if (!/^description: .+$/m.test(fm)) fail(`${id}: front matter has no description`);

  // A colon followed by a space makes YAML read the value as a mapping and the
  // build dies with an unhelpful gray-matter error. Quote such values.
  for (const [, key, value] of fm.matchAll(/^(title|description): (.+)$/gm)) {
    const v = value.trim();
    if (v && !/^["']/.test(v) && /:\s/.test(v)) {
      fail(`${id}: front matter ${key} contains ": " and must be quoted`);
    }
  }
}

// --- 2. sidebar reachability ----------------------------------------------

const sidebar = readFileSync(join(ROOT, 'sidebars.js'), 'utf8')
  .split('\n')
  .filter((l) => !l.trim().startsWith('//'))
  .join('\n');

/**
 * Pages that are intentionally not in the sidebar yet. Each one is documentation
 * debt recorded by the docs audit (AGENTS/research/docs-structure-audit-2026-09.md)
 * and is resolved in a later phase of the restructuring, not here:
 *
 *   admin-guide/configuration/cli, configuration/snap,
 *   admin-guide/installation/cloud, installation/snap
 *       deprecated or stub pages awaiting a keep-or-delete decision.
 *
 * Removing a page from this list without either linking or deleting it will fail
 * the build, which is the point: the list may only shrink.
 */
const KNOWN_ORPHANS = new Set([
  'admin-guide/configuration/cli',
  'admin-guide/configuration/snap',
  'admin-guide/installation/cloud',
  'admin-guide/installation/snap',
]);

const referenced = new Set([
  ...[...sidebar.matchAll(/'([\w./-]+)'/g)].map((m) => m[1]),
  ...[...sidebar.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]),
]);

for (const id of pages) {
  const asCategoryIndex = id.endsWith('/README') ? id.slice(0, -'/README'.length) : null;
  if (
    !referenced.has(id) &&
    !(asCategoryIndex && referenced.has(asCategoryIndex)) &&
    !KNOWN_ORPHANS.has(id)
  ) {
    fail(`${id}: not reachable from sidebars.js (orphan page)`);
  }
}

// --- 3. translations match the English structure ---------------------------

const count = (text, re) => (text.match(re) ?? []).length;
const anchors = (text) => (text.match(/\{#[^}]+\}/g) ?? []).join('|');

const locales = existsSync(I18N)
  ? readdirSync(I18N).filter((l) => statSync(join(I18N, l)).isDirectory())
  : [];

const sidebarPages = pages.filter((id) => {
  const asCategoryIndex = id.endsWith('/README') ? id.slice(0, -'/README'.length) : null;
  return referenced.has(id) || (asCategoryIndex && referenced.has(asCategoryIndex));
});

// Report how much sidebar debt is left, so it stays visible in every CI run.
const remainingOrphans = [...KNOWN_ORPHANS].filter((id) => pages.includes(id));
if (remainingOrphans.length > 0) {
  console.log(
    `check-docs: ${remainingOrphans.length} page(s) still outside the sidebar (see KNOWN_ORPHANS)`,
  );
}

for (const locale of locales) {
  for (const id of sidebarPages) {
    const target = join(I18N, locale, 'docusaurus-plugin-content-docs', 'current', `${id}.md`);
    if (!existsSync(target)) {
      fail(`${locale}/${id}: translation missing`);
      continue;
    }
    const en = readFileSync(join(DOCS, `${id}.md`), 'utf8');
    const tr = readFileSync(target, 'utf8');

    if (anchors(en) !== anchors(tr)) fail(`${locale}/${id}: heading anchors differ`);
    if (count(en, /```/g) !== count(tr, /```/g)) fail(`${locale}/${id}: code fence count differs`);
    if (count(en, /\]\([^)]+\)/g) !== count(tr, /\]\([^)]+\)/g)) fail(`${locale}/${id}: link count differs`);
    if (count(en, /^#{1,6} /gm) !== count(tr, /^#{1,6} /gm)) fail(`${locale}/${id}: heading count differs`);
    if (count(en, /^import /gm) !== count(tr, /^import /gm)) fail(`${locale}/${id}: import line count differs`);
    if (en.trim() === tr.trim()) fail(`${locale}/${id}: untranslated (identical to English)`);
  }
}

// --- report ----------------------------------------------------------------

const checked = pages.length + locales.length * sidebarPages.length;
if (failures.length === 0) {
  console.log(`check-docs: OK (${pages.length} pages, ${locales.length} locales, ${checked} checks)`);
  process.exit(0);
}

console.error(`check-docs: ${failures.length} problem(s)\n`);
for (const f of failures) console.error(`  ${f}`);
process.exit(1);
