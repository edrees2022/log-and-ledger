# Firebase Mobile OAuth Setup - CRITICAL

## ⚠️ IMPORTANT: Complete these steps in Firebase Console

### Step 1: Add Authorized Domains
1. Go to: https://console.firebase.google.com/project/log-and-ledger/authentication/settings
2. Click "Settings" tab → "Authorized domains"
3. Add these domains:
   - `log-and-ledger.firebaseapp.com` ✅ (already exists)
   - `log-and-ledger.web.app` ✅ (already exists)
   - `localhost` ✅ (for development)

### Step 2: Enable Dynamic Links (for redirect)
1. Go to: https://console.firebase.google.com/project/log-and-ledger/durablelinks/links
2. Click "Get Started"
3. Create domain: `logandledger.page.link`
4. This allows signInWithRedirect to work properly on mobile

### Step 3: Update OAuth Redirect URIs in Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials?project=log-and-ledger
2. Find OAuth 2.0 Client ID for Web application
3. Add to "Authorized redirect URIs":
   - `https://log-and-ledger.firebaseapp.com/__/auth/handler`
   - `https://log-and-ledger.web.app/__/auth/handler`
   - `http://localhost` (development)
   - `https://localhost` (development)

### Step 4: Verify Android OAuth Client
1. In same Google Cloud Console → Credentials
2. Find "Android client" OAuth 2.0 Client ID
3. Verify Package name: `com.logandledger.app`
4. Verify SHA-1: `56:6F:90:14:87:45:7B:33:60:FD:28:14:B8:9F:4E:BA:5C:EE:10:78`

## Testing After Setup

After completing above steps:
1. Build APK: `npm run build:frontend && npx cap sync android && cd android && ./gradlew assembleRelease`
2. Install APK on device
3. Click "Sign in with Google"
4. Should open full OAuth page with "Use another account" option
5. After selecting account, should redirect back to app automatically

## Current Status
- ✅ Deep Links configured in AndroidManifest.xml
- ✅ Firebase Auth domains configured in capacitor.config.ts
- ⚠️ Firebase Dynamic Links - NEEDS SETUP
- ⚠️ OAuth Redirect URIs - VERIFY IN CONSOLE

## Why This is Professional Solution
- ✅ Same approach as Gmail, YouTube, Drive apps
- ✅ Full Google account picker
- ✅ Seamless redirect back to app
- ✅ No code workarounds needed
- ✅ Scales to millions of users
