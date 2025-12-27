# Vercel Deployment Guide

## Critical: Firebase Environment Variables

**IMPORTANT**: Firebase environment variables MUST be configured in Vercel for the app to work in production.

### Required Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```
VITE_FIREBASE_API_KEY=AIzaSyC8kehcrhK8JLBbArdJDpGiKMUAweiy0Fo
VITE_FIREBASE_AUTH_DOMAIN=log-and-ledger.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=log-and-ledger
VITE_FIREBASE_STORAGE_BUCKET=log-and-ledger.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=808599419586
VITE_FIREBASE_APP_ID=1:808599419586:web:2f3f1754703d652987595b
VITE_FIREBASE_MEASUREMENT_ID=G-GCZ55Q5JRB
VITE_API_URL=https://log-and-ledger.onrender.com
```

### Why This Matters

Without these environment variables:
- Firebase will fail to initialize
- `auth` will be `null`
- React Context will crash with "Cannot read properties of null"
- The app will show a blank white screen

### Steps to Fix Production Issue

1. **Go to Vercel Dashboard**
   - Open: https://vercel.com/dashboard
   - Select your project: `log-and-ledger`

2. **Add Environment Variables**
   - Click: Settings → Environment Variables
   - Add each variable listed above
   - Select: Production, Preview, Development (all three)
   - Click: Save

3. **Redeploy**
   - Go to: Deployments tab
   - Click: ⋯ (three dots) on latest deployment
   - Click: Redeploy

4. **Verify**
   - Wait 2-3 minutes for redeployment
   - Open your site
   - Open browser console (F12)
   - You should see: "Firebase Config Check" with valid keys
   - No errors about null or useContext

### Alternative: Use .env.production

Vercel automatically reads `.env.production` file, but only if it's committed to git.

**Current status**: `.env.production` is now updated with Firebase config.

### Troubleshooting

If you still see errors:
1. Check Vercel build logs for missing env vars
2. Ensure Firebase project is active in console
3. Verify email/password auth is enabled in Firebase
4. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

### Build Configuration

Current Vite config includes:
- React dedupe to prevent multiple React instances
- Firebase chunking for better caching
- Source maps disabled for faster builds
- ESBuild minification

All optimized for production performance.
