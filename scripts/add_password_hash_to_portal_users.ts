import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Adding password_hash to contact_portal_users...");

  await db.execute(sql`
    ALTER TABLE "contact_portal_users" 
    ADD COLUMN IF NOT EXISTS "password_hash" text NOT NULL DEFAULT 'hash';
  `);

  // Remove default after adding
  await db.execute(sql`
    ALTER TABLE "contact_portal_users" 
    ALTER COLUMN "password_hash" DROP DEFAULT;
  `);

  console.log("Column added successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
