/**
 * Drizzle ORM Schema Definition
 * SQLite database schema for recipe application
 * Based on data-model.md specification
 */

import {
  sqliteTable,
  integer,
  text,
  real,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

// ─────────────────────────────────────────────────────────────
// Table: robot_types
// ─────────────────────────────────────────────────────────────

export const robotTypes = sqliteTable('robot_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  manufacturer: text('manufacturer').notNull(),
  slug: text('slug').notNull().unique(),
})

// ─────────────────────────────────────────────────────────────
// Table: recipes
// ─────────────────────────────────────────────────────────────

export const recipes = sqliteTable(
  'recipes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    prepTime: integer('prep_time').notNull().default(0),
    cookTime: integer('cook_time').notNull().default(0),
    difficulty: text('difficulty', {
      enum: ['facile', 'moyen', 'difficile'],
    }).notNull(),
    servings: integer('servings').notNull().default(4),
    robotTypeId: integer('robot_type_id')
      .notNull()
      .references(() => robotTypes.id, { onDelete: 'restrict' }),
    imageUrl: text('image_url'),
    status: text('status', { enum: ['draft', 'published'] })
      .notNull()
      .default('draft'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    slugIdx: uniqueIndex('idx_recipes_slug').on(table.slug),
    statusRobotIdx: index('idx_recipes_status_robot').on(
      table.status,
      table.robotTypeId
    ),
    createdIdx: index('idx_recipes_created').on(table.createdAt),
  })
)

// ─────────────────────────────────────────────────────────────
// Table: ingredients
// ─────────────────────────────────────────────────────────────

export const ingredients = sqliteTable(
  'ingredients',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    quantity: real('quantity').notNull(),
    unit: text('unit', {
      enum: [
        'g',
        'kg',
        'ml',
        'l',
        'c.à.s',
        'c.à.c',
        'pincée',
        'pièce',
        'tranche',
        'botte',
        'gousse',
      ],
    }).notNull(),
    order: integer('order').notNull().default(0),
    optional: integer('optional', { mode: 'boolean' }).notNull().default(false),
  },
  (table) => ({
    recipeIdx: index('idx_ingredients_recipe').on(table.recipeId),
    orderIdx: index('idx_ingredients_order').on(table.recipeId, table.order),
  })
)

// ─────────────────────────────────────────────────────────────
// Table: steps
// ─────────────────────────────────────────────────────────────

export const steps = sqliteTable(
  'steps',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    description: text('description').notNull(),
    duration: integer('duration'),
    temperature: integer('temperature'),
    speed: text('speed'),
    ingredients: text('ingredients', { mode: 'json' }).$type<string[]>(),
  },
  (table) => ({
    recipeOrderIdx: uniqueIndex('idx_steps_recipe_order').on(
      table.recipeId,
      table.order
    ),
  })
)

// ─────────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────────

export const robotTypesRelations = relations(robotTypes, ({ many }) => ({
  recipes: many(recipes),
}))

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  robotType: one(robotTypes, {
    fields: [recipes.robotTypeId],
    references: [robotTypes.id],
  }),
  ingredients: many(ingredients),
  steps: many(steps),
}))

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [ingredients.recipeId],
    references: [recipes.id],
  }),
}))

export const stepsRelations = relations(steps, ({ one }) => ({
  recipe: one(recipes, {
    fields: [steps.recipeId],
    references: [recipes.id],
  }),
}))

// ─────────────────────────────────────────────────────────────
// Type Inference for Drizzle
// ─────────────────────────────────────────────────────────────

export type DbRobotType = typeof robotTypes.$inferSelect
export type NewDbRobotType = typeof robotTypes.$inferInsert

export type DbRecipe = typeof recipes.$inferSelect
export type NewDbRecipe = typeof recipes.$inferInsert

export type DbIngredient = typeof ingredients.$inferSelect
export type NewDbIngredient = typeof ingredients.$inferInsert

export type DbStep = typeof steps.$inferSelect
export type NewDbStep = typeof steps.$inferInsert
