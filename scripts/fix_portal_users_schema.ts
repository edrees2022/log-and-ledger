import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Fixing contact_portal_users schema...");

  await db.execute(sql`
    ALTER TABLE "contact_portal_users" 
    ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'active';
  `);

  await db.execute(sql`
    ALTER TABLE "contact_portal_users" 
    ADD COLUMN IF NOT EXISTS "last_login_at" timestamp;
  `);

  console.log("Schema fixed successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
