# Database Backups

This directory contains automated daily database backups.

## Backup Strategy

- **Frequency**: Daily at 02:00 UTC via GitHub Actions
- **Format**: JSON with full table data
- **Retention**: Last 30 days (automatic cleanup)
- **Manual Backup**: Run `node scripts/backup-database.js`

## Backup File Structure

```json
{
  "timestamp": "2025-11-10T02:00:00.000Z",
  "version": "1.0",
  "database": {
    "url_host": "ep-xxx.us-east-1.aws.neon.tech",
    "name": "database_name"
  },
  "tables": {
    "table_name": {
      "rowCount": 100,
      "columns": ["id", "name", "created_at"],
      "data": [...]
    }
  }
}
```

## Restore from Backup

To restore from a backup:

1. Find the backup file: `backups/backup-YYYY-MM-DD-HH-MM-SS.json`
2. Review the data carefully
3. Use the restore script (to be implemented) or manually import

## Security Notes

- Backups contain sensitive data - **DO NOT** commit to public repos
- Add `backups/` to `.gitignore` for production use
- For production, consider:
  - Encrypting backups
  - Storing in secure S3 bucket
  - Using pg_dump for binary backups
  - Automated retention policy (30 days)

## Free Tier Considerations

- Neon Free Tier: 0.5 GB storage
- Keep backups external (GitHub/S3) to save database space
- Monitor backup size vs GitHub repo limits (1GB soft limit)
- Consider compression for large backups

## Current Status

✅ Daily backups enabled via GitHub Actions
✅ Manual backup script available
⏳ Restore script (coming soon)
⏳ Automated cleanup (coming soon)
