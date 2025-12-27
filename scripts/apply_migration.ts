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
  const migrationPath = path.join(process.cwd(), 'migrations', '0002_special_junta.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('Applying migration...');
  
  // Split by statement-breakpoint or semicolons if needed, but neon-http might handle multiple statements.
  // Drizzle generated files use "--> statement-breakpoint" separator.
  
  const statements = migrationSql.split('--> statement-breakpoint');
  
  for (const statement of statements) {
    const trimmed = statement.trim();
    if (trimmed) {
      try {
        await sql(trimmed);
        console.log('Executed statement successfully.');
      } catch (e) {
        console.error('Error executing statement:', e.message);
        // Continue even if error (e.g. column already exists)
      }
    }
  }
  
  console.log('Migration applied.');
}

main().catch(console.error);
