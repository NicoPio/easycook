// TypeScript types for Robot domain
export interface RobotType {
  id: number
  name: string
  manufacturer: string | null
  slug: string
  supportedParams: RobotParams
}

export interface RobotParams {
  hasTemperature: boolean
  hasSpeed: boolean
  hasDuration: boolean
  speedLevels?: number | string[] // numeric levels or named (e.g., "slow", "medium", "fast")
  temperatureRange?: {
    min: number
    max: number
    unit: '°C' | '°F'
  }
  customModes?: string[] // e.g., "Turbo", "Gentle", "Steam"
}

// Predefined robot types
export const ROBOT_TYPES = {
  THERMOMIX: 'thermomix',
  COOKEO: 'cookeo',
  MONSIEUR_CUISINE: 'monsieur-cuisine',
  MANUEL: 'manuel',
  TOUS: 'tous-robots'
} as const

export type RobotTypeName = (typeof ROBOT_TYPES)[keyof typeof ROBOT_TYPES]

// Many-to-many relationship
export interface RecipeRobotType {
  recipeId: number
  robotTypeId: number
}
