/**
 * Database seed script
 * Populates initial data (robot types)
 * Run with: pnpm db:seed
 */

import { db } from '../utils/db'
import { robotTypes } from './schema'

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Check if data already exists
    const existingRobots = await db.select().from(robotTypes)

    if (existingRobots.length > 0) {
      console.log('⚠️  Database already seeded, skipping...')
      return
    }

    // Insert robot types
    await db.insert(robotTypes).values([
      {
        name: 'Thermomix',
        manufacturer: 'Vorwerk',
        slug: 'thermomix',
      },
      {
        name: 'Cookeo',
        manufacturer: 'Moulinex',
        slug: 'cookeo',
      },
      {
        name: 'Monsieur Cuisine',
        manufacturer: 'Lidl/Silvercrest',
        slug: 'monsieur-cuisine',
      },
      {
        name: 'Manuel',
        manufacturer: 'N/A',
        slug: 'manuel',
      },
      {
        name: 'Tous robots',
        manufacturer: 'N/A',
        slug: 'tous-robots',
      },
    ])

    console.log('✅ Database seeded successfully!')
    console.log('   - 5 robot types inserted')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run seed if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log('🎉 Seed complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Failed to seed:', error)
      process.exit(1)
    })
}

export { seed }
