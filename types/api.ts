/**
 * API request/response types
 * Defines contracts between frontend and backend
 */

import type {
  Recipe,
  RecipeWithRelations,
  RecipeSummary,
  Ingredient,
  Step,
  RobotType,
  Difficulty,
  Status,
} from './recipe'

// ─────────────────────────────────────────────────────────────
// Common API Response Structure
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// ─────────────────────────────────────────────────────────────
// Recipe API Types
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/recipes - List recipes response
 */
export interface ListRecipesResponse {
  recipes: RecipeSummary[]
  total: number
}

/**
 * GET /api/recipes/[id] - Recipe detail response
 */
export interface RecipeDetailResponse {
  recipe: RecipeWithRelations
}

/**
 * POST /api/recipes/search - Search request
 */
export interface SearchRecipesRequest {
  query?: string
  robotType?: string // slug
  difficulty?: Difficulty
  maxTotalTime?: number
  limit?: number
  offset?: number
}

/**
 * POST /api/recipes/search - Search response
 */
export interface SearchRecipesResponse {
  recipes: RecipeSummary[]
  total: number
  searchTime: number // milliseconds
}

// ─────────────────────────────────────────────────────────────
// Admin API Types
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login - Login request
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * POST /api/auth/login - Login response
 */
export interface LoginResponse {
  token: string
  expiresAt: number // Unix timestamp
}

/**
 * POST /api/admin/import - Parse recipe request
 */
export interface ParseRecipeRequest {
  rawText: string
  robotType?: string // slug hint for parser
}

/**
 * POST /api/admin/import - Parse recipe response
 */
export interface ParseRecipeResponse {
  status: 'success' | 'partial' | 'error'
  recipe: ParsedRecipe | null
  errors: ParseError[]
  confidence: number // 0-100%
}

/**
 * Parsed recipe structure from AI
 */
export interface ParsedRecipe {
  title: string
  description?: string
  prepTime: number
  cookTime: number
  difficulty: Difficulty
  servings: number
  robotType: string // slug
  ingredients: ParsedIngredient[]
  steps: ParsedStep[]
}

export interface ParsedIngredient {
  name: string
  quantity: number
  unit: string
  optional?: boolean
}

export interface ParsedStep {
  order: number
  description: string
  duration?: number
  temperature?: number
  speed?: string
  ingredients?: string[]
}

export interface ParseError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

/**
 * POST /api/admin/recipes - Create recipe request
 */
export interface CreateRecipeRequest {
  title: string
  description?: string
  prepTime: number
  cookTime: number
  difficulty: Difficulty
  servings: number
  robotTypeId: number
  imageUrl?: string
  status: Status
  ingredients: CreateIngredientRequest[]
  steps: CreateStepRequest[]
}

export interface CreateIngredientRequest {
  name: string
  quantity: number
  unit: string
  order: number
  optional?: boolean
}

export interface CreateStepRequest {
  order: number
  description: string
  duration?: number
  temperature?: number
  speed?: string
  ingredients?: string[]
}

/**
 * PUT /api/admin/recipes/[id] - Update recipe request
 */
export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {
  id: number
}

/**
 * GET /api/admin/recipes - List all recipes (admin)
 */
export interface AdminListRecipesResponse {
  recipes: RecipeSummary[]
  total: number
  drafts: number
  published: number
}

// ─────────────────────────────────────────────────────────────
// Error Types
// ─────────────────────────────────────────────────────────────

export interface ApiError {
  message: string
  code: string
  statusCode: number
  details?: Record<string, unknown>
}

/**
 * Validation error for form fields
 */
export interface ValidationError {
  field: string
  message: string
}

// ─────────────────────────────────────────────────────────────
// Robot Types API
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/robots - List robot types
 */
export interface ListRobotTypesResponse {
  robots: RobotType[]
}
