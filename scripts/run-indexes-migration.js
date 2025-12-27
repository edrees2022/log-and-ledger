#!/usr/bin/env node

/**
 * Run database migration: 0003_add_performance_indexes.sql
 * This creates indexes on frequently queried columns for performance optimization
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
    console.log('🔄 Running migration: 0003_add_performance_indexes.sql');
    console.log('⏳ This may take a few minutes for large tables...');
    
    // Read migration file
    const migrationPath = join(__dirname, '..', 'migrations', '0003_add_performance_indexes.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    // Execute migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Performance indexes created');
    
    // Verify - count indexes
    const result = await pool.query(`
      SELECT COUNT(*) 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
    `);
    console.log(`✅ Total indexes: ${result.rows[0].count} indexes`);
    
    // Show some example indexes
    const exampleIndexes = await pool.query(`
      SELECT tablename, COUNT(*) as index_count
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
      GROUP BY tablename
      ORDER BY index_count DESC
      LIMIT 10
    `);
    
    console.log('\n📋 Top tables with indexes:');
    exampleIndexes.rows.forEach(row => {
      console.log(`   - ${row.tablename}: ${row.index_count} indexes`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runMigration();
