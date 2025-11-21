// TypeScript types for API responses
import type { Recipe, RecipeWithDetails, Ingredient, Step, RobotType } from './recipe'

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Recipe API responses
export interface RecipeListResponse {
  recipes: Recipe[]
  total: number
}

export interface RecipeDetailResponse {
  recipe: RecipeWithDetails
}

// Search and filter params
export interface RecipeSearchParams {
  query?: string
  robotType?: string
  difficulty?: string
  maxTotalTime?: number
  page?: number
  limit?: number
}

// Admin API responses
export interface ParsedRecipe {
  status: 'success' | 'partial' | 'error'
  data: {
    title?: string
    descriptionShort?: string
    descriptionFull?: string
    prepTime?: number
    cookTime?: number
    servings?: number
    difficulty?: string
    ingredients?: Array<{
      name: string
      quantity: number
      unit: string
      order?: number
    }>
    steps?: Array<{
      stepNumber: number
      description: string
      duration?: number
      temperature?: number
      speed?: string
    }>
  }
  validationErrors?: string[]
  retryAttempt?: number
}

export interface AdminRecipeResponse {
  recipe: RecipeWithDetails
  message?: string
}

// Auth responses
export interface LoginResponse {
  token: string
  expiresIn: number
}

export interface AuthError {
  error: string
  message: string
}

// Generic API error
export interface ApiError {
  statusCode: number
  message: string
  errors?: Record<string, string[]>
}
