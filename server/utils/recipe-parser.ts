import { readFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'
import { ollama } from './ollama'

/**
 * Recipe parser service using Ollama AI
 *
 * FR-023: Le système DOIT parser automatiquement le texte importé
 * FR-024: Le système DOIT utiliser un modèle d'IA pour structurer le texte
 * FR-031-033: Retry logic, error handling, progress indication
 */

// Validation schema for parsed recipe
const IngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.enum(['g', 'ml', 'pièce', 'c.à.s', 'c.à.c', 'pincée', 'L', 'kg']),
  isOptional: z.boolean().default(false)
})

const StepSchema = z.object({
  stepNumber: z.number().int().positive(),
  description: z.string().min(1),
  duration: z.number().int().positive().nullable(),
  temperature: z.number().int().positive().nullable(),
  speed: z.string().nullable()
})

const ParsedRecipeSchema = z.object({
  title: z.string().min(1),
  descriptionShort: z.string().max(200).nullable(),
  descriptionFull: z.string().nullable(),
  prepTime: z.number().int().positive(),
  cookTime: z.number().int().positive(),
  difficulty: z.enum(['facile', 'moyen', 'difficile']),
  servings: z.number().int().positive(),
  robotTypes: z.array(z.string()).min(1),
  ingredients: z.array(IngredientSchema).min(1),
  steps: z.array(StepSchema).min(1)
})

export type ParsedRecipe = z.infer<typeof ParsedRecipeSchema>

export interface ParsingResult {
  success: boolean
  data?: ParsedRecipe
  errors?: string[]
  attempts: number
}

export class RecipeParser {
  private promptTemplate: string | null = null

  /**
   * Load the parsing prompt template
   */
  private async loadPromptTemplate(): Promise<string> {
    if (this.promptTemplate) {
      return this.promptTemplate
    }

    try {
      const promptPath = join(process.cwd(), 'workflows/recipe-parser/prompts/recipe-extraction.txt')
      this.promptTemplate = await readFile(promptPath, 'utf-8')
      return this.promptTemplate
    } catch (error) {
      throw createError({
        statusCode: 500,
        message: 'Failed to load recipe parsing prompt template'
      })
    }
  }

  /**
   * Extract JSON from AI response
   * Handles cases where AI adds explanation text before/after JSON
   */
  private extractJSON(text: string): string {
    // Try to find JSON object in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return jsonMatch[0]
    }

    // If no match, assume entire response is JSON
    return text.trim()
  }

  /**
   * Parse recipe text using Ollama AI
   * Implements retry logic (FR-031) with progress callback
   */
  async parse(
    recipeText: string,
    onProgress?: (attempt: number, maxAttempts: number) => void
  ): Promise<ParsingResult> {
    const maxAttempts = 3
    const errors: string[] = []

    // Check if Ollama is available
    const isAvailable = await ollama.isAvailable()
    if (!isAvailable) {
      return {
        success: false,
        errors: ['Service d\'IA non disponible. Veuillez vérifier qu\'Ollama est démarré.'],
        attempts: 0
      }
    }

    // Load prompt template
    const promptTemplate = await this.loadPromptTemplate()
    const prompt = promptTemplate.replace('{{RECIPE_TEXT}}', recipeText)

    // Try parsing with retries
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Notify progress
        if (onProgress) {
          onProgress(attempt, maxAttempts)
        }

        // Generate with Ollama
        const response = await ollama.generate(prompt, { temperature: 0.1 })

        // Extract and parse JSON
        const jsonText = this.extractJSON(response)
        const parsedData = JSON.parse(jsonText)

        // Validate with Zod schema
        const validatedData = ParsedRecipeSchema.parse(parsedData)

        return {
          success: true,
          data: validatedData,
          attempts: attempt
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Tentative ${attempt}/${maxAttempts}: ${errorMessage}`)

        console.error(`Recipe parsing failed (attempt ${attempt}/${maxAttempts}):`, error)

        // Continue to next attempt
        if (attempt < maxAttempts) {
          // Wait before retry (1s, 2s)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
        }
      }
    }

    // All attempts failed (FR-032)
    return {
      success: false,
      errors,
      attempts: maxAttempts
    }
  }

  /**
   * Validate manual recipe data
   * Used when admin manually enters/corrects recipe data
   */
  validateRecipe(data: unknown): { valid: boolean; errors?: string[]; data?: ParsedRecipe } {
    try {
      const validatedData = ParsedRecipeSchema.parse(data)
      return {
        valid: true,
        data: validatedData
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }
      }

      return {
        valid: false,
        errors: ['Invalid recipe data format']
      }
    }
  }
}

// Export singleton instance
export const recipeParser = new RecipeParser()
