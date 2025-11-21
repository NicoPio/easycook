/**
 * Robot-specific types and metadata
 */

import type { RobotType } from './recipe'

// ─────────────────────────────────────────────────────────────
// Robot Metadata
// ─────────────────────────────────────────────────────────────

/**
 * Extended robot information with capabilities
 */
export interface RobotMetadata extends RobotType {
  capabilities: RobotCapabilities
  speedLevels: string[]
  temperatureRange: TemperatureRange
  icon?: string
}

export interface RobotCapabilities {
  hasTemperature: boolean
  hasSpeed: boolean
  hasTimer: boolean
  maxCapacityLiters: number
}

export interface TemperatureRange {
  min: number // °C
  max: number // °C
}

// ─────────────────────────────────────────────────────────────
// Robot Presets (for known models)
// ─────────────────────────────────────────────────────────────

export const ROBOT_PRESETS: Record<string, Partial<RobotMetadata>> = {
  thermomix: {
    slug: 'thermomix',
    name: 'Thermomix',
    manufacturer: 'Vorwerk',
    capabilities: {
      hasTemperature: true,
      hasSpeed: true,
      hasTimer: true,
      maxCapacityLiters: 2.2,
    },
    speedLevels: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'turbo',
      'sens inverse',
    ],
    temperatureRange: {
      min: 37,
      max: 120,
    },
  },
  cookeo: {
    slug: 'cookeo',
    name: 'Cookeo',
    manufacturer: 'Moulinex',
    capabilities: {
      hasTemperature: true,
      hasSpeed: false,
      hasTimer: true,
      maxCapacityLiters: 6.0,
    },
    speedLevels: [],
    temperatureRange: {
      min: 70,
      max: 160,
    },
  },
  'monsieur-cuisine': {
    slug: 'monsieur-cuisine',
    name: 'Monsieur Cuisine',
    manufacturer: 'Lidl/Silvercrest',
    capabilities: {
      hasTemperature: true,
      hasSpeed: true,
      hasTimer: true,
      maxCapacityLiters: 4.5,
    },
    speedLevels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'turbo'],
    temperatureRange: {
      min: 37,
      max: 130,
    },
  },
  manuel: {
    slug: 'manuel',
    name: 'Manuel',
    manufacturer: 'N/A',
    capabilities: {
      hasTemperature: false,
      hasSpeed: false,
      hasTimer: false,
      maxCapacityLiters: 0,
    },
    speedLevels: [],
    temperatureRange: {
      min: 0,
      max: 0,
    },
  },
  'tous-robots': {
    slug: 'tous-robots',
    name: 'Tous robots',
    manufacturer: 'N/A',
    capabilities: {
      hasTemperature: false,
      hasSpeed: false,
      hasTimer: false,
      maxCapacityLiters: 0,
    },
    speedLevels: [],
    temperatureRange: {
      min: 0,
      max: 0,
    },
  },
}

// ─────────────────────────────────────────────────────────────
// Robot Validation Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Check if temperature is valid for robot
 */
export function isValidTemperature(
  temperature: number,
  robotSlug: string
): boolean {
  const preset = ROBOT_PRESETS[robotSlug]
  if (!preset?.temperatureRange) return false

  return (
    temperature >= preset.temperatureRange.min &&
    temperature <= preset.temperatureRange.max
  )
}

/**
 * Check if speed is valid for robot
 */
export function isValidSpeed(speed: string, robotSlug: string): boolean {
  const preset = ROBOT_PRESETS[robotSlug]
  if (!preset?.speedLevels) return false

  return preset.speedLevels.includes(speed)
}

/**
 * Get robot capabilities by slug
 */
export function getRobotCapabilities(
  robotSlug: string
): RobotCapabilities | null {
  return ROBOT_PRESETS[robotSlug]?.capabilities ?? null
}
