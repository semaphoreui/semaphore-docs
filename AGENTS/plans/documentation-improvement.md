# Plan — Documentation Improvement (docs/docs)

- **Goal:** Restructure and raise the quality of the Semaphore UI documentation
  based on a deep review of two best-in-class references: **GitLab docs**
  (docs.gitlab.com) and **Terraform docs** (developer.hashicorp.com/terraform).
- **Scope:** everything under `docs/docs`, `docs/sidebars.js`,
  `docs/docusaurus.config.js`. Product code is out of scope.
- **Research record:** research server, `RESEARCH@b36f531662b161741dc805`
  (areas: GitLab documentation structure, Terraform documentation structure,
  plus the comparison synthesis).

---

## 1. Current state (audit, July 2026)

~7,600 lines across 103 markdown files. Docusaurus 3, one sidebar
(Admin Guide / User Guide / FAQ), empty navbar.

| Problem | Evidence |
|---|---|
| Empty pages that are publicly linked | `user-guide/rbac.md` (0 lines, linked from home page), `admin-guide/security/kerberos.md`, `user-guide/admin/{runners,tasks,users}.md` |
| Orphaned pages (not in `sidebars.js`) | `admin-guide/introduction.md`, `admin-guide/troubleshooting.md`, `admin-guide/openid/pocket-id.md`, `installation/{cloud,snap}.md`, `configuration/{cli,snap}.md`, `user-guide/inventory.md`, `user-guide/repositories.md` (their categories have no `link` doc), `notifications_old.md` |
| Legacy / inconsistent file names | `installation_manually.md`, `notifications_old.md`, `bitbucket_access_token.md` |
| No getting-started tutorial | Home README "first run checklist" is a link list; step 2 links to an 8-line stub that is commented out of the sidebar |
| Thin core concept pages | `projects.md` 13 lines, `tasks.md` 25, `task-templates/README.md` 15 — these are the product's central concepts |
| No edition metadata convention | "(Pro)" appears ad hoc in 8 files, styles differ per page |
| Duplication | Three runner pages (`admin-guide/runners.md`, `user-guide/projects/runners.md`, `user-guide/admin/runners.md`); two parallel troubleshooting pages (`faq/troubleshooting.md`, orphaned `admin-guide/troubleshooting.md`) |
| No structural conventions | No page types, no Prerequisites sections, no per-feature troubleshooting, no "next steps", no version-history notes ("Introduced in v2.x"), one-sentence pages allowed |
| No automation | No lint, no orphan-page check, no redirect policy on renames |

## 2. What the reference sites do

### GitLab (docs.gitlab.com)

- **Audience-first top level**: *Use GitLab* (anything done in the UI),
  *Administer* (anything requiring server/config access), *Install/Update*,
  *Extend* (API/integrations), *Tutorials*, *Contribute*. Placement test:
  "does it require server access?" → Administer.
- **CTRT page-type taxonomy** — every topic is exactly one of:
  - **Concept** — noun title, "what/why", never "how".
  - **Task** — verb title ("Create an issue"), skeleton:
    context sentence → `Prerequisites:` bullets → "To \<do X\>:" →
    numbered steps in "location, then action" form → result/next steps.
  - **Reference** — scannable tables, one-line intro.
  - **Troubleshooting** — always last on the page; split to a dedicated page
    at 5+ items; item title = the literal error text (`Error: ...`), body =
    cause → workaround/resolution. Optimized for search-engine arrivals.
  - Banned junk-drawer titles: `Overview`, `Introduction`, `Important notes`,
    `Limitations`. Forbidden: link-only pages, one-sentence topics.
- **Repeatable section skeleton**: each major section = card landing page
  (lists only direct children) + a "Get started with X" overview.
- **Structured availability badges** right under the H1: Tier / Offering /
  Status with a fixed vocabulary; page level shows the widest availability,
  subheadings state deltas only.
- **Version-history notes** under headings: "Introduced in GitLab 16.3
  \[link\]"; pruned when versions leave the support window.
- **Nav hygiene**: single central nav file; every page must be in the nav
  (automated report catches strays); moves leave a redirect with an expiry;
  one H1 per page from front matter; markdownlint + Vale in CI.
- **Tutorials** are a separate hub whose categories mirror the user-doc
  workflows; titles `Tutorial: <verb phrase>`; duplication and screenshots
  allowed there (kept sparse in core docs).

### Terraform (developer.hashicorp.com/terraform)

