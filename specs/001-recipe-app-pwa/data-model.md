# Data Model: Application PWA de Recettes

**Branch**: `001-recipe-app-pwa` | **Date**: 2025-11-21
**Database**: SQLite (via Drizzle ORM)

---

## Entity Relationship Diagram

```
┌─────────────────┐
│   RobotType     │
│─────────────────│
│ id (PK)         │
│ name            │
│ manufacturer    │
│ slug            │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────────┐          ┌──────────────────┐
│       Recipe            │          │   Ingredient     │
│─────────────────────────│          │──────────────────│
│ id (PK)                 │ 1        │ id (PK)          │
│ title                   │───────┐  │ recipeId (FK)    │
│ slug                    │       └─▶│ name             │
│ description             │     N    │ quantity         │
│ prepTime                │          │ unit             │
│ cookTime                │          │ order            │
│ difficulty              │          │ optional         │
│ servings                │          └──────────────────┘
│ robotTypeId (FK)        │
│ imageUrl                │          ┌──────────────────┐
│ status                  │          │      Step        │
│ createdAt               │ 1        │──────────────────│
│ updatedAt               │───────┐  │ id (PK)          │
└─────────────────────────┘       └─▶│ recipeId (FK)    │
                               N     │ order            │
                                     │ description      │
                                     │ duration         │
                                     │ temperature      │
                                     │ speed            │
                                     │ ingredients      │ (JSON array)
                                     └──────────────────┘
```

---

## Entities

### 1. RobotType (Type de Robot Cuisinier)

**Description**: Représente un type de robot cuisinier supporté par l'application.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| `name` | TEXT | NOT NULL, UNIQUE | Nom du robot (ex: "Thermomix") |
| `manufacturer` | TEXT | NOT NULL | Fabricant (ex: "Vorwerk") |
| `slug` | TEXT | NOT NULL, UNIQUE | Slug URL (ex: "thermomix") |

**Validation Rules**:
- `name`: 2-50 caractères, lettres et chiffres uniquement
- `slug`: lowercase, alphanumeric + hyphens, auto-généré depuis `name`

**Initial Data** (seeded):
```sql
INSERT INTO robot_types (name, manufacturer, slug) VALUES
  ('Thermomix', 'Vorwerk', 'thermomix'),
  ('Cookeo', 'Moulinex', 'cookeo'),
  ('Monsieur Cuisine', 'Lidl/Silvercrest', 'monsieur-cuisine'),
  ('Manuel', 'N/A', 'manuel'),
  ('Tous robots', 'N/A', 'tous-robots');
```

---

### 2. Recipe (Recette)

**Description**: Représente une recette de cuisine complète avec toutes ses métadonnées.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| `title` | TEXT | NOT NULL | Titre de la recette |
| `slug` | TEXT | NOT NULL, UNIQUE | Slug URL (généré depuis title) |
| `description` | TEXT | NULL | Description courte (résumé) |
| `prepTime` | INTEGER | NOT NULL, DEFAULT 0 | Temps de préparation (minutes) |
| `cookTime` | INTEGER | NOT NULL, DEFAULT 0 | Temps de cuisson (minutes) |
| `difficulty` | TEXT | NOT NULL, CHECK IN ('facile', 'moyen', 'difficile') | Niveau de difficulté |
| `servings` | INTEGER | NOT NULL, DEFAULT 4, CHECK >= 1 AND <= 20 | Nombre de personnes |
| `robotTypeId` | INTEGER | NOT NULL, FOREIGN KEY → robot_types(id) | Type de robot compatible |
| `imageUrl` | TEXT | NULL | URL ou path de l'image principale |
| `status` | TEXT | NOT NULL, DEFAULT 'draft', CHECK IN ('draft', 'published') | Statut de publication |
| `createdAt` | INTEGER | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date de création (Unix timestamp) |
| `updatedAt` | INTEGER | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date de dernière modification |

