import { db } from '~/server/utils/db'
import { recipes } from '~/server/database/schema'
import { desc, sql } from 'drizzle-orm'

/**
 * Admin endpoint to list ALL recipes (including drafts)
 *
 * FR-063: L'interface d'administration DOIT lister toutes les recettes y compris les brouillons
 *
 * Protected by auth middleware (requires JWT token)
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20
  const offset = (page - 1) * limit

  try {
    // Get all recipes (including drafts) - no status filter
    const allRecipes = await db
      .select({
        id: recipes.id,
        title: recipes.title,
        slug: recipes.slug,
        status: recipes.status,
        difficulty: recipes.difficulty,
        servings: recipes.servings,
        prepTime: recipes.prepTime,
        cookTime: recipes.cookTime,
        createdAt: recipes.createdAt,
        updatedAt: recipes.updatedAt
      })
      .from(recipes)
      .orderBy(desc(recipes.updatedAt)) // Most recently updated first
      .limit(limit)
      .offset(offset)

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(recipes)

    return {
      recipes: allRecipes,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching admin recipes:', error)

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des recettes'
    })
  }
})
