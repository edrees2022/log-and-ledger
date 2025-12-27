import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function checkTables() {
  try {
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'landed_cost_%';
    `);
    console.log("Landed Cost Tables:", result.rows);
    process.exit(0);
  } catch (error) {
    console.error("Error checking tables:", error);
    process.exit(1);
  }
}

checkTables();