- **Three-door landing page**: Install / Tutorials / Documentation.
- **Purpose-based doc buckets**: Intro (what/why, use cases, vs-alternatives,
  core workflow, adoption phases) / Manage Infrastructure (Language + CLI) /
  Collaborate (SaaS + self-hosted editions) / Develop and Share.
- **Overview → Task → Reference layering** per topic; each page scopes itself
  ("This page describes X. For Y, refer to…") and links to the other layers.
- **Get Started tutorial collections per platform** (AWS, Azure, GCP, Docker…)
  with an identical fixed arc: Concept → Install → Create → Change → Destroy →
  Collaborate. Tutorials are written once and reused across collections.
- **Standard tutorial template**: Prerequisites (versions, accounts, cost
  warnings) → filename-labeled code blocks → diff-style edits → expected
  output after every command → Next steps → prev/next navigation.
- **"Hands-on: Try the … tutorial" callout at the top of reference pages.**
- **CLI command page template**: `# terraform <cmd> command` → one-sentence
  purpose → hands-on callout → Usage line → options grouped by behavior →
  Examples with use-case-named H3s. Command index mirrors `--help`
  (main commands vs other commands).
- **Config/block reference template**: config model outline → complete
  copyable skeleton → per-key Specification (type / default / required-when /
  example) → use-case examples.
- **Edition & version callouts + tabs** (OS/package variants) instead of
  forked pages; versioned docs with a version picker; permalink headings;
  "Edit this page on GitHub"; single-page anchored glossary.

## 3. Gap analysis

| Dimension | GitLab / Terraform | Semaphore docs today |
|---|---|---|
| Top-level IA | Audience/purpose-based, repeatable skeleton | Two flat guides + FAQ; navbar empty |
| Page types | Strict taxonomy (CTRT / overview-task-reference) | None; mixed pages, one-sentence pages, empty pages |
| Getting started | Dedicated tutorial collections with a fixed arc | Link checklist on the home page |
| Tutorials | Separate hub, standard template, reuse | Absent |
| Edition metadata | Structured badges with fixed vocabulary | Ad-hoc "(Pro)" text |
| Version metadata | "Introduced in vX.Y" history blocks | Absent |
| Troubleshooting | Per-feature, error-message-titled items | Two global numbered lists, one orphaned, "Coming soon" entries |
| Reference (CLI/config/API) | Generated or templated, linked from authored docs | Partial (CLI pages exist via skill; config reference is one long page; API is a pointer) |
| Nav hygiene | No orphans (automated), redirects on moves | ~12 orphaned pages, legacy `_old`/`_manually` files |
| CI quality gates | markdownlint, Vale, link checks | None |

## 4. Target information architecture

Keep Docusaurus and the existing URL space; restructure the sidebar and fill
the gaps. Proposed sidebar (files move only where marked — every move gets a
redirect in `docusaurus.config.js` `@docusaurus/plugin-client-redirects`):

```
docs/
├── Getting Started                        ← NEW section
│   ├── What is Semaphore UI?              (concept: what/why, how it works,
│   │                                       vs-alternatives: cron/AWX/Rundeck)
│   ├── Core concepts                      (project → repository → inventory →
│   │                                       key store → template → task; diagram)
│   ├── Quickstart (Docker)                (install → first project → first task,
│   │                                       fixed arc, expected output)
│   └── Tutorials                          (per app: Ansible, Terraform/OpenTofu,
│   │                                       Bash/Python; identical arc, reused steps)
│   └── Glossary                           (single anchored page)
├── User Guide  (everything done in the web UI)
│   ├── Projects (+ settings, history, activity)
│   ├── Task Templates (+ survey vars, prompts, JWT)
│   ├── Apps (Ansible, Terraform/OpenTofu, Bash, PowerShell, Python)
│   ├── Tasks (+ raw log, retention, parallel)
│   ├── Schedules
│   ├── Repositories  (landing = repositories.md — attach as category link)
│   ├── Inventory     (landing = inventory.md — attach as category link)
│   ├── Variable Groups (environment.md)
│   ├── Key Store (+ vault/openbao/devolutions/secret-sync)
│   ├── Integrations (webhooks)
│   ├── Team & Access (team.md + rbac.md content — write it)
│   └── Project-level Runners
├── Admin Guide  (anything requiring server/config access)
│   ├── Installation (package, docker, binary, k8s, cloud, manual→install/manual)
│   ├── Configuration (config-file, env-vars, interactive setup)
│   ├── Upgrading
│   ├── Authentication (LDAP/AD, OpenID providers)
│   ├── Security (encryption, database, network, JWT)
│   ├── Runners (global)
│   ├── Notifications (email, telegram, slack, teams, rocket, ding, gotify)
│   ├── Reverse proxy (nginx, apache, caddy)
│   ├── High Availability
│   ├── Logs & Monitoring (logs.md + Prometheus metrics — new, feature exists)
│   ├── CLI reference (existing cli/* pages, kept in sync via the
│   │                   semaphore-cli-docs skill)
│   └── License / Pro (license.md + user-guide/admin/subscription content)
├── Reference                              ← NEW section
│   ├── Configuration options              (generated from config.schema.yaml —
│   │                                       Terraform block-reference style:
│   │                                       per-key type/default/env-var/description)
│   ├── API                                (api.md → link to Swagger/OpenAPI)
│   └── CI/CD integration (cicd.md moves here)
└── Troubleshooting & FAQ
    ├── merge faq/troubleshooting.md + admin-guide/troubleshooting.md,
    ├── re-title every item to the literal error message,
    └── later: split per-feature troubleshooting into the feature pages.
```

