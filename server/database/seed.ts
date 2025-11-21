import { db } from '../utils/db'
import { robotTypes } from './schema'

async function seed() {
  console.log('🌱 Seeding database...')

  // Seed robot types
  const robotTypesData = [
    {
      name: 'Thermomix',
      manufacturer: 'Vorwerk',
      slug: 'thermomix'
    },
    {
      name: 'Cookeo',
      manufacturer: 'Moulinex',
      slug: 'cookeo'
    },
    {
      name: 'Monsieur Cuisine',
      manufacturer: 'Silvercrest',
      slug: 'monsieur-cuisine'
    },
    {
      name: 'Manuel',
      manufacturer: null,
      slug: 'manuel'
    },
    {
      name: 'Tous robots',
      manufacturer: null,
      slug: 'tous-robots'
    }
  ]

  console.log('Inserting robot types...')
  for (const robotType of robotTypesData) {
    await db.insert(robotTypes).values(robotType)
    console.log(`✓ Added robot type: ${robotType.name}`)
  }

  console.log('✅ Database seeded successfully!')
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log('Seed completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seed failed:', error)
      process.exit(1)
    })
}

export { seed }
