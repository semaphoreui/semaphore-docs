#!/bin/bash

# Function to move HTML file to its own directory and rename it to index.html
move_html_to_index() {
  local filepath=$1
  local dirpath=${filepath%.html}

  # Create directory and move the HTML file
  mkdir -p "$dirpath"
  mv "$filepath" "$dirpath/index.html"
  sed -i '' 's/\/index\.html/\//g' "$dirpath/index.html"
  sed -i '' 's/\.html/\//g' "$dirpath/index.html"
  sed -i '' 's/"\.\.\//"..\/..\//g' "$dirpath/index.html"
  sed -i '' 's/"\.\//"..\//g' "$dirpath/index.html"
}

find . -type f -name "index.html" | while read file; do
  sed -i '' 's/\/index\.html/\//g' "$file"
  sed -i '' 's/index\.html/\//g' "$file"
  sed -i '' 's/\.html/\//g' "$file"
  sed -i '' 's/"\.\.\//"..\/..\//g' "$file"
  sed -i '' 's/"\.\//"..\//g' "$file"
done

echo "Go to book directory"

cd ../book

echo "Move HTML files to their own directories and rename them to index.html"

# Find all .html files in the current directory (excluding index.html files)
find . -type f -name "*.html" ! -name "index.html" | while read file; do
  move_html_to_index "$file"
done
