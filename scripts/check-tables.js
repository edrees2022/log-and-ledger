#!/usr/bin/env node

/**
 * Check which tables exist in the database
 */

import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log('📋 Tables in database:');
    result.rows.forEach(row => {
      console.log(`   - ${row.tablename}`);
    });
    
    console.log(`\n✅ Total: ${result.rows.length} tables`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
