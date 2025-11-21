/**
 * Core recipe domain types
 * Based on data-model.md specification
 */

// ─────────────────────────────────────────────────────────────
// Enums and Constants
// ─────────────────────────────────────────────────────────────

export const UNITS = [
  'g', // grammes
  'kg', // kilogrammes
  'ml', // millilitres
  'l', // litres
  'c.à.s', // cuillère à soupe
  'c.à.c', // cuillère à café
  'pincée', // pincée
  'pièce', // pièce(s)
  'tranche', // tranche(s)
  'botte', // botte(s)
  'gousse', // gousse(s)
] as const

export type Unit = (typeof UNITS)[number]

export const DIFFICULTIES = ['facile', 'moyen', 'difficile'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const STATUSES = ['draft', 'published'] as const
export type Status = (typeof STATUSES)[number]

// ─────────────────────────────────────────────────────────────
// Core Entity Types
// ─────────────────────────────────────────────────────────────

/**
 * RobotType represents a cooking robot/appliance type
 */
export interface RobotType {
  id: number
  name: string
  manufacturer: string
  slug: string
}

/**
 * Ingredient with quantity and unit for base servings
 */
export interface Ingredient {
  id: number
  recipeId: number
  name: string
  quantity: number
  unit: Unit
  order: number
  optional: boolean
}

/**
 * Recipe step with optional robot parameters
 */
export interface Step {
  id: number
  recipeId: number
  order: number
  description: string
  duration: number | null
  temperature: number | null
  speed: string | null
  ingredients: string[] | null
}

/**
 * Complete recipe with metadata
 */
export interface Recipe {
  id: number
  title: string
  slug: string
  description: string | null
  prepTime: number
  cookTime: number
  difficulty: Difficulty
  servings: number
  robotTypeId: number
  imageUrl: string | null
  status: Status
  createdAt: Date
  updatedAt: Date
}

// ─────────────────────────────────────────────────────────────
// Extended Types with Relations
// ─────────────────────────────────────────────────────────────

/**
 * Recipe with all related data (for detail view)
 */
export interface RecipeWithRelations extends Recipe {
  robotType: RobotType
  ingredients: Ingredient[]
  steps: Step[]
}

/**
 * Recipe summary for catalog/list view
 */
export interface RecipeSummary extends Recipe {
  robotType: RobotType
}

// ─────────────────────────────────────────────────────────────
// Insert Types (for database operations)
// ─────────────────────────────────────────────────────────────

export type NewRobotType = Omit<RobotType, 'id'>

export type NewRecipe = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date
  updatedAt?: Date
}

export type NewIngredient = Omit<Ingredient, 'id'>

export type NewStep = Omit<Step, 'id'>

// ─────────────────────────────────────────────────────────────
// Utility Types
// ─────────────────────────────────────────────────────────────

/**
 * Recipe fields that can be updated
 */
export type RecipeUpdate = Partial<
  Omit<Recipe, 'id' | 'slug' | 'createdAt' | 'updatedAt'>
> & {
  updatedAt?: Date
}

/**
 * Filter options for recipe queries
 */
export interface RecipeFilters {
  robotType?: string // slug
  difficulty?: Difficulty
  maxTotalTime?: number // prepTime + cookTime
  status?: Status
  search?: string
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number
  offset?: number
}
