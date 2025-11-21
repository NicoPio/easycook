/**
 * GET /api/recipes
 * List published recipes with optional filters and pagination
 */

import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes, robotTypes } from '../../database/schema'
import type { ListRecipesResponse } from '../../../types/api'
import type { Difficulty } from '../../../types/recipe'

export default defineEventHandler(
  async (event): Promise<ListRecipesResponse> => {
    // Parse query parameters
    const query = getQuery(event)
    const robotType = query.robotType as string | undefined
    const difficulty = query.difficulty as Difficulty | undefined
    const limit = Number(query.limit) || 20
    const offset = Number(query.offset) || 0

    // Build where conditions
    const conditions = [eq(recipes.status, 'published')]

    // Filter by robot type slug
    if (robotType) {
      const robot = await db.query.robotTypes.findFirst({
        where: eq(robotTypes.slug, robotType),
      })

      if (robot) {
        conditions.push(eq(recipes.robotTypeId, robot.id))
      }
    }

    // Filter by difficulty
    if (difficulty) {
      conditions.push(eq(recipes.difficulty, difficulty))
    }

    // Fetch recipes with robot type relation
    const recipesList = await db.query.recipes.findMany({
      where: and(...conditions),
      with: {
        robotType: true,
      },
      orderBy: [desc(recipes.createdAt)],
      limit,
      offset,
    })

    // Get total count for pagination
    const totalRecipes = await db
      .select({ count: recipes.id })
      .from(recipes)
      .where(and(...conditions))

    // Transform to RecipeSummary format
    const recipeSummaries = recipesList.map((recipe) => ({
      ...recipe,
      createdAt: new Date(recipe.createdAt),
      updatedAt: new Date(recipe.updatedAt),
    }))

    return {
      recipes: recipeSummaries,
      total: totalRecipes.length,
    }
  }
)
