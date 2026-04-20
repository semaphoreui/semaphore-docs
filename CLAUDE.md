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

## Relationship to the product

The **Semaphore application** source code is **not** in this repo—only the docs. For product behavior or API details, align with the main Semaphore repository and keep docs accurate to the shipped version when making substantive claims.