**Validation Rules**:
- `title`: 5-200 caractères, requis
- `slug`: Auto-généré depuis title, unique, lowercase
- `description`: 0-500 caractères, optionnel
- `prepTime`, `cookTime`: >= 0, maximum 600 minutes (10h)
- `servings`: 1-20 personnes (contrainte métier)
- `imageUrl`: URL valide ou path relatif, optionnel
- `status`: Enum strict ('draft' | 'published')

**Indexes**:
- `idx_recipes_slug` : UNIQUE index sur `slug` (recherche par URL)
- `idx_recipes_status_robot` : Index composite sur (`status`, `robotTypeId`) (filtrage catalogue)
- `idx_recipes_created` : Index sur `createdAt` DESC (tri par date)

**State Transitions**:
```
draft ──(admin validates)──> published
  ↑                             │
  └─────(admin unpublishes)─────┘
```

---

### 3. Ingredient (Ingrédient)

**Description**: Représente un ingrédient nécessaire pour une recette, avec sa quantité pour le nombre de personnes de base.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| `recipeId` | INTEGER | NOT NULL, FOREIGN KEY → recipes(id) ON DELETE CASCADE | Recette parente |
| `name` | TEXT | NOT NULL | Nom de l'ingrédient |
| `quantity` | REAL | NOT NULL, CHECK > 0 | Quantité (peut être décimal) |
| `unit` | TEXT | NOT NULL, CHECK IN (enum) | Unité de mesure |
| `order` | INTEGER | NOT NULL, DEFAULT 0 | Ordre d'affichage (1, 2, 3...) |
| `optional` | INTEGER | NOT NULL, DEFAULT 0 | Booléen (0=requis, 1=optionnel) |

**Validation Rules**:
- `name`: 2-100 caractères, requis
- `quantity`: Nombre positif, peut être décimal (0.5, 1.5, etc.)
- `unit`: Enum strict (voir ci-dessous)
- `order`: >= 0, utilisé pour le tri d'affichage
- `optional`: Boolean (SQLite utilise INTEGER 0/1)

**Unités de Mesure** (Enum `unit`):
```typescript
export const UNITS = [
  'g',        // grammes
  'kg',       // kilogrammes
  'ml',       // millilitres
  'l',        // litres
  'c.à.s',    // cuillère à soupe
  'c.à.c',    // cuillère à café
  'pincée',   // pincée
  'pièce',    // pièce(s)
  'tranche',  // tranche(s)
  'botte',    // botte(s)
  'gousse',   // gousse(s)
] as const
```

**Indexes**:
- `idx_ingredients_recipe` : Index sur `recipeId` (jointures)
- `idx_ingredients_order` : Index composite (`recipeId`, `order`) (tri)

**Business Logic** (Calcul des proportions):
```typescript
// Frontend: Ajustement des quantités
function adjustQuantity(
  baseQuantity: number,
  baseServings: number,
  targetServings: number
): number {
  return (baseQuantity * targetServings) / baseServings
}

// Exemple: 200g pour 4 personnes → 300g pour 6 personnes
// adjustQuantity(200, 4, 6) = 300
```

---

### 4. Step (Étape)

**Description**: Représente une étape de préparation dans une recette, avec ses paramètres spécifiques au robot.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| `recipeId` | INTEGER | NOT NULL, FOREIGN KEY → recipes(id) ON DELETE CASCADE | Recette parente |
| `order` | INTEGER | NOT NULL, CHECK > 0 | Numéro de l'étape (1, 2, 3...) |
| `description` | TEXT | NOT NULL | Description textuelle de l'étape |
| `duration` | INTEGER | NULL | Durée estimée (minutes) |
| `temperature` | INTEGER | NULL | Température (°C) |
| `speed` | TEXT | NULL | Vitesse du robot (ex: "3", "turbo") |
| `ingredients` | TEXT | NULL | JSON array des ingrédients utilisés |

**Validation Rules**:
- `order`: >= 1, unique par recette (contrainte UNIQUE composite)
- `description`: 10-1000 caractères, requis
- `duration`: >= 0 si présent, NULL si pas applicable
- `temperature`: -20 à 300°C si présent (congélation à cuisson)
- `speed`: Chaîne libre (varie selon robot), NULL si pas applicable
- `ingredients`: JSON array de noms d'ingrédients (ex: `["poulet", "oignon"]`)

