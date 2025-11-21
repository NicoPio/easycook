/**
 * Database connection utility
 * Creates and exports Drizzle ORM client with SQLite
 */

import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../database/schema'

// Get database path from runtime config or environment variable
const config = useRuntimeConfig()
const dbPath = config.databasePath || './data/recipes.db'

// Create SQLite connection
const sqlite = new Database(dbPath)

// Enable foreign keys (required for CASCADE operations)
sqlite.pragma('foreign_keys = ON')

// Enable WAL mode for better concurrency (recommended for production)
sqlite.pragma('journal_mode = WAL')

// Create Drizzle client with schema
export const db = drizzle(sqlite, { schema })

/**
 * Close database connection
 * Useful for tests or graceful shutdown
 */
export function closeDb() {
  sqlite.close()
}

/**
 * Execute a raw SQL query (use sparingly)
 */
export function executeSql(sql: string) {
  return sqlite.exec(sql)
}
