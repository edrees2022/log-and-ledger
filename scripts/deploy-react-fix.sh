#!/bin/zsh

cd "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main"

echo "📦 Adding changes..."
git add -A

echo "💾 Committing React alias fix..."
git commit -m "fix: Force single React instance via Vite aliases + npm overrides

CRITICAL FIX Attempt #2 for React Context null error

Changes:
1. Fixed overrides syntax: react: '18.3.1' instead of '\$react'
2. Added Vite resolve aliases to force single React instance
3. Added optimizeDeps to include React explicitly

This ensures Vite uses ONE React instance from node_modules"

echo "☁️  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Pushed! انتظر 2-3 دقائق للنشر"
echo ""
