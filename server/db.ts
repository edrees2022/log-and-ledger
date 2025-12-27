import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle, NeonDatabase } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

// Use WebSocket for better performance on Railway/Render
neonConfig.webSocketConstructor = ws;

// Neon-specific optimizations for serverless
neonConfig.pipelineConnect = 'password'; // Use pipelining for faster connections
neonConfig.useSecureWebSocket = true; // Ensure secure connections

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Pool configuration optimized for enterprise scale
// For millions of users, use Neon's connection pooler URL (pooled connection string)
const POOL_CONFIG = {
  // Use environment variable for pool size, default to 50 for production
  max: parseInt(process.env.DB_POOL_SIZE || '50', 10),
  // Keep connections alive longer for high-traffic scenarios
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '60000', 10),
  // Timeout for acquiring a connection from the pool
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '15000', 10),
  // Allow queue when pool is exhausted (important for burst traffic)
  allowExitOnIdle: false,
};

// Export types to be compatible with both drivers
export let pool: Pool | pg.Pool;
export let db: NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

if (process.env.NODE_ENV === 'test') {
  // In test environment (CI), use standard pg driver to connect to local postgres container
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ...POOL_CONFIG,
    max: 20, // Lower for tests
  });
  db = drizzlePg(pool, { schema });
  console.log('📦 Database: Using pg driver for tests');
} else {
  // In production/dev, use Neon serverless driver
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ...POOL_CONFIG,
  });
  db = drizzle({ client: pool as Pool, schema });
  console.log(`📦 Database: Using Neon serverless driver (pool size: ${POOL_CONFIG.max})`);
}

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('🔄 Closing database connections...');
  await (pool as any).end?.();
  console.log('✅ Database connections closed');
});

