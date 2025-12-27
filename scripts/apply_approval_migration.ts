import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import fs from 'fs';
import path from 'path';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function main() {
  const migrationPath = path.join(process.cwd(), 'migrations', '0003_approval_workflows.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('Applying approval workflow migration...');
  
  const statements = migrationSql.split('--> statement-breakpoint');
  
  for (const statement of statements) {
    const trimmed = statement.trim();
    if (trimmed) {
      try {
        await sql(trimmed);
        console.log('Executed statement successfully.');
      } catch (e: any) {
        console.error('Error executing statement:', e.message);
      }
    }
  }
  
  console.log('Migration applied.');
}

main().catch(console.error);
