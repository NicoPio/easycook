// TypeScript types for Recipe domain
export type Difficulty = 'facile' | 'moyen' | 'difficile'
export type RecipeStatus = 'draft' | 'published'
export type UnitType = 'g' | 'ml' | 'pièce' | 'c.à.s' | 'c.à.c' | 'pincée' | 'L' | 'kg'

export interface Recipe {
  id: number
  title: string
  slug: string
  descriptionShort: string | null
  descriptionFull: string | null
  prepTime: number // minutes
  cookTime: number // minutes
  totalTime: number // computed: prepTime + cookTime
  difficulty: Difficulty
  servings: number // nombre de personnes par défaut
  imageUrl: string | null
  status: RecipeStatus
  createdAt: Date
  updatedAt: Date
}

export interface Ingredient {
  id: number
  recipeId: number
  name: string
  quantity: number
  unit: UnitType
  order: number
  isOptional: boolean
}

export interface Step {
  id: number
  recipeId: number
  stepNumber: number
  description: string
  duration: number | null // minutes
  temperature: number | null // °C
  speed: string | null // vitesse du robot
  robotParams: string | null // JSON string of robot-specific parameters
}

export interface RobotType {
  id: number
  name: string
  manufacturer: string | null
  slug: string
}

// Relation types
export interface RecipeWithDetails extends Recipe {
  ingredients: Ingredient[]
  steps: Step[]
  robotTypes: RobotType[]
}

// For portion adjustment calculations
export interface AdjustedIngredient extends Ingredient {
  adjustedQuantity: number
  originalQuantity: number
  originalServings: number
  newServings: number
}
