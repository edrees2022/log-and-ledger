#!/usr/bin/env node

/**
 * Check columns in a specific table
 */

import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function checkColumns() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
  });

  const tableName = process.argv[2] || 'sales_invoices';

  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    console.log(`📋 Columns in '${tableName}':`);
    result.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? '(nullable)' : '(not null)';
      console.log(`   - ${row.column_name}: ${row.data_type} ${nullable}`);
    });
    
    console.log(`\n✅ Total: ${result.rows.length} columns`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkColumns();
