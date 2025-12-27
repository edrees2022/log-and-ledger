#!/bin/zsh

cd "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main"

echo "📦 Staging changes..."
git add -A

echo "💾 Committing: remove dev plugins + safe auth stub"
git commit -m "fix(frontend): remove dev-only Vite plugins (Replit overlay) and restore safe Firebase auth stub\n\n- Remove @replit runtime error overlay and cartographer from production build\n- Keep Vite config minimal to prevent React duplication\n- Provide safe Firebase auth stub when app not initialized to satisfy TS and avoid null deref\n\nExpected: resolves useContext null error and CI TS errors"

echo "☁️  Pushing to GitHub..."
git push origin main

echo "✅ Pushed. Watch Vercel build, then hard-refresh (Cmd+Shift+R)." 
