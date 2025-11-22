import { db } from '~/server/utils/db'
import { recipes, ingredients, steps, robotTypes, recipeRobotTypes } from '~/server/database/schema'
import { eq, sql } from 'drizzle-orm'

/**
 * Admin endpoint to update an existing recipe
 *
 * FR-040-041: Publier/dépublier une recette
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

  const body = await readBody(event)

  const {
    title,
    descriptionShort,
    descriptionFull,
    prepTime,
    cookTime,
    difficulty,
    servings,
    imageUrl,
    status,
    robotTypes: robotTypeSlugs,
    ingredients: recipeIngredients,
    steps: recipeSteps
  } = body

  try {
    // Check if recipe exists
    const existingRecipe = await db.select().from(recipes).where(eq(recipes.id, recipeId)).get()

    if (!existingRecipe) {
      throw createError({
        statusCode: 404,
        message: 'Recette non trouvée'
      })
    }

    // Update recipe
    const now = new Date()

    await db
      .update(recipes)
      .set({
        title: title || existingRecipe.title,
        descriptionShort,
        descriptionFull,
        prepTime: prepTime || existingRecipe.prepTime,
        cookTime: cookTime || existingRecipe.cookTime,
        difficulty: difficulty || existingRecipe.difficulty,
        servings: servings || existingRecipe.servings,
        imageUrl,
        status: status || existingRecipe.status,
        updatedAt: now
      })
      .where(eq(recipes.id, recipeId))

    // If ingredients are provided, replace them
    if (recipeIngredients) {
      // Delete existing ingredients
      await db.delete(ingredients).where(eq(ingredients.recipeId, recipeId))

      // Insert new ingredients
      const ingredientInserts = recipeIngredients.map((ing: any, index: number) => ({
        recipeId,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        order: index + 1,
        isOptional: ing.isOptional || false
      }))

      await db.insert(ingredients).values(ingredientInserts)
    }

    // If steps are provided, replace them
    if (recipeSteps) {
      // Delete existing steps
      await db.delete(steps).where(eq(steps.recipeId, recipeId))

      // Insert new steps
      const stepInserts = recipeSteps.map((step: any) => ({
        recipeId,
        stepNumber: step.stepNumber,
        description: step.description,
        duration: step.duration,
        temperature: step.temperature,
        speed: step.speed,
        robotParams: step.robotParams
      }))

      await db.insert(steps).values(stepInserts)
    }

    // If robot types are provided, replace them
    if (robotTypeSlugs) {
      // Delete existing links
      await db.delete(recipeRobotTypes).where(eq(recipeRobotTypes.recipeId, recipeId))

      // Insert new links
      if (robotTypeSlugs.length > 0) {
        const robotTypeRecords = await db
          .select()
          .from(robotTypes)
          .where(
            sql`${robotTypes.slug} IN (${sql.join(
              robotTypeSlugs.map((s: string) => sql`${s}`),
              sql`, `
            )})`
          )

        if (robotTypeRecords.length > 0) {
          const robotTypeLinks = robotTypeRecords.map((rt) => ({
            recipeId,
            robotTypeId: rt.id
          }))

          await db.insert(recipeRobotTypes).values(robotTypeLinks)
        }
      }
    }

    return {
      success: true,
      message: 'Recette mise à jour avec succès'
    }
  } catch (error) {
    console.error('Error updating recipe:', error)

    throw createError({
      statusCode: 500,
      message:
        error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la recette'
    })
  }
})
