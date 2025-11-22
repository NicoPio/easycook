import { z } from 'zod'

// Difficulty enum
export const difficultySchema = z.enum(['facile', 'moyen', 'difficile'])

// Unit enum
export const unitSchema = z.enum(['g', 'ml', 'pièce', 'c.à.s', 'c.à.c', 'pincée', 'L', 'kg'])

// Status enum
export const statusSchema = z.enum(['draft', 'published'])

// Ingredient schema
export const ingredientSchema = z.object({
  name: z.string().min(1).max(255),
  quantity: z.number().positive(),
  unit: unitSchema,
  order: z.number().int().nonnegative().default(0),
  isOptional: z.boolean().default(false)
})

// Step schema
export const stepSchema = z.object({
  stepNumber: z.number().int().positive(),
  description: z.string().min(1),
  duration: z.number().int().positive().optional(),
  temperature: z.number().int().min(0).max(300).optional(),
  speed: z.string().max(50).optional(),
  robotParams: z.string().optional()
})

// Recipe schema
export const recipeSchema = z.object({
  title: z.string().min(3).max(255),
  descriptionShort: z.string().max(500).optional(),
  descriptionFull: z.string().optional(),
  prepTime: z.number().int().nonnegative(),
  cookTime: z.number().int().nonnegative(),
  difficulty: difficultySchema,
  servings: z.number().int().min(1).max(20).default(4),
  imageUrl: z.string().url().optional(),
  status: statusSchema.default('draft'),
  robotTypeIds: z.array(z.number().int().positive()).min(1), // At least one robot type
  ingredients: z.array(ingredientSchema).min(1), // At least one ingredient
  steps: z.array(stepSchema).min(1) // At least one step
})

// Recipe update schema (all fields optional except id)
export const recipeUpdateSchema = recipeSchema.partial().extend({
  id: z.number().int().positive()
})

// Search params schema
export const searchParamsSchema = z.object({
  query: z.string().optional(),
  robotType: z.string().optional(),
  difficulty: difficultySchema.optional(),
  maxTotalTime: z.number().int().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
})

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

// Export type utilities
export type RecipeInput = z.infer<typeof recipeSchema>
export type RecipeUpdateInput = z.infer<typeof recipeUpdateSchema>
export type IngredientInput = z.infer<typeof ingredientSchema>
export type StepInput = z.infer<typeof stepSchema>
export type SearchParams = z.infer<typeof searchParamsSchema>
export type LoginInput = z.infer<typeof loginSchema>
