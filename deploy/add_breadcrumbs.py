import os
import re

def generate_breadcrumbs(summary_file):
    breadcrumbs = {}
    with open(summary_file, "r") as f:
        parent = None
        for line in f:
            match = re.match(r"\s*\* \[(.+)\]\((.*)\)", line)
            if not match:
                continue

            print(line)

            name, path = match.groups()

            if path == '':
                continue

            if parent:
                breadcrumbs[path] = breadcrumbs[parent] + [name]
            else:
                breadcrumbs[path] = [name]

    return breadcrumbs

def inject_breadcrumbs(breadcrumbs, content_dir):
    print(content_dir)

    for path, breadcrumb in breadcrumbs.items():
        file_path = os.path.join(content_dir, path)

        print(file_path)

        if not os.path.exists(file_path):
            continue

        with open(file_path, "r+") as f:
            content = f.read()
            breadcrumb_html = " > ".join(
                f'<a href="{p}">{n}</a>' for n, p in zip(breadcrumb, breadcrumb[:-1])
            )
            f.seek(0)
            f.write(f"<!-- Breadcrumbs: {breadcrumb_html} -->\n" + content)

summary_file = "../src/SUMMARY.md"
content_dir = "../src"
breadcrumbs = generate_breadcrumbs(summary_file)
inject_breadcrumbs(breadcrumbs, content_dir)