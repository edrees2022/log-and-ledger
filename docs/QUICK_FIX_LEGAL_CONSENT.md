# 🔴 EMERGENCY FIX: Legal Consent Columns Missing

## Critical Error 🚨

```
error: column "legal_consent_version" does not exist
POST /api/auth/sso-login → 500 (Internal Server Error)
```

## Root Cause 🔍

Backend code expects these columns in `users` table:
- `legal_consent_accepted` (BOOLEAN)
- `legal_consent_date` (TIMESTAMP)
- `legal_consent_version` (TEXT)

But they don't exist in production database!

---

## ✅ SOLUTION: Run New Migration

### Option 1: Neon Console (Easiest) ⭐

1. **Open Neon Console**: https://console.neon.tech/
2. **Select your project**: `log-and-ledger`
3. **Go to SQL Editor**
4. **Copy and paste this SQL**:

```sql
-- Migration: Add Legal Consent Columns
DO $$
BEGIN
  -- Add legal_consent_accepted
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'legal_consent_accepted') THEN
    ALTER TABLE users ADD COLUMN legal_consent_accepted BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE '✓ Added legal_consent_accepted column';
  END IF;

  -- Add legal_consent_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'legal_consent_date') THEN
    ALTER TABLE users ADD COLUMN legal_consent_date TIMESTAMP;
    RAISE NOTICE '✓ Added legal_consent_date column';
  END IF;

  -- Add legal_consent_version
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'legal_consent_version') THEN
    ALTER TABLE users ADD COLUMN legal_consent_version TEXT;
    RAISE NOTICE '✓ Added legal_consent_version column';
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_legal_consent 
  ON users(legal_consent_accepted, legal_consent_version);

-- Verify
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('legal_consent_accepted', 'legal_consent_date', 'legal_consent_version')
ORDER BY column_name;
```

5. **Click "Run"**
6. **You should see**:
   ```
   ✓ Added legal_consent_accepted column
   ✓ Added legal_consent_date column
   ✓ Added legal_consent_version column
   
   3 rows returned showing the new columns
   ```

---

### Option 2: Render Shell

1. **Open Render Dashboard**: https://dashboard.render.com
2. **Select your backend service**: `log-and-ledger`
3. **Click "Shell"** tab
4. **Run**:
   ```bash
   npm run db:migrate
   ```

---

## Verification ✓

After migration, test SSO login at https://www.logledger-pro.com

**Expected Results**:
- ✅ POST /api/auth/sso-login → 200 OK
- ✅ Dashboard loads data
- ✅ No more "legal_consent_version" errors

---

## What These Columns Do 📋

- **legal_consent_accepted**: Whether user accepted Terms & Privacy Policy
- **legal_consent_date**: When they accepted
- **legal_consent_version**: Which version they accepted (e.g., "2025-11-01")

These are used for GDPR compliance and legal tracking.

---

## Troubleshooting 🔧

### Still Getting Error After Migration?

**Check if columns were added**:
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name LIKE 'legal_consent%';
```

Should return 3 rows:
- legal_consent_accepted
- legal_consent_date  
- legal_consent_version

### Backend Not Picking Up Changes?

**Force Render to redeploy**:
1. Go to Render Dashboard
2. Click "Manual Deploy"
3. Choose "Clear build cache & deploy"
4. Wait 5-10 minutes

---

## Files Created 📁

- `migrations/0002_add_legal_consent_columns.sql` - Main migration
- `migrations/0003_add_critical_indexes.sql` - Performance indexes

---

## Timeline ⏱️

- **Migration time**: 1-2 seconds
- **Total fix time**: 2-3 minutes
- **No downtime required**

---

## Next Steps After Fix 🎯

1. ✅ Run migration (this guide)
2. ✅ Test SSO login
3. ✅ Push new migrations to GitHub
4. ✅ Optional: Run index migration for better performance

---

**Quick command to apply both migrations**:
```bash
cd /path/to/log-and-ledger
psql $DATABASE_URL -f migrations/0002_add_legal_consent_columns.sql
psql $DATABASE_URL -f migrations/0003_add_critical_indexes.sql
```

Or copy/paste both SQL files in Neon Console SQL Editor! 🚀
