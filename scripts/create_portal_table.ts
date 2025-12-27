import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating contact_portal_users table...");
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "contact_portal_users" (
      "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "contact_id" varchar NOT NULL,
      "email" text NOT NULL,
      "password" text NOT NULL,
      "name" text NOT NULL,
      "role" text DEFAULT 'admin' NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "last_login" timestamp,
      "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  console.log("Adding foreign key constraint...");
  try {
    await db.execute(sql`
      ALTER TABLE "contact_portal_users" 
      ADD CONSTRAINT "contact_portal_users_contact_id_contacts_id_fk" 
      FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") 
      ON DELETE cascade ON UPDATE no action;
    `);
  } catch (e: any) {
    if (e.code === '42710') { // duplicate_object
      console.log("Constraint already exists");
    } else {
      console.error("Error adding constraint:", e);
    }
  }

  console.log("Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});