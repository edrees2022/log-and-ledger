#!/bin/bash
# Render.com build script for backend only

echo "🔨 Building backend for Render.com..."

# Install dependencies
npm ci

# Build backend only (not frontend)
npm run build:backend

echo "✅ Backend build complete!"
