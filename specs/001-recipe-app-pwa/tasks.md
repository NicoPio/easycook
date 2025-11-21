---
description: 'Task list for PWA Recipe Application implementation'
---

# Tasks: Application PWA de Recettes pour Robots Cuisiniers

**Input**: Design documents from `/specs/001-recipe-app-pwa/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are not explicitly requested in the specification, therefore test tasks are not included. Focus is on implementation and manual validation per user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: Always start with `- [ ]`
- **[ID]**: Sequential task number (T001, T002, etc.)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- **File paths**: Exact paths from plan.md structure

## Path Conventions

This is a **fullstack Nuxt.js web application**. All paths are relative to repository root:
- **Pages**: `pages/`
- **Components**: `components/`
- **Composables**: `composables/`
- **Server API**: `server/api/`
- **Database**: `server/database/`
- **Types**: `types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure: nuxt.config.ts, package.json, tsconfig.json, tailwind.config.js
- [ ] T002 Initialize Nuxt 4 project with dependencies (nuxt, @nuxt/ui, tailwindcss, drizzle-orm, better-sqlite3, @vite-pwa/nuxt)
- [ ] T003 [P] Configure TypeScript strict mode in tsconfig.json
- [ ] T004 [P] Configure Tailwind CSS 4 in tailwind.config.js
- [ ] T005 [P] Configure ESLint and Prettier in .eslintrc.js and .prettierrc
- [ ] T006 Configure Nuxt UI module in nuxt.config.ts
- [ ] T007 [P] Configure PWA module (@vite-pwa/nuxt) in nuxt.config.ts with manifest and service worker settings
- [ ] T008 [P] Create .env.example with all required environment variables (DATABASE_PATH, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, JWT_SECRET, OLLAMA_BASE_URL)
- [ ] T009 [P] Create assets/css/main.css with Tailwind directives and custom styles
- [ ] T010 [P] Create app/app.vue as root component with NuxtPage
- [ ] T011 Create directory structure: pages/, components/, composables/, server/, types/, workflows/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Types

- [ ] T012 Define TypeScript types for Recipe, Ingredient, Step, RobotType in types/recipe.ts
- [ ] T013 [P] Define TypeScript types for API responses in types/api.ts
- [ ] T014 [P] Define TypeScript types for Robot in types/robot.ts
- [ ] T015 Create Drizzle schema for robot_types table in server/database/schema.ts
- [ ] T016 Create Drizzle schema for recipes table in server/database/schema.ts
- [ ] T017 Create Drizzle schema for ingredients table in server/database/schema.ts
- [ ] T018 Create Drizzle schema for steps table in server/database/schema.ts
- [ ] T019 Define Drizzle relations (robotTypesRelations, recipesRelations, etc.) in server/database/schema.ts
- [ ] T020 Create database connection utility in server/utils/db.ts (Drizzle client with better-sqlite3)
- [ ] T021 Create drizzle.config.ts for Drizzle Kit configuration
- [ ] T022 Generate initial migration with Drizzle Kit (run: pnpm drizzle-kit generate)
- [ ] T023 Create database seed script in server/database/seed.ts to populate robot_types table with initial data (Thermomix, Cookeo, Monsieur Cuisine, Manuel, Tous robots)

### Authentication & Middleware

