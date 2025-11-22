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
  // CRITICAL: Disable ALL caching for this endpoint to prevent stale data
  setResponseHeaders(event, {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  })

  const body = await readBody(event)
  const { recipeText, requestId } = body

  // Log for debugging cache issues
  console.log(`[Import API] Request ${requestId || 'unknown'} - Recipe text length: ${recipeText?.length || 0}`)
  console.log(`[Import API] First 50 chars: ${recipeText?.substring(0, 50) || 'empty'}...`)

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
      console.log(`[Import API] ✓ Success - Parsed recipe: "${result.data.title}"`)
      return {
        status: 'success',
        data: result.data,
        attempts: result.attempts,
        requestId, // Echo requestId for client verification
        message: `Recette parsée avec succès (${result.attempts} tentative${result.attempts > 1 ? 's' : ''})`
      }
    } else {
      // Parsing failed after all retries (FR-032)
      console.log(`[Import API] ✗ Failed after ${result.attempts} attempts`)
      return {
        status: 'error',
        errors: result.errors || ['Échec du parsing'],
        attempts: result.attempts,
        requestId,
        message:
          'Impossible de parser la recette automatiquement. Veuillez saisir les informations manuellement.'
      }
    }
  } catch (error) {
    console.error('[Import API] Error:', error)

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Erreur lors de l'import de la recette"
    })
  }
})
