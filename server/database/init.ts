import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { sql } from 'drizzle-orm'
import * as schema from './schema'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const DATABASE_PATH = process.env.DATABASE_PATH || './data/easycook.db'

console.log(`Initializing database at ${DATABASE_PATH}...`)

// Ensure the directory exists before creating the database
const dbDir = dirname(DATABASE_PATH)
mkdirSync(dbDir, { recursive: true })

const sqlite = new Database(DATABASE_PATH)
const db = drizzle(sqlite, { schema })

// Create tables directly without migrations
console.log('Creating tables...')

sqlite.exec(`
CREATE TABLE IF NOT EXISTS robot_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name TEXT NOT NULL UNIQUE,
  manufacturer TEXT,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_short TEXT,
  description_full TEXT,
  prep_time INTEGER NOT NULL,
  cook_time INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  servings INTEGER DEFAULT 4 NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'draft' NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  recipe_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  \`order\` INTEGER DEFAULT 0 NOT NULL,
  is_optional INTEGER DEFAULT 0 NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  recipe_id INTEGER NOT NULL,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER,
  temperature INTEGER,
  speed TEXT,
  robot_params TEXT,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recipe_robot_types (
  recipe_id INTEGER NOT NULL,
  robot_type_id INTEGER NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (robot_type_id) REFERENCES robot_types(id) ON DELETE CASCADE
);
`)

console.log('✅ Database initialized successfully!')
sqlite.close()
