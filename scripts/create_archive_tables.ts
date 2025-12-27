import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating archive tables...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "journals_archive" (
      "id" varchar PRIMARY KEY,
      "company_id" varchar NOT NULL,
      "journal_number" text NOT NULL,
      "date" timestamp NOT NULL,
      "description" text,
      "reference" text,
      "source_type" text,
      "source_id" varchar,
      "total_amount" numeric(15, 2) NOT NULL,
      "created_by" varchar,
      "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "archived_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "archived_by" varchar,
      "fiscal_year" integer NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "journal_lines_archive" (
      "id" varchar PRIMARY KEY,
      "journal_id" varchar NOT NULL REFERENCES "journals_archive"("id") ON DELETE CASCADE,
      "account_id" varchar NOT NULL,
      "description" text,
      "debit" numeric(15, 2) NOT NULL DEFAULT '0',
      "credit" numeric(15, 2) NOT NULL DEFAULT '0',
      "currency" varchar(3) NOT NULL DEFAULT 'USD',
      "fx_rate" numeric(10, 6) NOT NULL DEFAULT '1',
      "base_debit" numeric(15, 2) NOT NULL DEFAULT '0',
      "base_credit" numeric(15, 2) NOT NULL DEFAULT '0',
      "project_id" varchar,
      "cost_center_id" varchar
    );
  `);

  console.log("Archive tables created successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
