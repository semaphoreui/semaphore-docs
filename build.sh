#!/bin/bash
# Build Docusaurus documentation

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the documentation
echo "Building Docusaurus site..."
npm run build

echo "Build complete! Output is in the 'build' directory."