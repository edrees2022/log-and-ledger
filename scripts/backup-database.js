#!/usr/bin/env node

/**
 * Manual database backup script
 * Usage: node scripts/backup-database.js
 */

import { Pool } from '@neondatabase/serverless';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function backupDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔄 Starting database backup...');
    console.log('⏳ This may take a few minutes for large databases...');
    
    // Create backups directory if it doesn't exist
    const backupsDir = join(process.cwd(), 'backups');
    if (!existsSync(backupsDir)) {
      mkdirSync(backupsDir, { recursive: true });
    }
    
    // Get all table names
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    const tables = tablesResult.rows.map(r => r.tablename);
    console.log(`\n📋 Found ${tables.length} tables to backup:`);
    tables.forEach(t => console.log(`   - ${t}`));
    
    let backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      database: {
        url_host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
        name: process.env.DATABASE_URL?.split('/').pop() || 'unknown'
      },
      tables: {}
    };
    
    console.log('\n💾 Backing up tables:');
    
    // Backup each table
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT * FROM ${table}`);
        backup.tables[table] = {
          rowCount: result.rows.length,
          columns: result.fields.map(f => f.name),
          data: result.rows
        };
        console.log(`   ✅ ${table}: ${result.rows.length} rows`);
      } catch (error) {
        console.error(`   ❌ ${table}: Failed - ${error.message}`);
        backup.tables[table] = {
          error: error.message,
          rowCount: 0,
          data: []
        };
      }
    }
    
    // Calculate total size
    const totalRows = Object.values(backup.tables)
      .reduce((sum, t) => sum + (t.rowCount || 0), 0);
    
    // Write backup file
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
    const filename = join(backupsDir, `backup-${date}-${time}.json`);
    
    writeFileSync(filename, JSON.stringify(backup, null, 2));
    
    const fileSize = (writeFileSync.length / 1024 / 1024).toFixed(2);
    
    console.log('\n✅ Backup completed successfully!');
    console.log(`📁 File: ${filename}`);
    console.log(`📊 Total rows: ${totalRows}`);
    console.log(`💾 Tables backed up: ${Object.keys(backup.tables).length}`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Backup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

backupDatabase();
