#!/bin/bash
# Run Docusaurus development server

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the development server
echo "Starting Docusaurus development server..."
npm start