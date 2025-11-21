/**
 * Validation schemas using Zod
 * Centralized validation for API inputs
 */

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────
// Recipe Validation Schemas
// ─────────────────────────────────────────────────────────────

export const difficultySchema = z.enum(['facile', 'moyen', 'difficile'])
export const statusSchema = z.enum(['draft', 'published'])

export const unitSchema = z.enum([
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
])

export const ingredientSchema = z.object({
  name: z.string().min(2).max(100),
  quantity: z.number().positive(),
  unit: unitSchema,
  order: z.number().int().nonnegative().default(0),
  optional: z.boolean().default(false),
})

export const stepSchema = z.object({
  order: z.number().int().positive(),
  description: z.string().min(10).max(1000),
  duration: z.number().int().nonnegative().nullable().optional(),
  temperature: z.number().int().min(-20).max(300).nullable().optional(),
  speed: z.string().max(20).nullable().optional(),
  ingredients: z.array(z.string()).nullable().optional(),
})

export const recipeSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(500).nullable().optional(),
  prepTime: z.number().int().min(0).max(600),
  cookTime: z.number().int().min(0).max(600),
  difficulty: difficultySchema,
  servings: z.number().int().min(1).max(20),
  robotTypeId: z.number().int().positive(),
  imageUrl: z.string().url().nullable().optional(),
  status: statusSchema.default('draft'),
  ingredients: z.array(ingredientSchema).min(1),
  steps: z.array(stepSchema).min(1),
})

// ─────────────────────────────────────────────────────────────
// Update Recipe Schema (all fields optional except id)
// ─────────────────────────────────────────────────────────────

export const updateRecipeSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(5).max(200).optional(),
  description: z.string().max(500).nullable().optional(),
  prepTime: z.number().int().min(0).max(600).optional(),
  cookTime: z.number().int().min(0).max(600).optional(),
  difficulty: difficultySchema.optional(),
  servings: z.number().int().min(1).max(20).optional(),
  robotTypeId: z.number().int().positive().optional(),
  imageUrl: z.string().url().nullable().optional(),
  status: statusSchema.optional(),
  ingredients: z.array(ingredientSchema).optional(),
  steps: z.array(stepSchema).optional(),
})

// ─────────────────────────────────────────────────────────────
// Search and Filter Schemas
// ─────────────────────────────────────────────────────────────

export const searchRecipesSchema = z.object({
  query: z.string().min(1).max(200).optional(),
  robotType: z.string().optional(),
  difficulty: difficultySchema.optional(),
  maxTotalTime: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
})

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
})

// ─────────────────────────────────────────────────────────────
// Authentication Schemas
// ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

// ─────────────────────────────────────────────────────────────
// Parsed Recipe Schema (from AI)
// ─────────────────────────────────────────────────────────────

export const parsedIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  optional: z.boolean().optional(),
})

export const parsedStepSchema = z.object({
  order: z.number().int().positive(),
  description: z.string().min(10),
  duration: z.number().int().nonnegative().optional(),
  temperature: z.number().int().optional(),
  speed: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
})

export const parsedRecipeSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(500).optional(),
  prepTime: z.number().int().min(0).max(600),
  cookTime: z.number().int().min(0).max(600),
  difficulty: difficultySchema,
  servings: z.number().int().min(1).max(20),
  robotType: z.string().min(1), // slug
  ingredients: z.array(parsedIngredientSchema).min(1),
  steps: z.array(parsedStepSchema).min(1),
})

// ─────────────────────────────────────────────────────────────
// Validation Helper Functions
// ─────────────────────────────────────────────────────────────

/**
 * Validate and parse data with Zod schema
 * Throws error if validation fails
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: { errors },
    })
  }

  return result.data
}

/**
 * Validate with custom error message
 */
export function validateWithMessage<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  message: string
): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      message,
      data: { errors: result.error.errors },
    })
  }

  return result.data
}
