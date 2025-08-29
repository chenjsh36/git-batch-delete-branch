#!/bin/bash

# Setup script for git-batch-delete-branch
# This script installs dependencies and builds the project

set -e

echo "🚀 Setting up git-batch-delete-branch..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

echo "✅ Setup completed successfully!"
echo ""
echo "You can now use the tool:"
echo "  npm run dev          # Development mode with watch"
echo "  npm start            # Run the CLI tool"
echo "  npm run test         # Run tests"
echo "  npm run lint         # Run linting"
echo ""
echo "To use the CLI tool globally:"
echo "  npm link             # Link the package globally"
echo "  git-batch-delete-branch --help"
