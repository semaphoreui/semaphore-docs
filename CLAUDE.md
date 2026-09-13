# Semaphore UI documentation (this repo)

This repository is the **documentation site** for [Semaphore UI](https://github.com/semaphoreui/semaphore): a web UI and API for running automation with Ansible, Terraform/OpenTofu, Bash, PowerShell, Python, and related tooling.

## What lives where

| Area | Path | Purpose |
|------|------|--------|
| Doc pages | `docs/` | Markdown (and MDX where used) content |
| Landing / overview | `docs/README.md` | Home page and high-level navigation |
| Admin guide | `docs/admin-guide/` | Install, configure, secure, operate Semaphore (servers, auth, runners, HA, etc.) |
| User guide | `docs/user-guide/` | Day-to-day use of the Semaphore web UI (projects, tasks, inventory, key store, etc.) |
| FAQ | `docs/faq/` | Troubleshooting and common questions |
| Static assets | `static/` | Images and other files referenced from docs |
| Site config | `docusaurus.config.js`, `sidebars.js` | Docusaurus settings and sidebar order |
| Redirects | `redirects.js` | Old URL to new URL for every page that moved |
| Page templates | `templates/` | One markdown skeleton per page type |
| Edition registry | `src/data/editions.js` | Which features require Pro or Enterprise |
| Checks | `scripts/check-docs.mjs` | Front matter, orphan pages, translation structure |
| Generated reference | `docs/reference/` | Written by tools in the product repo. Never edit by hand |

The **sidebar** is defined explicitly in `sidebars.js`. Adding a new page usually means creating the file under `docs/` **and** registering it in `sidebars.js` if it should appear in navigation.

## Tech stack

- **Docusaurus 3** (classic preset, Node 18+)
- **Mermaid** is available for diagrams (`@docusaurus/theme-mermaid`)

## Local development

From the repo root:

- `npm install` — install dependencies
- `npm start` — dev server with live reload
- `npm run build` — production build (use to catch broken links or build errors)

## Editing guidelines

- Prefer clear, task-oriented prose; match the tone of nearby pages.
- Fix typos and broken internal links when you touch a file.
- Internal doc links in Markdown typically use paths like `/admin-guide/installation` (see existing pages for the pattern Docusaurus expects).
- After structural changes (new sections, renamed files), verify `sidebars.js` and run `npm run build` if possible.

### Rules enforced by CI

`node scripts/check-docs.mjs` and the per-locale builds gate every pull request.
Four rules follow from that, and breaking any of them fails the build:

1. **Front matter is mandatory.** Every page starts with `title` and `description`.
   The description is one sentence written from the page content; it feeds search
   results, social cards, and landing-page cards.
2. **Moving a page requires a redirect.** Add the old path to `redirects.js` in the
   same commit. The docs are embedded into the Semaphore binary and translated into
   ten locales, so an unredirected move breaks links everywhere at once.
3. **Broken links and anchors fail the build.** `onBrokenLinks` and `onBrokenAnchors`
   are `throw`. Use explicit heading ids (`## Create a key {#create-a-key}`) so that
   deep links survive translation.
4. **Translations must match the English structure.** A translated page keeps the same
   heading anchors, code fences, links, headings, and `import` lines. When you change
   an English page, update the ten copies under `i18n/` or the check fails.

### Page types

Copy a template from `templates/` before writing a new page and keep its sections:
`concept.md`, `task.md`, `tutorial.md`, `reference.md`, `troubleshooting.md`,
`section.md`. See `templates/README.md` for the type taxonomy and the title grammar
(nouns for concepts and reference, bare infinitive for tasks and tutorials, sentence
case, no gerunds).

### Generated pages

`docs/reference/configuration.md` and `docs/reference/cli.md` are generated from the
Semaphore source by `tools/docsref` and `tools/clidocs` in the
[product repository](https://github.com/semaphoreui/semaphore). Editing them here is
pointless: the next `task docs:gen` overwrites the change, and the product repo's CI
fails if the committed page differs from what the generators produce.

To change one of them, change the thing it is generated from:

| To change | Edit |
|---|---|
| A config option's description | The doc comment on the field in `util/config.go` |
| A description for a field with no doc comment | `tools/docsref/descriptions.json` (a temporary bridge; the count of entries should only fall) |
| How options are grouped, or a Pro/Enterprise badge | `tools/docsref/groups.json` |
| A command or flag description | The Cobra command in `cli/cmd/` |

Both pages are **English only**, and `ENGLISH_ONLY` in `scripts/check-docs.mjs` exempts
them from the translation check. A translated copy would go stale the first time an
option changed and nobody would notice.

### Marking Pro and Enterprise features

Never write `(Pro)` or a shields.io badge by hand. Add the feature to
`src/data/editions.js` and use the globally available components:

```md
## Custom roles <FeatureState feature="extended-rbac" />
## High availability <Enterprise />
```

The [Editions page](docs/editions.md) renders the same registry as a table, so the
badges and the feature matrix cannot drift apart.

## Relationship to the product

The **Semaphore application** source code is **not** in this repo—only the docs. For product behavior or API details, align with the main Semaphore repository and keep docs accurate to the shipped version when making substantive claims.
