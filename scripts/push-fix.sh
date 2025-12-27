#!/bin/zsh

# Navigate to project directory
cd "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main"

# Stage all changes
git add -A

# Commit with message
git commit -m "fix: Force clean rebuild to fix React Context null error

Changes:
- Added debug logs to firebase.ts
- Removed dedupe from vite.config.ts
- Added rollupOptions for clean build
- Forces Vercel to rebuild from scratch"

# Push to GitHub
git push origin main

echo ""
echo "✅ Done! التعديلات تم دفعها بنجاح"
echo ""
echo "الآن:"
echo "1. انتظر 2-3 دقائق لـ Vercel"
echo "2. افتح الموقع"
echo "3. اعمل Hard Refresh: Cmd+Shift+R"
echo ""
