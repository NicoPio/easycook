import { db } from '../../utils/db'
import { recipes, ingredients, steps, recipeRobotTypes, robotTypes } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || isNaN(Number(id))) {
    throw createError({
      statusCode: 400,
      message: 'Invalid recipe ID'
    })
  }

  // Fetch recipe
  const recipe = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, Number(id)))
    .limit(1)

  if (!recipe.length) {
    throw createError({
      statusCode: 404,
      message: 'Recipe not found'
    })
  }

  // Check if published (for public API)
  if (recipe[0].status !== 'published') {
    throw createError({
      statusCode: 404,
      message: 'Recipe not found'
    })
  }

  // Fetch ingredients
  const recipeIngredients = await db
    .select()
    .from(ingredients)
    .where(eq(ingredients.recipeId, Number(id)))
    .orderBy(ingredients.order)

  // Fetch steps
  const recipeSteps = await db
    .select()
    .from(steps)
    .where(eq(steps.recipeId, Number(id)))
    .orderBy(steps.stepNumber)

  // Fetch robot types
  const recipeRobots = await db
    .select({
      id: robotTypes.id,
      name: robotTypes.name,
      manufacturer: robotTypes.manufacturer,
      slug: robotTypes.slug
    })
    .from(recipeRobotTypes)
    .innerJoin(robotTypes, eq(recipeRobotTypes.robotTypeId, robotTypes.id))
    .where(eq(recipeRobotTypes.recipeId, Number(id)))

  // Calculate total time
  const totalTime = recipe[0].prepTime + recipe[0].cookTime

  return {
    recipe: {
      ...recipe[0],
      totalTime,
      ingredients: recipeIngredients,
      steps: recipeSteps,
      robotTypes: recipeRobots
    }
  }
})