**Indexes**:
- `idx_steps_recipe_order` : UNIQUE composite (`recipeId`, `order`)

**JSON Field Example** (`ingredients`):
```json
["poulet", "oignon", "ail"]
```

**Business Logic**:
- Tri toujours par `order` ASC dans les requêtes
- Validation JSON côté serveur (Zod schema)

---

## Relationships

### One-to-Many Relationships

1. **RobotType → Recipe** (1:N)
   - Un robot peut être compatible avec plusieurs recettes
   - Une recette est compatible avec un seul robot (simplification MVP)
   - Foreign Key: `recipes.robotTypeId → robot_types.id`
   - Cascade: ON DELETE RESTRICT (empêcher suppression robot si recettes liées)

2. **Recipe → Ingredient** (1:N)
   - Une recette contient plusieurs ingrédients
   - Un ingrédient appartient à une seule recette
   - Foreign Key: `ingredients.recipeId → recipes.id`
   - Cascade: ON DELETE CASCADE (supprimer ingrédients si recette supprimée)

3. **Recipe → Step** (1:N)
   - Une recette contient plusieurs étapes
   - Une étape appartient à une seule recette
   - Foreign Key: `steps.recipeId → recipes.id`
   - Cascade: ON DELETE CASCADE (supprimer étapes si recette supprimée)

---

## Drizzle ORM Schema

**File**: `server/database/schema.ts`

```typescript
import { sqliteTable, integer, text, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

// ─────────────────────────────────────────────────────────────
// Table: robot_types
// ─────────────────────────────────────────────────────────────
export const robotTypes = sqliteTable('robot_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  manufacturer: text('manufacturer').notNull(),
  slug: text('slug').notNull().unique(),
})

// Relations
export const robotTypesRelations = relations(robotTypes, ({ many }) => ({
  recipes: many(recipes),
}))

// ─────────────────────────────────────────────────────────────
// Table: recipes
// ─────────────────────────────────────────────────────────────
export const recipes = sqliteTable(
  'recipes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    prepTime: integer('prep_time').notNull().default(0),
    cookTime: integer('cook_time').notNull().default(0),
    difficulty: text('difficulty', { enum: ['facile', 'moyen', 'difficile'] }).notNull(),
    servings: integer('servings').notNull().default(4),
    robotTypeId: integer('robot_type_id')
      .notNull()
      .references(() => robotTypes.id, { onDelete: 'restrict' }),
    imageUrl: text('image_url'),
    status: text('status', { enum: ['draft', 'published'] })
      .notNull()
      .default('draft'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    slugIdx: uniqueIndex('idx_recipes_slug').on(table.slug),
    statusRobotIdx: index('idx_recipes_status_robot').on(table.status, table.robotTypeId),
    createdIdx: index('idx_recipes_created').on(table.createdAt),
  })
)

// Relations
export const recipesRelations = relations(recipes, ({ one, many }) => ({
  robotType: one(robotTypes, {
    fields: [recipes.robotTypeId],
    references: [robotTypes.id],
  }),
  ingredients: many(ingredients),
  steps: many(steps),
}))

// ─────────────────────────────────────────────────────────────
// Table: ingredients
// ─────────────────────────────────────────────────────────────
export const ingredients = sqliteTable(
  'ingredients',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    quantity: real('quantity').notNull(),
    unit: text('unit', {
      enum: ['g', 'kg', 'ml', 'l', 'c.à.s', 'c.à.c', 'pincée', 'pièce', 'tranche', 'botte', 'gousse'],
    }).notNull(),
    order: integer('order').notNull().default(0),
    optional: integer('optional', { mode: 'boolean' }).notNull().default(false),
  },
  (table) => ({
    recipeIdx: index('idx_ingredients_recipe').on(table.recipeId),
    orderIdx: index('idx_ingredients_order').on(table.recipeId, table.order),
  })
)

// Relations
export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [ingredients.recipeId],
    references: [recipes.id],
  }),
}))

// ─────────────────────────────────────────────────────────────
// Table: steps
// ─────────────────────────────────────────────────────────────
export const steps = sqliteTable(
  'steps',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    description: text('description').notNull(),
    duration: integer('duration'),
    temperature: integer('temperature'),
    speed: text('speed'),
    ingredients: text('ingredients', { mode: 'json' }).$type<string[]>(),
  },
  (table) => ({
    recipeOrderIdx: uniqueIndex('idx_steps_recipe_order').on(table.recipeId, table.order),
  })
)

// Relations
export const stepsRelations = relations(steps, ({ one }) => ({
  recipe: one(recipes, {
    fields: [steps.recipeId],
    references: [recipes.id],
  }),
}))

// ─────────────────────────────────────────────────────────────
// Types inference
// ─────────────────────────────────────────────────────────────
export type RobotType = typeof robotTypes.$inferSelect
export type NewRobotType = typeof robotTypes.$inferInsert

export type Recipe = typeof recipes.$inferSelect
export type NewRecipe = typeof recipes.$inferInsert

export type Ingredient = typeof ingredients.$inferSelect
export type NewIngredient = typeof ingredients.$inferInsert

export type Step = typeof steps.$inferSelect
export type NewStep = typeof steps.$inferInsert
```

