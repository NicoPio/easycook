import { db } from '../../utils/db'
import { recipes, recipeRobotTypes, robotTypes } from '../../database/schema'
import { eq, and, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20
  const robotType = query.robotType as string | undefined
  const difficulty = query.difficulty as string | undefined

  // Build where conditions
  const conditions = [eq(recipes.status, 'published')]

  if (difficulty) {
    conditions.push(eq(recipes.difficulty, difficulty as any))
  }

  // Base query
  let recipesQuery = db
    .select({
      id: recipes.id,
      title: recipes.title,
      slug: recipes.slug,
      descriptionShort: recipes.descriptionShort,
      prepTime: recipes.prepTime,
      cookTime: recipes.cookTime,
      difficulty: recipes.difficulty,
      servings: recipes.servings,
      imageUrl: recipes.imageUrl,
      createdAt: recipes.createdAt
    })
    .from(recipes)
    .where(and(...conditions))
    .limit(limit)
    .offset((page - 1) * limit)

  // If filtering by robot type, join with recipe_robot_types
  if (robotType) {
    recipesQuery = db
      .select({
        id: recipes.id,
        title: recipes.title,
        slug: recipes.slug,
        descriptionShort: recipes.descriptionShort,
        prepTime: recipes.prepTime,
        cookTime: recipes.cookTime,
        difficulty: recipes.difficulty,
        servings: recipes.servings,
        imageUrl: recipes.imageUrl,
        createdAt: recipes.createdAt
      })
      .from(recipes)
      .innerJoin(recipeRobotTypes, eq(recipes.id, recipeRobotTypes.recipeId))
      .innerJoin(robotTypes, eq(recipeRobotTypes.robotTypeId, robotTypes.id))
      .where(
        and(...conditions, eq(robotTypes.slug, robotType))
      )
      .limit(limit)
      .offset((page - 1) * limit) as any
  }

  const result = await recipesQuery

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(recipes)
    .where(and(...conditions))

  const total = totalResult[0]?.count || 0

  return {
    recipes: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
