import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../database/schema'

// Get database path from environment or use default
const dbPath = process.env.DATABASE_PATH || './data/easycook.db'

// Create SQLite database instance
const sqlite = new Database(dbPath)

// Enable foreign keys
sqlite.pragma('foreign_keys = ON')

// Create Drizzle ORM instance
export const db = drizzle(sqlite, { schema })

// Export types for use in API handlers
export type DbClient = typeof db
