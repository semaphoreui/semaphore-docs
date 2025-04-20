#!/bin/bash
echo "Go to book directory"

cd ../book

echo "Move HTML files to their own directories and rename them to index.html"

find . -type f -name "index.html" | while read file; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/>Semaphore Docs//g' "$file"
  else
    sed -i 's/>Semaphore Docs/>/g' "$file"
  fi
done



