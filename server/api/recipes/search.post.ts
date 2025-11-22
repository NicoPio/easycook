import { db } from '~/server/utils/db'
import { recipes, recipeRobotTypes, robotTypes } from '~/server/database/schema'
import { eq, like, lte, and, or, sql } from 'drizzle-orm'
import type { RecipeListResponse } from '~/types/api'

/**
 * Search and filter recipes endpoint
 *
 * FR-016: Le système DOIT permettre de rechercher des recettes par mot-clé
 * FR-013: Le système DOIT permettre de filtrer par type de robot cuisinier
 * FR-014: Le système DOIT permettre de filtrer par temps de préparation
 * FR-015: Le système DOIT permettre de filtrer par difficulté
 * SC-008: Les filtres retournent des résultats en moins de 1 seconde même avec 500+ recettes
 */
export default defineEventHandler(async (event): Promise<RecipeListResponse> => {
  const body = await readBody(event)

  const {
    query = '',
    robotType = '',
    difficulty = '',
    maxTotalTime = null,
    page = 1,
    limit = 20
  } = body

  try {
    // Build WHERE conditions
    const conditions: any[] = [
      eq(recipes.status, 'published') // Only published recipes
    ]

    // Text search: search in title and description
    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`
      conditions.push(
        or(
          like(recipes.title, searchTerm),
          like(recipes.descriptionShort, searchTerm),
          like(recipes.descriptionFull, searchTerm)
        )
      )
    }

    // Difficulty filter
    if (difficulty && ['facile', 'moyen', 'difficile'].includes(difficulty)) {
      conditions.push(eq(recipes.difficulty, difficulty))
    }

    // Total time filter (prep_time + cook_time)
    if (maxTotalTime && typeof maxTotalTime === 'number' && maxTotalTime > 0) {
      conditions.push(
        sql`${recipes.prepTime} + ${recipes.cookTime} <= ${maxTotalTime}`
      )
    }

    // Build base query
    let query_builder = db
      .select({
        id: recipes.id,
        title: recipes.title,
        slug: recipes.slug,
        descriptionShort: recipes.descriptionShort,
        prepTime: recipes.prepTime,
        cookTime: recipes.cookTime,
        totalTime: sql<number>`${recipes.prepTime} + ${recipes.cookTime}`,
        difficulty: recipes.difficulty,
        servings: recipes.servings,
        imageUrl: recipes.imageUrl,
        createdAt: recipes.createdAt
      })
      .from(recipes)

    // If filtering by robot type, join with robot types
    if (robotType && robotType.trim()) {
      query_builder = query_builder
        .innerJoin(recipeRobotTypes, eq(recipes.id, recipeRobotTypes.recipeId))
        .innerJoin(robotTypes, eq(recipeRobotTypes.robotTypeId, robotTypes.id))

      conditions.push(eq(robotTypes.slug, robotType.trim()))
    }

    // Apply all conditions
    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0]
    query_builder = query_builder.where(whereClause)

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(DISTINCT ${recipes.id})` })
      .from(recipes)

    if (robotType && robotType.trim()) {
      countQuery
        .innerJoin(recipeRobotTypes, eq(recipes.id, recipeRobotTypes.recipeId))
        .innerJoin(robotTypes, eq(recipeRobotTypes.robotTypeId, robotTypes.id))
    }

    countQuery.where(whereClause)

    const [{ count: total }] = await countQuery

    // Apply pagination
    const offset = (page - 1) * limit
    const results = await query_builder
      .limit(limit)
      .offset(offset)
      .groupBy(recipes.id) // Group to avoid duplicates from joins
      .orderBy(recipes.createdAt) // Most recent first

    return {
      recipes: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Search error:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la recherche de recettes'
    })
  }
})
