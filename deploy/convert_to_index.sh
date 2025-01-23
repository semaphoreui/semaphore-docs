#!/bin/bash

# Function to move HTML file to its own directory and rename it to index.html
move_html_to_index() {
  local filepath=$1
  local dirpath=${filepath%.html}

  # Create directory and move the HTML file
  mkdir -p "$dirpath"
  mv "$filepath" "$dirpath/index.html"
}

echo "Go to book directory"

cd ../book

echo "Move HTML files to their own directories and rename them to index.html"

# Find all .html files in the current directory (excluding index.html files)
find . -type f -name "*.html" ! -name "index.html" | while read file; do
  move_html_to_index "$file"
done


BUILD_VERSION=$RANDOM

find . -type f -name "index.html" | while read file; do
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/\/index\.html/\//g' "$file"
        sed -i '' 's/index\.html/\//g' "$file"
        sed -i '' 's/\.html/\//g' "$file"
        sed -i '' 's/"\.\.\//"..\/..\//g' "$file"
        sed -i '' 's/"\.\//"..\//g' "$file"

        sed -i '' "s/\.css\"/.css\"?v=$BUILD_VERSION\"/g" "$file"
        sed -i '' "s/\.js\"/.js\"?v=$BUILD_VERSION\"/g" "$file"
    else 
        sed -i 's/\/index\.html/\//g' "$file"
        sed -i 's/index\.html/\//g' "$file"
        sed -i 's/\.html/\//g' "$file"
        sed -i 's/"\.\.\//"..\/..\//g' "$file"
        sed -i 's/"\.\//"..\//g' "$file"
        sed -i "s/\.css\"/.css?v=$BUILD_VERSION\"/g" "$file"
        sed -i "s/\.js\"/.js?v=$BUILD_VERSION\"/g" "$file"
    fi

    if grep -q 'mermaid' "$file"; then
        node ../deploy/mermaid-preprocessing/index.js "$file"
    fi
done


if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\.css/.css?v=$BUILD_VERSION/g" "book.js"
else 
    sed -i "s/\.css/.css?v=$BUILD_VERSION/g" "book.js"
fi