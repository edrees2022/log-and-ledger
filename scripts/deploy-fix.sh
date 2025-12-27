#!/bin/bash

echo "🚀 Deploying critical fix to Vercel..."
echo ""

cd "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main"

echo "📦 Staging changes..."
git add -A

echo "💾 Committing..."
git commit -m "fix: Force clean rebuild with cache busting + debug logs

CRITICAL FIX for React Context null error

Changes:
1. Vite Config - Added rollupOptions for clean build
   - Removes dedupe that was causing React duplication
   - Forces new chunk hashes to break CDN cache
   
2. Firebase Debug - Added console.logs
   - Shows Firebase module load status
   - Shows app initialization steps
   - Helps diagnose import/build issues

3. Build Strategy - Clean from scratch
   - New build will have different chunk names
   - All browser caches will be invalidated
   
Expected Result: Site works after deployment + hard refresh"

echo "☁️  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Now wait 2-3 minutes for Vercel to redeploy"
echo ""
echo "Then:"
echo "1. Open: https://logledger-pro.com"
echo "2. Press: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "3. Open Console (F12) - look for '🔥 Firebase module loading...'"
echo "4. Check if site loads properly"
echo ""