---

## Sample Queries

### 1. Get Recipe with All Relations

```typescript
// Récupérer une recette complète avec ingrédients, étapes et type de robot
const recipe = await db.query.recipes.findFirst({
  where: eq(recipes.slug, 'poulet-basquaise'),
  with: {
    robotType: true,
    ingredients: {
      orderBy: [asc(ingredients.order)],
    },
    steps: {
      orderBy: [asc(steps.order)],
    },
  },
})
```

### 2. List Published Recipes with Filters

```typescript
// Catalogue avec filtres (robot, difficulté)
const publishedRecipes = await db.query.recipes.findMany({
  where: and(
    eq(recipes.status, 'published'),
    eq(recipes.robotTypeId, thermomixId),
    eq(recipes.difficulty, 'facile')
  ),
  with: {
    robotType: true,
  },
  orderBy: [desc(recipes.createdAt)],
  limit: 20,
  offset: 0,
})
```

### 3. Full-Text Search (SQLite FTS5)

```sql
-- Nécessite création d'une table FTS5 (Phase 2)
-- Pour MVP: simple LIKE search
SELECT * FROM recipes
WHERE title LIKE '%poulet%' OR description LIKE '%poulet%'
AND status = 'published'
LIMIT 20;
```

### 4. Insert Recipe with Relations (Transaction)

```typescript
await db.transaction(async (tx) => {
  // 1. Insert recipe
  const [newRecipe] = await tx.insert(recipes).values({
    title: 'Poulet Basquaise',
    slug: 'poulet-basquaise',
    difficulty: 'moyen',
    servings: 4,
    prepTime: 15,
    cookTime: 45,
    robotTypeId: thermomixId,
    status: 'published',
  }).returning()

  // 2. Insert ingredients
  await tx.insert(ingredients).values([
    { recipeId: newRecipe.id, name: 'Poulet', quantity: 800, unit: 'g', order: 1 },
    { recipeId: newRecipe.id, name: 'Poivrons', quantity: 3, unit: 'pièce', order: 2 },
    // ...
  ])

  // 3. Insert steps
  await tx.insert(steps).values([
    {
      recipeId: newRecipe.id,
      order: 1,
      description: 'Couper le poulet en morceaux',
      duration: 5,
      ingredients: ['poulet'],
    },
    // ...
  ])
})
```

---

## Migration Strategy

### Initial Migration (0001_create_tables.sql)

```sql
-- Generated by drizzle-kit

CREATE TABLE `robot_types` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` TEXT NOT NULL UNIQUE,
  `manufacturer` TEXT NOT NULL,
  `slug` TEXT NOT NULL UNIQUE
);

