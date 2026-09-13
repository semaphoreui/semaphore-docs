#!/usr/bin/env python3
"""Compare website header/footer links with the docs Docusaurus navbar/footer.

Usage (from the docs/ directory):
    python3 .claude/skills/sync-site-nav/diff_nav.py

Prints website links missing from docusaurus.config.js and docs links that no
longer exist on the website. Labels are resolved from website/src/i18n/en.yml.
"""
import os
import re
import sys

DOCS = os.path.dirname(os.path.abspath(sys.argv[0]))
while not os.path.exists(os.path.join(DOCS, "docusaurus.config.js")):
    parent = os.path.dirname(DOCS)
    if parent == DOCS:
        sys.exit("docusaurus.config.js not found")
    DOCS = parent
ROOT = os.path.dirname(DOCS)
WEB = os.path.join(ROOT, "website", "src")
SITE = "https://semaphoreui.com"

# Links the docs intentionally do not carry (see SKILL.md).
IGNORE_WEBSITE = {"/docs"}  # mapped to internal "to: '/'"
# Accepted label differences: url -> docs label (see "Accepted differences" in SKILL.md).
ACCEPTED_LABELS = {"/api-docs/": "API References"}


def load_i18n(section):
    out = {}
    cur = None
    for line in open(os.path.join(WEB, "i18n", "en.yml"), encoding="utf-8"):
        m = re.match(r"^([a-z_]+):\s*$", line)
        if m:
            cur = m.group(1)
            continue
        if cur == section:
            m = re.match(r"^  ([a-z_]+):\s*(.*)$", line)
            if m:
                out[m.group(1)] = m.group(2).strip().strip("'\"")
    return out


def normalize(url):
    if url.startswith(SITE):
        url = url[len(SITE):] or "/"
    return url


def pug_links(path, section, i18n):
    """Return {(label, url)} from the desktop block of a Pug component."""
    text = open(os.path.join(WEB, "components", path), encoding="utf-8").read()
    if section == "header":
        text = text.split("//- Mobile Hamburger")[0]
    else:
        text = text.split("//- Mobile Navigation Accordions")[0]
    links = set()
    key_pat = re.compile(r"\$t\('(?:header|footer)\.([a-z_]+)'\)")
    for m in re.finditer(r"^[ \t]*a[.\w-]*\(", text, re.M):
        # walk balanced parentheses (attrs may span lines and contain class=(...))
        i, depth = m.end(), 1
        while i < len(text) and depth:
            depth += {"(": 1, ")": -1}.get(text[i], 0)
            i += 1
        attrs = text[m.end():i - 1]
        h = re.search(r"""href=(?:lang_path\s*\+\s*)?"([^"]+)\"""", attrs)
        if not h:
            continue
        url = normalize(h.group(1))
        if url.startswith("mailto:") or url == "/":
            continue
        rest = text[i:text.find("\n", i)]
        k = key_pat.search(rest)
        if k:
            label = i18n.get(k.group(1), k.group(1))
        elif rest.strip():
            label = rest.strip().lstrip("= ").strip()
        else:
            # nested children (Product menu): title + tag keys on following lines
            nxt = re.search(r"^[ \t]*a[.\w-]*\(", text[i:], re.M)
            body = text[i:i + nxt.start()] if nxt else text[i:]
            keys = key_pat.findall(body)
            title = next((i18n.get(x, x) for x in keys if x.endswith("_title")), "")
            tag = next((i18n.get(x, x) for x in keys if x.endswith("_tag")), "")
            label = f"{title} · {tag}" if tag else title or (keys[0] if keys else "")
        links.add((label, url))
    return links


def docs_links(kind):
    text = open(os.path.join(DOCS, "docusaurus.config.js"), encoding="utf-8").read()
    start = text.index("navbar: {") if kind == "header" else text.index("footer: {")
    end = text.index("footer: {") if kind == "header" else text.index("prism: {")
    block = text[start:end]
    links = set()
    q = r"""(?:'([^'\n]*)'|"([^"\n]*)")"""
    opt = r"(?:\s*target:\s*'[^']*',)?"
    for m in re.finditer(r"label:\s*" + q + r"," + opt + r"\s*(?:href|to):\s*'([^']+)'", block):
        links.add((m.group(1) or m.group(2), normalize(m.group(3))))
    for m in re.finditer(r"(?:href|to):\s*'([^']+)'," + opt + r"\s*label:\s*" + q, block):
        links.add((m.group(2) or m.group(3), normalize(m.group(1))))
    return links


def report(name, site, docs):
    site_urls = {u for _, u in site} - IGNORE_WEBSITE
    docs_urls = {u for _, u in docs}
    print(f"== {name}")
    missing = sorted(site_urls - docs_urls)
    extra = sorted(docs_urls - site_urls - {"/"})
    for u in missing:
        label = next(l for l, x in site if x == u)
        print(f"  MISSING in docs:  {label!r:35} {u}")
    for u in extra:
        label = next(l for l, x in docs if x == u)
        print(f"  EXTRA in docs:    {label!r:35} {u}")
    # label drift on shared URLs
    for u in sorted(site_urls & docs_urls):
        sl = {l for l, x in site if x == u}
        dl = {l for l, x in docs if x == u}
        if ACCEPTED_LABELS.get(u) in dl:
            continue
        if sl and dl and not (sl & dl) and not any(d.startswith(s) for s in sl for d in dl):
            print(f"  LABEL differs:    website {sorted(sl)} vs docs {sorted(dl)}  {u}")
    if not missing and not extra:
        print("  links in sync")


header = pug_links("SiteHeader/SiteHeader.pug", "header", load_i18n("header"))
footer = pug_links("SiteFooter/SiteFooter.pug", "footer", load_i18n("footer"))
report("Header / navbar", header, docs_links("header"))
report("Footer", footer, docs_links("footer"))
