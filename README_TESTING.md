# 🧪 Testing & Verification Guide

## Overview
This guide explains how to verify the integrity of the Log & Ledger system in a production environment (Vercel + Render + Neon + Firebase).

## 1. Pre-Flight Checklist (Environment Variables)
Ensure the following environment variables are set on **Render** (Backend):
- `DATABASE_URL`: Connection string to Neon PostgreSQL.
- `FIREBASE_PROJECT_ID`: Your Firebase project ID.
- `FIREBASE_SERVICE_ACCOUNT_KEY`: JSON string of your service account (optional but recommended).
- `ALLOWED_ORIGINS`: Comma-separated list of frontend URLs (e.g., `https://your-app.vercel.app`).

Ensure the following environment variables are set on **Vercel** (Frontend):
- `VITE_FIREBASE_API_KEY`: Firebase Web API Key.
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase Auth Domain.
- `VITE_FIREBASE_PROJECT_ID`: Firebase Project ID.

## 2. Running the Integrity Audit
We have included a script to statically analyze the codebase for broken API links.
```bash
npm run audit
```
*Note: This script runs locally and does not require a database connection.*

## 3. Manual Verification Steps (Production)

### A. Connectivity Test
1. Open the application URL.
2. Open Chrome DevTools -> Network Tab.
3. Refresh the page.
4. Look for a request to `/api/health` or `/api/auth/me`.
   - **Success**: Status 200 or 401 (Unauthorized).
   - **Failure**: Status 404 (Vercel rewrite broken) or 500 (Backend crash).

### B. Database Test
1. Log in to the application.
2. Go to **Settings > Diagnostics**.
3. Check the "Database Connection" status indicator.

### C. Full Flow Test
1. **Create Company**: Go to Settings -> Companies -> Add New.
2. **Create Contact**: Go to Contacts -> Add Customer.
3. **Create Invoice**: Go to Sales -> Invoices -> New Invoice. Select the customer and save.
4. **Verify**: Go to Reports -> Income Statement. You should see the revenue from the invoice.

## 4. Troubleshooting
- **CORS Errors**: Check `ALLOWED_ORIGINS` on Render.
- **404 on /api**: Check `vercel.json` rewrites.
- **500 Errors**: Check Render logs for "Database connection failed" or "Firebase error".