Navbar gets top-level entries (Getting Started / User Guide / Admin Guide /
Reference / Troubleshooting) instead of the current empty `items: []`.

## 5. Conventions to adopt (docs style guide)

Create `docs/docs/CONTRIBUTING.md` (or extend `docs/CLAUDE.md`) with:

1. **Page types** (from GitLab CTRT):
   - Concept pages: noun titles; answer what/why; no steps.
   - Task sections: verb titles; `Prerequisites:` list; numbered
     "location, then action" steps; result; next steps.
   - Reference pages: tables; one-line intro.
   - Troubleshooting: last section of a feature page; item heading = literal
     error text; body = cause → resolution. Split out at 5+ items.
   - Ban: `Overview`/`Introduction`/`Important notes` headings, link-only
     pages, empty pages committed to `main`.
2. **Edition badges**: one convention for Pro-only features — an admonition
   directly under the H1 / section heading, e.g.
   `:::info Pro feature` … `:::` (fixed wording), page level = widest
   availability, headings state deltas. Replace all 8 ad-hoc "(Pro)" mentions.
3. **Version notes**: "Introduced in v2.16" (with GitHub PR/issue link) as the
   first line under a feature heading. Prune when versions leave support.
4. **Cross-link skeleton**: every feature page ends with `## Related pages`;
   every reference-ish page opens with a "Hands-on" link to the matching
   tutorial once tutorials exist (Terraform pattern).
5. **Tabs, not forks**: use Docusaurus `<Tabs>` for Docker/Snap/package/Helm
   and OS variants instead of parallel pages or repeated blocks.
6. **File naming**: lowercase-with-dashes; every category folder has a landing
   page registered as the category `link`; no `_old`/`_manually` suffixes —
   renames go through redirects.
7. **Screenshot policy**: sparse in core docs, generous in tutorials
   (GitLab rule); always with meaningful alt text.

## 6. Phased task breakdown

### Phase 1 — Hygiene (no restructuring; can ship immediately)

| # | Task | Files |
|---|---|---|
| 1.1 | Delete or fill the five empty pages; **rbac.md must be written** (it is linked from the home page) or the link removed until written | `user-guide/rbac.md`, `admin-guide/security/kerberos.md`, `user-guide/admin/*` |
| 1.2 | Register orphans or delete them: add `pocket-id` to the OpenID list; attach `inventory.md` / `repositories.md` as category `link` docs; decide fate of `introduction.md`, `installation/cloud.md`, `configuration/cli.md` (README links to it!), `configuration/snap.md`, `installation/snap.md` | `docs/sidebars.js` |
| 1.3 | Merge the two troubleshooting pages into `faq/troubleshooting.md`; delete `notifications_old.md`; remove "Coming soon" items | `faq/`, `admin-guide/` |
| 1.4 | Add `@docusaurus/plugin-client-redirects`; rename `installation_manually.md` → `installation/manual.md`, `bitbucket_access_token.md` → `bitbucket-access-token.md` with redirects | `docusaurus.config.js` |
| 1.5 | Resolve the three-runner-page duplication: `admin-guide/runners.md` = install/operate runners (admin), `user-guide/projects/runners.md` = attach a runner to a project (user); delete `user-guide/admin/runners.md` | runner pages |
| 1.6 | Fill the navbar (`items: []`) with the top-level sections | `docusaurus.config.js` |