- [ ] T024 [P] Install jose and bcrypt dependencies for JWT and password hashing
- [ ] T025 Create JWT utilities (sign, verify) in server/utils/jwt.ts
- [ ] T026 Create authentication middleware in server/middleware/auth.ts to protect /api/admin/* routes
- [ ] T027 Create POST /api/auth/login endpoint in server/api/auth/login.post.ts for admin login

### Shared Utilities

- [ ] T028 [P] Create slug generation utility function in server/utils/slug.ts
- [ ] T029 [P] Create validation schemas using Zod in server/utils/validation.ts (recipe schema, ingredient schema, step schema)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Consulter et Ajuster une Recette (Priority: P1) 🎯 MVP

**Goal**: Enable users to browse a recipe catalog, view detailed recipes with ingredients and steps, and adjust portions dynamically with automatic quantity recalculation.

**Independent Test**: Navigate to homepage, see recipe list, click on a recipe, view details with ingredients, change serving size from 4 to 6 persons, verify all ingredient quantities are recalculated proportionally.

### Backend API (User Story 1)

- [ ] T030 [P] [US1] Create GET /api/recipes endpoint in server/api/recipes/index.get.ts to list published recipes with pagination and basic filters (robotType, difficulty)
- [ ] T031 [P] [US1] Create GET /api/recipes/[id] endpoint in server/api/recipes/[id].get.ts to return full recipe details with ingredients, steps, and robotType
- [ ] T032 [US1] Add database queries in server/api/recipes/index.get.ts using Drizzle with relations (recipes + robotType)
- [ ] T033 [US1] Add database queries in server/api/recipes/[id].get.ts using Drizzle with all relations (recipe + ingredients + steps + robotType)

### Composables (User Story 1)

- [ ] T034 [P] [US1] Create useRecipes composable in composables/useRecipes.ts to fetch recipe list from API
- [ ] T035 [P] [US1] Create useRecipeDetail composable in composables/useRecipeDetail.ts to fetch recipe details and handle portion adjustment logic (calculateAdjustedQuantity function)

### Components (User Story 1)

- [ ] T036 [P] [US1] Create RecipeCard component in components/recipe/RecipeCard.vue to display recipe summary (title, image, time, difficulty, robot type)
- [ ] T037 [P] [US1] Create RecipeDetail component in components/recipe/RecipeDetail.vue to display full recipe metadata
- [ ] T038 [P] [US1] Create IngredientsList component in components/recipe/IngredientsList.vue to display ingredients with quantities (receives adjusted servings as prop)
- [ ] T039 [P] [US1] Create PortionAdjuster component in components/recipe/PortionAdjuster.vue with input/slider for servings (1-20) and real-time update

### Pages (User Story 1)

- [ ] T040 [US1] Create homepage in pages/index.vue with recipe catalog using RecipeCard components and useRecipes composable
- [ ] T041 [US1] Create recipe detail page in pages/recettes/[id].vue with RecipeDetail, IngredientsList, PortionAdjuster components and useRecipeDetail composable

**Checkpoint**: At this point, User Story 1 (MVP) should be fully functional - users can browse recipes, view details, and adjust portions

---

## Phase 4: User Story 2 - Mode Pas-à-Pas Guidé (Priority: P2)

**Goal**: Provide a fullscreen step-by-step cooking mode with large touch zones, clear navigation, progress indicator, and Wake Lock API to prevent screen sleep.

**Independent Test**: Open any recipe, click "Start step-by-step mode", enter fullscreen, navigate through all steps, verify screen stays on, exit mode successfully.

### Composables (User Story 2)

- [ ] T042 [P] [US2] Create useWakeLock composable in composables/useWakeLock.ts to manage Wake Lock API (request, release, isSupported)
- [ ] T043 [P] [US2] Create useStepByStep composable in composables/useStepByStep.ts to manage step navigation state (currentStep, next, previous, progress)

### Components (User Story 2)

- [ ] T044 [US2] Create StepByStepView component in components/recipe/StepByStepView.vue with fullscreen display, large navigation buttons (≥44x44px), step description, ingredients for step, robot parameters (temperature, speed, duration), and progress indicator

### Pages (User Story 2)

- [ ] T045 [US2] Create step-by-step page in pages/recettes/[id]/pas-a-pas.vue using StepByStepView, useStepByStep, and useWakeLock composables
- [ ] T046 [US2] Add "Start step-by-step mode" button in pages/recettes/[id].vue linking to pas-a-pas route
- [ ] T047 [US2] Handle Wake Lock fallback UI for unsupported browsers (display persistent message with instructions for iOS < 16.4)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can browse, adjust portions, AND use step-by-step cooking mode

---

## Phase 5: User Story 3 - Rechercher et Filtrer des Recettes (Priority: P3)

**Goal**: Allow users to search recipes by keyword and apply multiple filters (robot type, preparation time, difficulty) with fast results (<1s for 500+ recipes).

**Independent Test**: On homepage, use search bar to search "poulet", verify results are filtered. Apply robot filter "Thermomix", verify only Thermomix recipes shown. Apply time filter "< 30 min", verify fast recipes only. Reset filters, verify all recipes visible again.

### Backend API (User Story 3)

- [ ] T048 [US3] Create POST /api/recipes/search endpoint in server/api/recipes/search.post.ts with full-text search and advanced filters (query, robotType, difficulty, maxTotalTime) using SQL LIKE queries

### Composables (User Story 3)

- [ ] T049 [US3] Create useFilters composable in composables/useFilters.ts to manage filter state (search query, robot type, difficulty, time range) and call search API

### Components (User Story 3)

- [ ] T050 [P] [US3] Create SearchBar component in components/filters/SearchBar.vue with text input and real-time search
- [ ] T051 [P] [US3] Create RobotFilter component in components/filters/RobotFilter.vue with dropdown/chips for robot types
- [ ] T052 [P] [US3] Create TimeFilter component in components/filters/TimeFilter.vue with time range selector (< 30min, 30-60min, > 1h)

### Pages (User Story 3)

- [ ] T053 [US3] Integrate SearchBar, RobotFilter, TimeFilter components in pages/index.vue
- [ ] T054 [US3] Connect useFilters composable to RecipeCard list in pages/index.vue with reactive filtering
- [ ] T055 [US3] Add "Reset filters" button in pages/index.vue to clear all filters

**Checkpoint**: All frontend user stories (US1, US2, US3) are now complete and independently functional

---

## Phase 6: User Story 4 - Importer et Parser une Recette (Priority: P4)

**Goal**: Enable admins to import recipes by pasting raw text, automatically parse with AI (Ollama + Mistral), review parsed data, manually correct errors, and publish to catalog.

**Independent Test**: Login to admin, navigate to import page, paste recipe text, click "Parse", verify structured data preview with ingredients and steps extracted, edit any field, save recipe, verify it appears in user catalog.

### Ollama Integration

- [ ] T056 [P] [US4] Create Ollama client utility in server/utils/ollama.ts to call Ollama HTTP API (POST /api/generate) with prompt
- [ ] T057 [P] [US4] Create recipe parsing prompt template in workflows/recipe-parser/prompts/recipe-extraction.txt with JSON schema for structured extraction
- [ ] T058 [US4] Create parsing service in server/utils/recipe-parser.ts that sends text + prompt to Ollama and validates JSON response

### Backend API (User Story 4)

- [ ] T059 [US4] Create POST /api/admin/import endpoint in server/api/admin/import.post.ts that calls recipe-parser utility and returns ParsedRecipe with status (success/partial/error) and validation errors
- [ ] T060 [P] [US4] Create POST /api/admin/recipes endpoint in server/api/admin/recipes.post.ts to save validated recipe to database (transaction: insert recipe + ingredients + steps)
- [ ] T061 [P] [US4] Create PUT /api/admin/recipes/[id] endpoint in server/api/admin/recipes/[id].put.ts to update existing recipe
- [ ] T062 [P] [US4] Create DELETE /api/admin/recipes/[id] endpoint in server/api/admin/recipes/[id].delete.ts to delete recipe (cascade to ingredients and steps)
- [ ] T063 [P] [US4] Create GET /api/admin/recipes endpoint in server/api/admin/recipes/index.get.ts to list all recipes including drafts (admin view)

### Admin Pages (User Story 4)

- [ ] T064 [P] [US4] Create admin login page in pages/admin/login.vue with email and password form calling /api/auth/login
- [ ] T065 [US4] Create admin dashboard in pages/admin/index.vue with recipe list (all statuses) and navigation to import page
- [ ] T066 [US4] Create admin import page in pages/admin/import.vue with textarea for recipe text, "Parse" button, and parsed result preview
- [ ] T067 [US4] Add editable form fields in pages/admin/import.vue for manual correction of parsed data (title, ingredients, steps, etc.)
- [ ] T068 [US4] Add "Publish" button in pages/admin/import.vue to save recipe with status=published via POST /api/admin/recipes
- [ ] T069 [US4] Add error display in pages/admin/import.vue to show parsing errors with clear messages indicating problematic sections

**Checkpoint**: Full application is now complete - all 4 user stories (frontend + admin) are functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

### PWA Optimization

- [ ] T070 [P] Generate PWA icons and splash screens using pwa-assets.config.ts (run: pnpm generate:pwa-assets)
- [ ] T071 [P] Configure service worker caching strategies in nuxt.config.ts: Cache-First for /api/recipes/:id, Network-First for /api/recipes list, Cache-First for images
- [ ] T072 Create offline page in pages/offline.vue displayed when service worker cannot fetch network resources

### Offline Support

- [ ] T073 Create useOfflineCache composable in composables/useOfflineCache.ts using localForage to cache last 10 viewed recipes in IndexedDB
- [ ] T074 Integrate useOfflineCache in useRecipeDetail composable to save recipe to IndexedDB when viewed
- [ ] T075 Add offline indicator in app/app.vue using navigator.onLine event to display "Mode hors ligne" banner

### Performance & Accessibility

- [ ] T076 [P] Configure Nuxt Image module in nuxt.config.ts for automatic WebP/AVIF conversion and lazy loading
- [ ] T077 [P] Add loading states and skeletons to RecipeCard and RecipeDetail components
- [ ] T078 [P] Add ARIA labels and keyboard navigation to StepByStepView navigation buttons
- [ ] T079 [P] Ensure all interactive elements have minimum touch target size of 44x44px (audit with browser DevTools)
- [ ] T080 Configure Content Security Policy (CSP) headers in nuxt.config.ts

### Error Handling & Validation

- [ ] T081 [P] Add global error handler in app/app.vue using onErrorCaptured to display user-friendly error messages
- [ ] T082 [P] Add input validation in PortionAdjuster to prevent servings < 1 or > 20
- [ ] T083 [P] Add 404 page in pages/[...slug].vue for non-existent recipe routes

### Documentation & Scripts

- [ ] T084 [P] Create README.md with project overview, tech stack, and link to quickstart.md
- [ ] T085 [P] Create database seed script (pnpm db:seed) to execute server/database/seed.ts
- [ ] T086 [P] Create npm scripts in package.json: dev, build, preview, db:generate, db:migrate, db:seed, lint, format
- [ ] T087 [P] Test quickstart.md instructions end-to-end on clean environment (verify all steps work)

### Optional: n8n Workflow (Alternative to T056-T058)

- [ ] T088 [P] Create n8n workflow JSON in workflows/recipe-parser/n8n-workflow.json with nodes: Webhook Trigger, HTTP Request to Ollama, JSON Validation, HTTP Callback to Nuxt
- [ ] T089 Update server/api/admin/import.post.ts to call n8n webhook instead of direct Ollama if N8N_WEBHOOK_URL is configured in environment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (if team capacity allows)
  - OR sequentially in priority order: US1 → US2 → US3 → US4
- **Polish (Phase 7)**: Depends on desired user stories being complete (minimally US1 for MVP)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories ✅ MVP
- **User Story 2 (P2)**: Can start after Foundational - Depends on US1 pages/components but extends them
- **User Story 3 (P3)**: Can start after Foundational - Extends US1 catalog but independently testable
- **User Story 4 (P4)**: Can start after Foundational - Completely independent (admin-only), can develop in parallel with US1-3

### Within Each User Story

- Backend APIs before composables (composables call APIs)
- Composables before components (components use composables)
- Components before pages (pages assemble components)
- Core implementation before integration

### Parallel Opportunities

**Phase 1 Setup** (11 parallel tasks):
- T003, T004, T005, T007, T008, T009, T010 can all run in parallel

**Phase 2 Foundational**:
- Database: T012-T014 (types) can run in parallel
- Schemas: T015-T018 (tables) can run after types, in parallel
- Auth: T024-T027 (auth system) can run in parallel with database work
- Utils: T028-T029 can run in parallel

**Phase 3 US1**:
- Backend: T030, T031 can run in parallel (different endpoints)
- Composables: T034, T035 can run in parallel after backend
- Components: T036, T037, T038, T039 can all run in parallel after composables

**Phase 4 US2**:
- Composables: T042, T043 can run in parallel
- Component T044 needs composables done

**Phase 5 US3**:
- Components: T050, T051, T052 can all run in parallel after backend

**Phase 6 US4**:
- Utils: T056, T057 can run in parallel
- Endpoints: T060, T061, T062, T063 can all run in parallel after T059
- Pages: T064, T065 can run in parallel

**Phase 7 Polish**:
- Most tasks (T070-T087) can run in parallel as they touch different areas

---

## Parallel Example: User Story 1 (MVP)

```bash
# After Foundational is complete, launch these tasks together:

# Backend APIs (parallel):
Task T030: "GET /api/recipes endpoint"
Task T031: "GET /api/recipes/[id] endpoint"

# Then composables (parallel):
Task T034: "useRecipes composable"
Task T035: "useRecipeDetail composable"

# Then components (parallel):
Task T036: "RecipeCard component"
Task T037: "RecipeDetail component"
Task T038: "IngredientsList component"
Task T039: "PortionAdjuster component"

# Finally pages (sequential - need all components):
Task T040: "Homepage with catalog"
Task T041: "Recipe detail page"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Fastest path to working product:**

1. ✅ Complete Phase 1: Setup (T001-T011)
2. ✅ Complete Phase 2: Foundational (T012-T029) - CRITICAL
3. ✅ Complete Phase 3: User Story 1 (T030-T041)
4. ✅ Add essential Polish: T070-T072 (PWA), T073-T075 (offline), T084-T087 (docs/scripts)
5. **STOP and VALIDATE**: Test US1 independently
6. Deploy/demo MVP

**MVP Scope**: ~53 tasks (11 setup + 18 foundational + 12 US1 + 12 polish)

**Estimated Time**: 1-2 weeks for solo developer, 3-5 days for team of 3

### Incremental Delivery (Recommended)

**Ship value incrementally:**

1. **Sprint 1**: Setup + Foundational → Foundation ready (T001-T029)
2. **Sprint 2**: User Story 1 + PWA/Offline → MVP deployed (T030-T041, T070-T075)
3. **Sprint 3**: User Story 2 → Step-by-step mode live (T042-T047)
4. **Sprint 4**: User Story 3 → Search/filters live (T048-T055)
5. **Sprint 5**: User Story 4 → Admin import live (T056-T069)
6. **Sprint 6**: Final polish → Production ready (T076-T087)

Each sprint delivers a testable, deployable increment.

### Parallel Team Strategy

**With 3 developers after Foundational phase:**

- **Developer A**: User Story 1 (T030-T041) - MVP critical path
- **Developer B**: User Story 4 (T056-T069) - Admin independent
- **Developer C**: User Story 2 (T042-T047) - Extends US1

Once all complete:
- **All devs**: User Story 3 together (quick), then Polish

**Time saved**: ~40% compared to sequential

---

## Task Count Summary

- **Phase 1 Setup**: 11 tasks
- **Phase 2 Foundational**: 18 tasks (BLOCKING)
- **Phase 3 US1** (P1 - MVP): 12 tasks
- **Phase 4 US2** (P2): 6 tasks
- **Phase 5 US3** (P3): 8 tasks
- **Phase 6 US4** (P4): 14 tasks
- **Phase 7 Polish**: 19 tasks

**Total**: 89 tasks

**MVP Only**: 53 tasks (Phase 1 + 2 + 3 + essential Polish)

**Parallelizable**: 45+ tasks marked with [P]

---

## Notes

- All tasks follow strict format: `- [ ] [TXX] [P?] [USX?] Description with file path`
- [P] = Parallelizable (different files, no blocking dependencies)
- [USX] = User Story label for traceability
- File paths are exact, based on plan.md structure
- Each user story can be independently tested and deployed
- Tests not included (not requested in specification)
- Stop at any checkpoint to validate story independently
- Commit after each task or logical group for safe rollback
- Refer to quickstart.md for environment setup details
- Refer to research.md for technical decision rationales
- Refer to data-model.md for database schema details
- Refer to contracts/ for API endpoint specifications
