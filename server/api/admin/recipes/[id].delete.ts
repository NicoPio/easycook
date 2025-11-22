import { db } from '~/server/utils/db'
import { recipes } from '~/server/database/schema'
import { eq } from 'drizzle-orm'

/**
 * Admin endpoint to delete a recipe
 *
 * Cascades to ingredients, steps, and robot type links (configured in schema)
 *
 * Protected by auth middleware (requires JWT token)
 */
export default defineEventHandler(async (event) => {
  const recipeId = Number(event.context.params?.id)

  if (isNaN(recipeId)) {
    throw createError({
      statusCode: 400,
      message: 'ID de recette invalide'
    })
  }

  try {
    // Check if recipe exists
    const existingRecipe = await db.select().from(recipes).where(eq(recipes.id, recipeId)).get()

    if (!existingRecipe) {
      throw createError({
        statusCode: 404,
        message: 'Recette non trouvée'
      })
    }

    // Delete recipe (CASCADE will delete ingredients, steps, and robot type links)
    await db.delete(recipes).where(eq(recipes.id, recipeId))

    return {
      success: true,
      message: 'Recette supprimée avec succès'
    }
  } catch (error) {
    console.error('Error deleting recipe:', error)

    throw createError({
      statusCode: 500,
      message:
        error instanceof Error ? error.message : 'Erreur lors de la suppression de la recette'
    })
  }
})
