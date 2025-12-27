import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  const result = await db.execute(sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'contact_portal_users';
  `);
  console.log(result.rows);
  process.exit(0);
}

main().catch(console.error);
