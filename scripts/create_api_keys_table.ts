import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating api_keys table...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "api_keys" (
      "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      "company_id" varchar NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
      "name" text NOT NULL,
      "key_hash" text NOT NULL,
      "prefix" text NOT NULL,
      "scopes" jsonb NOT NULL DEFAULT '[]',
      "last_used_at" timestamp,
      "expires_at" timestamp,
      "is_active" boolean NOT NULL DEFAULT true,
      "created_by" varchar REFERENCES "users"("id"),
      "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("api_keys table created successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
