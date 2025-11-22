import { recipeParser } from '~/server/utils/recipe-parser'

/**
 * Admin endpoint to import and parse recipe text using AI
 *
 * FR-022: Le système DOIT permettre de coller le texte brut d'une recette
 * FR-023: Le système DOIT parser automatiquement le texte
 * FR-031-033: Retry logic, error handling, progress indication
 *
 * Protected by auth middleware (requires JWT token)
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { recipeText } = body

  if (!recipeText || typeof recipeText !== 'string' || recipeText.trim().length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Le texte de la recette est requis'
    })
  }

  try {
    // Parse recipe with AI
    const result = await recipeParser.parse(recipeText)

    if (result.success && result.data) {
      return {
        status: 'success',
        data: result.data,
        attempts: result.attempts,
        message: `Recette parsée avec succès (${result.attempts} tentative${result.attempts > 1 ? 's' : ''})`
      }
    } else {
      // Parsing failed after all retries (FR-032)
      return {
        status: 'error',
        errors: result.errors || ['Échec du parsing'],
        attempts: result.attempts,
        message: 'Impossible de parser la recette automatiquement. Veuillez saisir les informations manuellement.'
      }
    }
  } catch (error) {
    console.error('Import error:', error)

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Erreur lors de l\'import de la recette'
    })
  }
})
