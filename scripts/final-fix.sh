#!/bin/zsh

cd "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main"

echo "🔄 Restoring package-lock.json..."
git checkout HEAD~1 -- package-lock.json

echo "📦 Adding changes..."
git add -A

echo "💾 Committing..."
git commit -m "fix: Add React overrides to prevent duplication + restore package-lock

CRITICAL FIX for React Context null error

Root Cause: Multiple React instances in build causing useContext to fail

Solution:
1. Added overrides in package.json to force single React version
2. Restored package-lock.json (needed for CI/CD)
3. Changed vercel.json back to npm ci

This forces ALL dependencies to use the same React instance"

echo "☁️  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! الآن:"
echo "1. انتظر 2-3 دقائق لـ Vercel"
echo "2. افتح الموقع"
echo "3. Hard Refresh: Cmd+Shift+R"
echo "4. يجب أن يعمل الآن! 🎉"
echo ""
