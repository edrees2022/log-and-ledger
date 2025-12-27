#!/bin/zsh

cd "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main"

echo "🔄 Reverting to ORIGINAL simple config..."
git add -A

echo "💾 Committing revert..."
git commit -m "fix: Revert to original simple config - remove all optimizations

CRITICAL: Rolling back ALL changes that broke the site

Reverted:
- Removed dedupe from Vite (was causing issues)
- Removed rollupOptions (cache busting not needed)
- Removed all Firebase console.logs
- Changed auth back to: app ? getAuth(app) : null
- Removed mock auth object entirely

Back to CLEAN, SIMPLE, WORKING configuration"

echo "☁️  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Reverted to original! هذه المرة بإذن الله!"
echo "انتظر 2-3 دقائق"
echo ""