### Phase 2 — Conventions + core-page rewrites

| # | Task |
|---|---|
| 2.1 | Write the docs style guide (section 5) and add it to `docs/CLAUDE.md` so agents follow it |
| 2.2 | Rewrite the three thin core pages using the concept+task skeleton: **Projects**, **Tasks**, **Task Templates** (these are the product's central concepts; Task Templates especially needs full field reference: repository, inventory, vars, prompts, types Task/Build/Deploy) |
| 2.3 | Standardize the Pro badge admonition; sweep the 8 files with ad-hoc "(Pro)" |
| 2.4 | Add `Prerequisites:` + numbered-step formatting to all existing task-like pages (OpenID providers, notifications, key-store integrations) — mostly mechanical |
| 2.5 | Re-title all troubleshooting items to literal error messages |

### Phase 3 — Getting Started section

| # | Task |
|---|---|
| 3.1 | "What is Semaphore UI?" concept page (what/why, how it works, when to use vs cron/AWX/Rundeck — Terraform intro/vs pattern) |
| 3.2 | "Core concepts" page with a Mermaid diagram of project → repository / inventory / key store / variable group → template → task → runner (glossary content moves here from README) |
| 3.3 | Quickstart: Docker install → first admin → first project → run a ready-made example playbook, with expected output at each step (Terraform tutorial template) |
| 3.4 | One tutorial per app with the identical arc (Ansible, Terraform/OpenTofu, Bash/Python): Prerequisites → Create template → Run → Inspect logs → Schedule → Next steps; install steps written once and linked |
| 3.5 | Glossary page (single page, anchored terms) |
| 3.6 | Slim the home README into a three-door landing (Getting Started / User Guide / Admin Guide) — the current checklist moves into the Quickstart |

### Phase 4 — Reference section

| # | Task |
|---|---|
| 4.1 | Generate a full **Configuration options** reference from `config.schema.yaml` (Terraform block-reference style: per-option type, default, env var, config-file key, description). Extend the `semaphore-config-schema` skill to also emit this markdown page so it never drifts |
| 4.2 | Keep CLI pages generated/synced via the existing `semaphore-cli-docs` skill; restructure the CLI index to mirror `semaphore --help` (main vs other commands) |
| 4.3 | API page: link the OpenAPI spec / hosted Swagger UI; add a short authentication + common-recipes section (create token, launch task, poll status) |
| 4.4 | Add "Introduced in vX.Y" notes going forward (start with features added in 2.16+; older history is optional) |

### Phase 5 — Automation & guardrails (CI)

| # | Task |
|---|---|
| 5.1 | `npm run build` in docs CI (Docusaurus fails on broken internal links) — the cheapest, highest-value gate |
| 5.2 | Orphan-page check: script comparing `docs/docs/**/*.md` against `sidebars.js` (GitLab "every page in nav" rule); fails CI on new strays |
| 5.3 | markdownlint with a minimal config (one H1, heading increments, no bare URLs) |
| 5.4 | Optional: Vale with a small vocabulary (Semaphore UI, Task Template, Key Store capitalization) |

## 7. Prioritization & effort

- **Phase 1** — small, mechanical, do first (1–2 days). Fixes user-visible
  breakage (empty rbac page, dead checklist link).
- **Phase 2** — the highest quality-per-effort: conventions + the three core
  concept pages carry most reader value.
- **Phase 3** — the largest strategic gap vs both reference sites
  (onboarding); biggest writing effort.
- **Phase 4** — leverages existing skills/schema; medium effort, prevents
  drift permanently.
- **Phase 5** — small scripts; do 5.1 immediately, the rest alongside
  Phase 2.

Explicitly **not** adopted from the reference sites (over-engineering at this
scale): versioned doc snapshots with a version picker, a separate tutorials
subdomain/hub with progress tracking, Hugo-style central nav YAML (the
Docusaurus sidebar already serves this role), translation-oriented writing
rules.

## 8. Success criteria

1. Zero empty pages, zero orphaned pages (enforced by CI from Phase 5).
2. Every user-guide feature page follows the concept → task → reference →
   troubleshooting skeleton.
3. A newcomer can go from `docker compose up` to a completed first task using
   only the Quickstart, without touching the FAQ or Discord.
4. Pro availability is visible via one consistent badge style on every
   Pro-only feature.
5. Configuration and CLI references are generated, not hand-maintained.
