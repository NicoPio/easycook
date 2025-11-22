import { db } from '../utils/db'
import { recipes, ingredients, steps, robotTypes, recipeRobotTypes } from './schema'
import { eq } from 'drizzle-orm'

async function seedRecipe() {
  console.log('🍳 Adding sample recipe...')

  // Get robot types
  const thermomix = await db.select().from(robotTypes).where(eq(robotTypes.slug, 'thermomix')).get()
  const cookeo = await db.select().from(robotTypes).where(eq(robotTypes.slug, 'cookeo')).get()

  if (!thermomix || !cookeo) {
    console.error('Robot types not found. Please run db:seed first')
    process.exit(1)
  }

  // Create recipe
  const now = new Date()
  const recipe = await db
    .insert(recipes)
    .values({
      title: 'Soupe de tomates',
      slug: 'soupe-de-tomates',
      descriptionShort: 'Une délicieuse soupe de tomates maison',
      descriptionFull:
        'Cette soupe de tomates crémeuse est parfaite pour un repas réconfortant. Simple et rapide à préparer avec votre robot cuisinier.',
      prepTime: 10,
      cookTime: 20,
      difficulty: 'facile',
      servings: 4,
      imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
      status: 'published',
      createdAt: now,
      updatedAt: now
    })
    .returning()

  console.log(`✓ Created recipe: ${recipe[0].title}`)

  // Add ingredients
  const ingredientsList = [
    { name: 'Tomates', quantity: 800, unit: 'g', order: 1, isOptional: false },
    { name: 'Oignon', quantity: 1, unit: 'pièce', order: 2, isOptional: false },
    { name: 'Ail', quantity: 2, unit: 'pièce', order: 3, isOptional: false },
    { name: 'Bouillon de légumes', quantity: 500, unit: 'ml', order: 4, isOptional: false },
    { name: 'Crème fraîche', quantity: 100, unit: 'ml', order: 5, isOptional: true },
    { name: 'Sel', quantity: 1, unit: 'c.à.c', order: 6, isOptional: false },
    { name: 'Poivre', quantity: 0.5, unit: 'c.à.c', order: 7, isOptional: false },
    { name: 'Basilic frais', quantity: 10, unit: 'g', order: 8, isOptional: true }
  ]

  for (const ing of ingredientsList) {
    await db.insert(ingredients).values({
      recipeId: recipe[0].id,
      ...ing
    })
  }
  console.log(`✓ Added ${ingredientsList.length} ingredients`)

  // Add steps
  const stepsList = [
    {
      stepNumber: 1,
      description: "Épluchez et émincez l'oignon et l'ail. Placez-les dans le bol de votre robot.",
      duration: 2,
      speed: '5',
      temperature: null
    },
    {
      stepNumber: 2,
      description: 'Ajoutez les tomates coupées en quartiers et mixez pendant 30 secondes.',
      duration: 1,
      speed: '7',
      temperature: null
    },
    {
      stepNumber: 3,
      description: 'Ajoutez le bouillon, le sel et le poivre. Faites cuire pendant 20 minutes.',
      duration: 20,
      speed: '1',
      temperature: 100
    },
    {
      stepNumber: 4,
      description:
        'Ajoutez la crème fraîche (optionnel) et mixez 30 secondes pour obtenir une texture crémeuse.',
      duration: 1,
      speed: '8',
      temperature: null
    },
    {
      stepNumber: 5,
      description: 'Servez chaud avec des feuilles de basilic frais et du pain grillé.',
      duration: null,
      speed: null,
      temperature: null
    }
  ]

  for (const step of stepsList) {
    await db.insert(steps).values({
      recipeId: recipe[0].id,
      ...step
    })
  }
  console.log(`✓ Added ${stepsList.length} steps`)

  // Link recipe to robot types
  await db.insert(recipeRobotTypes).values([
    { recipeId: recipe[0].id, robotTypeId: thermomix.id },
    { recipeId: recipe[0].id, robotTypeId: cookeo.id }
  ])
  console.log(`✓ Linked recipe to Thermomix and Cookeo`)

  console.log('✅ Sample recipe added successfully!')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRecipe()
    .then(() => {
      console.log('Recipe seed completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Recipe seed failed:', error)
      process.exit(1)
    })
}

export { seedRecipe }