CREATE TABLE `recipes` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` TEXT NOT NULL,
  `slug` TEXT NOT NULL UNIQUE,
  `description` TEXT,
  `prep_time` INTEGER NOT NULL DEFAULT 0,
  `cook_time` INTEGER NOT NULL DEFAULT 0,
  `difficulty` TEXT NOT NULL CHECK(difficulty IN ('facile', 'moyen', 'difficile')),
  `servings` INTEGER NOT NULL DEFAULT 4 CHECK(servings >= 1 AND servings <= 20),
  `robot_type_id` INTEGER NOT NULL,
  `image_url` TEXT,
  `status` TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
  `created_at` INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`robot_type_id`) REFERENCES `robot_types`(`id`) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX `idx_recipes_slug` ON `recipes` (`slug`);
CREATE INDEX `idx_recipes_status_robot` ON `recipes` (`status`, `robot_type_id`);
CREATE INDEX `idx_recipes_created` ON `recipes` (`created_at`);

CREATE TABLE `ingredients` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `recipe_id` INTEGER NOT NULL,
  `name` TEXT NOT NULL,
  `quantity` REAL NOT NULL CHECK(quantity > 0),
  `unit` TEXT NOT NULL CHECK(unit IN ('g', 'kg', 'ml', 'l', 'c.à.s', 'c.à.c', 'pincée', 'pièce', 'tranche', 'botte', 'gousse')),
  `order` INTEGER NOT NULL DEFAULT 0,
  `optional` INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE
);

CREATE INDEX `idx_ingredients_recipe` ON `ingredients` (`recipe_id`);
CREATE INDEX `idx_ingredients_order` ON `ingredients` (`recipe_id`, `order`);

CREATE TABLE `steps` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `recipe_id` INTEGER NOT NULL,
  `order` INTEGER NOT NULL CHECK(order > 0),
  `description` TEXT NOT NULL,
  `duration` INTEGER,
  `temperature` INTEGER,
  `speed` TEXT,
  `ingredients` TEXT, -- JSON array
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE
);

CREATE UNIQUE INDEX `idx_steps_recipe_order` ON `steps` (`recipe_id`, `order`);

-- Seed robot types
INSERT INTO `robot_types` (`name`, `manufacturer`, `slug`) VALUES
  ('Thermomix', 'Vorwerk', 'thermomix'),
  ('Cookeo', 'Moulinex', 'cookeo'),
  ('Monsieur Cuisine', 'Lidl/Silvercrest', 'monsieur-cuisine'),
  ('Manuel', 'N/A', 'manuel'),
  ('Tous robots', 'N/A', 'tous-robots');
```

### Running Migrations

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Push schema directly (dev only)
pnpm drizzle-kit push
```

---

## Data Integrity Rules

1. **Cascade Deletes**:
   - Supprimer une recette → supprime automatiquement ses ingrédients et étapes
   - Supprimer un robot type → BLOQUE si des recettes liées existent

2. **Unique Constraints**:
   - `recipes.slug` : Unique global (URLs)
   - `robot_types.slug` : Unique global
   - `(steps.recipeId, steps.order)` : Unique composite (pas deux étapes avec même numéro)

3. **Check Constraints**:
   - `recipes.difficulty` : Enum strict ('facile', 'moyen', 'difficile')
   - `recipes.servings` : 1-20 personnes
   - `ingredients.quantity` : > 0
   - `steps.order` : > 0

4. **Not Null Constraints**:
   - Tous les champs critiques : NOT NULL
   - Champs optionnels : NULL allowed (imageUrl, description, temperature, etc.)

---

## Performance Considerations

1. **Indexes** (déjà définis):
   - Recherche par slug (unique index)
   - Filtrage catalogue (composite status + robot)
   - Tri par date (created_at)
   - Jointures (foreign keys auto-indexées)

2. **Query Patterns**:
   - Toujours utiliser `with` pour eager loading (évite N+1 queries)
   - Pagination obligatoire pour listing (LIMIT + OFFSET)
   - Tri des ingrédients/étapes par `order` ASC

3. **Caching Strategy** (frontend):
   - Cache complet recette (avec relations) dans IndexedDB
   - Invalidation : jamais (offline mode, données stables)
   - Refresh : manuel via bouton "Actualiser"

---

**Next**: Phase 1.2 - API Contracts
