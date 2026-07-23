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

## Docs style guide

These rules apply to every page under `docs/`. They follow the conventions of GitLab and Terraform documentation (see `AGENTS/plans/documentation-improvement.md` for the rationale).

### Page types

Every section of a page must be one of four types:

- **Concept** — noun title ("Runners", "Task Templates"); answers *what it is* and *why use it*; never contains steps.
- **Task** — verb title ("Create a repository", "Register a runner"); structure:
  1. One context sentence.
  2. `Prerequisites:` bulleted list (roles/permissions first), when there are any.
  3. Numbered steps in "location, then action" form: "In the **Key Store** section, select **New Key**."
  4. Optional result / next step sentence.
- **Reference** — scannable tables or lists with a one-line intro (options, defaults, formats).
- **Troubleshooting** — always the last section of a feature page. Item heading = the literal error message in backticks; body = **Cause:** then **Resolution:**.

Banned: `Overview`, `Introduction`, `Important notes`, `Limitations` headings; link-only pages (except section landing pages); empty pages; one-sentence sections.

### Edition and version metadata

- Pro-only features: put an admonition directly under the page H1 or section heading:
  ```
  :::info Pro feature
  This feature is available in Semaphore UI Pro.
  :::
  ```
  Page level = the widest availability on the page; section-level admonitions state the exceptions. Do not use ad-hoc "(Pro)" text in body prose; a "(Pro)" suffix in a page/section *title* is allowed as a nav hint.
- New features: first line under the heading — `*Introduced in v2.16.*` (link the PR or release when possible).

### Structure and linking

- One H1 per page; no skipped heading levels; avoid H5+ (split the page instead).
- Feature pages end with `## Related pages` (bulleted links) when inline links are not enough.
- Use Docusaurus `<Tabs>` for Docker/Snap/package/OS variants instead of parallel pages or repeated blocks.
- File names: lowercase-with-dashes. Every category folder has a landing page registered as the category `link` in `sidebars.js`.
- Renames/moves: add a redirect in `docusaurus.config.js` (`@docusaurus/plugin-client-redirects`) and update all inbound links (`grep -rn` the old path).
- Screenshots: sparse in reference/admin docs, generous in tutorials; always add alt text.

### Sidebar

Every page must be registered in `sidebars.js` (or be a landing page used as a category `link`). Orphan pages are not allowed; delete or register.

## Relationship to the product

The **Semaphore application** source code is **not** in this repo—only the docs. For product behavior or API details, align with the main Semaphore repository and keep docs accurate to the shipped version when making substantive claims.
