#!/bin/zsh

cd "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main"

echo "📦 Adding changes..."
git add -A

echo "💾 Committing dedupe fix..."
git commit -m "fix: Use Vite dedupe instead of overrides for React

CRITICAL FIX Attempt #3 for React Context null error

Changes:
- Removed npm overrides (caused build failure)
- Added resolve.dedupe for react and react-dom in Vite
- Kept optimizeDeps.include for explicit bundling

dedupe is the correct Vite way to force single module instance"

echo "☁️  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Pushed! انتظر 2-3 دقائق للنشر"
echo ""
