---
name: sync-site-nav
description: Sync the docs site navbar and footer (docusaurus.config.js) with the main website header and footer (website/src/components/SiteHeader, SiteFooter). Use when the website menu or footer changed, or when asked to update docs header/footer items from the website.
---

# Sync docs navbar and footer from the website

The docs site (Docusaurus, this directory) mirrors the main website's header and
footer. The website is the source of truth. This skill updates the docs to match.

## Sources (website, read-only)

All paths are relative to the repo root (one level above this `docs/` folder):

| What | File |
|------|------|
| Header structure and links | `website/src/components/SiteHeader/SiteHeader.pug` (desktop `nav.SiteHeader__nav` block) |
| Footer structure and links | `website/src/components/SiteFooter/SiteFooter.pug` (desktop `.SiteFooter__columns` block plus `.SiteFooter__brandCol`) |
| Labels | `website/src/i18n/en.yml`, keys `header.*` and `footer.*` |

Only the English labels are used. The docs site has one locale.

## Targets (docs)

| What | Where |
|------|-------|
| Navbar items | `docusaurus.config.js` → `themeConfig.navbar.items` |
| Footer columns | `docusaurus.config.js` → `themeConfig.footer.links` |
| Styling | `src/css/custom.css` (navbar dropdown, chevron, footer sections) |
| Logos | `static/img/semaphore-light.png`, `static/img/semaphore-dark.png` (copied from `website/src/img/`) |

## Procedure

1. Run the diff helper first to see what is out of sync:

   ```bash
   python3 .claude/skills/sync-site-nav/diff_nav.py
   ```

   It prints website links missing from the docs config and docs links no longer
   on the website, for the header and the footer separately.

2. Update `docusaurus.config.js` following the mapping rules below.

3. If the website added a new CSS-visible element (a new category title inside a
   dropdown, a new brand-column block), add matching styles in `src/css/custom.css`.
   Existing hooks: `.dropdown__category`, `.footer__brand`, `.footer__desc`,
   `.footer__contact*`.

4. Build and verify:

   ```bash
   npm run build
   grep -c 'target="_blank"' build/index.html   # must print 0 for navbar/footer links
   ```

   The build must succeed. A "broken anchors" warning about doc content is
   pre-existing and unrelated.

5. Optionally screenshot the built site in both themes (headless Chrome against
   `npx docusaurus serve`) and check the dropdowns and footer columns.

## Mapping rules

**URLs**
- `lang_path + "/x"` in Pug becomes `https://semaphoreui.com/x` (keep trailing slashes exactly as in Pug).
- Links to the docs themselves (`https://semaphoreui.com/docs`) become internal: `{ label: ..., to: '/' }`.
- External links use `href`. Every `href` item gets `target: '_self'` so it opens in the same tab. Docusaurus defaults to `_blank` otherwise.
- `mailto:` links live inside the footer brand column `html` block.

**Navbar** (`navbar.items`, in website order)
- Each `.SiteHeader__dropdown` becomes `{ type: 'dropdown', label, position: 'left', items: [...] }`.
- Each dropdown carries a `className` (`navbar-menu--product`, `--features`, `--explore`, `--list`) that selects its panel layout in `custom.css`.
- Product dropdown items are built with `productItem(name, tag, desc, href)`: title, tag and description, as on the website.
- A `.SiteHeader__categoryTitle` inside a dropdown becomes `categoryItem(title)` placed before the links it heads.
- Labels are translated in `i18n/<locale>/docusaurus-theme-classic/navbar.json`. Strings inside `html` items (product tags and descriptions, category titles) cannot go there; they live in `src/data/navbarStrings.js`. Both come from `website/src/i18n/<locale>.yml`.
- Direct links (Pricing) become plain `{ label, href, position: 'left' }`.
- Right side: the star counter (`html` item), `Sign in` (`https://portal.semaphoreui.com`), the locale dropdown, and the two buttons (`navbar-cta`).
- "Contact sales" links to `/contact`, because the website's button depends on its live-chat script. "Start Pro trial" is shown in the mobile drawer only: on desktop the search box, language switch and theme switch take its room.
- Search and the theme switch are added by Docusaurus itself; `custom.css` orders them inside the bar.

**Footer** (`footer.links`, `style: 'light'`)
- Column 1 is the brand column: `title: ' '` and a single `html` item containing the logo links (both light and dark PNGs), the `footer.brand_desc` text, and the "Contact us" rows (Sales, Support, Security, Legal). Its title is hidden by CSS.
- Columns 2..6 mirror `.SiteFooter__col` blocks in order: Product, Explore, Help, Links, Legal. Titles and labels come from `footer.*` in `en.yml`.
- `copyright` is `` `© ${new Date().getFullYear()} Semaphore UI. All rights reserved.` ``.
- Do not add the language selector or the mobile accordions.

**Accepted differences** (do not "fix" these when syncing)
- `API References (Swagger)` on the website is shortened to `API References` in the docs navbar and footer.
- The docs link is internal (`to: '/'`), so the diff helper ignores `/docs`.

**Styling constraints already in place** (keep them)
- The navbar copies the website's `SiteHeader.scss`: a floating rounded bar with dropdown panels attached to its bottom edge. Colors are driven by `--sem-header-*` custom properties with a `[data-theme='dark']` override (the website has no dark theme).
- Translated labels vary in width. After changing items, check that the bar does not overflow in the long locales (es, fr, de, ru) at 1000px and 1440px.
- Dropdown caret is a thin outlined chevron (`.navbar .dropdown > .navbar__link::after`).
- External-link icons are hidden in navbar and footer.
- Footer colors are driven by `--footer-*` custom properties with a `[data-theme='dark']` override.
