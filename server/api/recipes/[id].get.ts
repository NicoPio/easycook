/**
 * GET /api/recipes/[id]
 * Get full recipe details with ingredients, steps, and robot type
 */

import { eq, asc } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes } from '../../database/schema'
import type { RecipeDetailResponse } from '../../../types/api'

export default defineEventHandler(
  async (event): Promise<RecipeDetailResponse> => {
    const id = getRouterParam(event, 'id')

    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid recipe ID',
      })
    }

    // Fetch recipe with all relations
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, Number(id)),
      with: {
        robotType: true,
        ingredients: {
          orderBy: (ingredients, { asc }) => [asc(ingredients.order)],
        },
        steps: {
          orderBy: (steps, { asc }) => [asc(steps.order)],
        },
      },
    })

    if (!recipe) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Recipe not found',
      })
    }

    // Only return published recipes to public
    if (recipe.status !== 'published') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Recipe not found',
      })
    }

    // Transform dates to Date objects
    const recipeWithRelations = {
      ...recipe,
      createdAt: new Date(recipe.createdAt),
      updatedAt: new Date(recipe.updatedAt),
    }

    return {
      recipe: recipeWithRelations,
    }
  }
)
