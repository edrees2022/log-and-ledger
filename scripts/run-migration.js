#!/usr/bin/env node

/**
 * Run database migration: 0002_add_permissions_system.sql
 * This creates the role_permissions table and populates default permissions
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Running migration: 0002_add_permissions_system.sql');
    
    // Read migration file
    const migrationPath = join(__dirname, '..', 'migrations', '0002_add_permissions_system.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    // Execute migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Created role_permissions table with 100+ default permissions');
    
    // Verify
    const result = await pool.query('SELECT COUNT(*) FROM role_permissions');
    console.log(`✅ Permissions loaded: ${result.rows[0].count} entries`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
