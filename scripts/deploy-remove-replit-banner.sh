#!/bin/zsh

cd "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main"

echo "🧹 Removing Replit dev banner from index.html"
git add -A

echo "💾 Commit"
git commit -m "fix(frontend): remove Replit dev banner script from index.html to avoid React/context interference in production"

echo "☁️ Push"
git push origin main

echo "✅ Pushed. Wait for Vercel and hard refresh (Cmd+Shift+R)."