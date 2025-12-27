import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Dropping password column from contact_portal_users...");

  await db.execute(sql`
    ALTER TABLE "contact_portal_users" 
    DROP COLUMN IF EXISTS "password";
  `);

  console.log("Column dropped successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
