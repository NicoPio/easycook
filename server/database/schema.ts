import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Robot Types Table
export const robotTypes = sqliteTable('robot_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  manufacturer: text('manufacturer'),
  slug: text('slug').notNull().unique()
})

// Recipes Table
export const recipes = sqliteTable('recipes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  descriptionShort: text('description_short'),
  descriptionFull: text('description_full'),
  prepTime: integer('prep_time').notNull(), // minutes
  cookTime: integer('cook_time').notNull(), // minutes
  difficulty: text('difficulty', { enum: ['facile', 'moyen', 'difficile'] }).notNull(),
  servings: integer('servings').notNull().default(4),
  imageUrl: text('image_url'),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
})

// Ingredients Table
export const ingredients = sqliteTable('ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recipeId: integer('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit', {
    enum: ['g', 'ml', 'pièce', 'c.à.s', 'c.à.c', 'pincée', 'L', 'kg']
  }).notNull(),
  order: integer('order').notNull().default(0),
  isOptional: integer('is_optional', { mode: 'boolean' }).notNull().default(false)
})

// Steps Table
export const steps = sqliteTable('steps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recipeId: integer('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  description: text('description').notNull(),
  duration: integer('duration'), // minutes
  temperature: integer('temperature'), // °C
  speed: text('speed'),
  robotParams: text('robot_params') // JSON string
})

// Recipe-Robot Many-to-Many Junction Table
export const recipeRobotTypes = sqliteTable('recipe_robot_types', {
  recipeId: integer('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  robotTypeId: integer('robot_type_id')
    .notNull()
    .references(() => robotTypes.id, { onDelete: 'cascade' })
})

// Relations
export const robotTypesRelations = relations(robotTypes, ({ many }) => ({
  recipeRobotTypes: many(recipeRobotTypes)
}))

export const recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(ingredients),
  steps: many(steps),
  recipeRobotTypes: many(recipeRobotTypes)
}))

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [ingredients.recipeId],
    references: [recipes.id]
  })
}))

export const stepsRelations = relations(steps, ({ one }) => ({
  recipe: one(recipes, {
    fields: [steps.recipeId],
    references: [recipes.id]
  })
}))

export const recipeRobotTypesRelations = relations(recipeRobotTypes, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeRobotTypes.recipeId],
    references: [recipes.id]
  }),
  robotType: one(robotTypes, {
    fields: [recipeRobotTypes.robotTypeId],
    references: [robotTypes.id]
  })
}))
