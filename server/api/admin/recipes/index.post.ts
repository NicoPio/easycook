import { db } from '~/server/utils/db'
import { recipes, ingredients, steps, robotTypes, recipeRobotTypes } from '~/server/database/schema'
import { generateSlug, makeSlugUnique } from '~/server/utils/slug'
import { eq, sql } from 'drizzle-orm'

/**
 * Admin endpoint to create a new recipe
 *
 * FR-026: Le système DOIT enregistrer la recette validée
 * FR-036-038: Gestion du statut draft/published
 *
 * Protected by auth middleware (requires JWT token)
 */
export default defineEventHandler(async (event) => {
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
    status = 'draft', // Default to draft
    robotTypes: robotTypeSlugs,
    ingredients: recipeIngredients,
    steps: recipeSteps
  } = body

  // Validation
  if (!title || !prepTime || !cookTime || !difficulty || !servings) {
    throw createError({
      statusCode: 400,
      message: 'Champs requis manquants: title, prepTime, cookTime, difficulty, servings'
    })
  }

  if (!recipeIngredients || recipeIngredients.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Au moins un ingrédient est requis'
    })
  }

  if (!recipeSteps || recipeSteps.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Au moins une étape est requise'
    })
  }

  try {
    // Generate base slug from title
    const baseSlug = generateSlug(title)

    // Check if slug already exists and make it unique if needed
    const existingRecipes = await db
      .select({ slug: recipes.slug })
      .from(recipes)
      .where(sql`${recipes.slug} LIKE ${baseSlug} || '%'`)

    const existingSlugs = existingRecipes.map((r) => r.slug)
    const slug = makeSlugUnique(baseSlug, existingSlugs)

    console.log(`Generated unique slug: ${slug} (base: ${baseSlug})`)

    const now = new Date()

    // Create recipe (transaction for atomicity)
    const [recipe] = await db
      .insert(recipes)
      .values({
        title,
        slug,
        descriptionShort,
        descriptionFull,
        prepTime,
        cookTime,
        difficulty,
        servings,
        imageUrl,
        status,
        createdAt: now,
        updatedAt: now
      })
      .returning()

    // Insert ingredients
    const ingredientInserts = recipeIngredients.map((ing: any, index: number) => ({
      recipeId: recipe.id,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      order: index + 1,
      isOptional: ing.isOptional || false
    }))

    await db.insert(ingredients).values(ingredientInserts)

    // Insert steps
    const stepInserts = recipeSteps.map((step: any) => ({
      recipeId: recipe.id,
      stepNumber: step.stepNumber,
      description: step.description,
      duration: step.duration,
      temperature: step.temperature,
      speed: step.speed,
      robotParams: step.robotParams
    }))

    await db.insert(steps).values(stepInserts)

    // Link to robot types
    if (robotTypeSlugs && robotTypeSlugs.length > 0) {
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
          recipeId: recipe.id,
          robotTypeId: rt.id
        }))

        await db.insert(recipeRobotTypes).values(robotTypeLinks)
      }
    }

    return {
      success: true,
      recipe: {
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        status: recipe.status
      },
      message: status === 'published' ? 'Recette créée et publiée' : 'Recette créée en brouillon'
    }
  } catch (error) {
    console.error('Error creating recipe:', error)

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Erreur lors de la création de la recette'
    })
  }
})
