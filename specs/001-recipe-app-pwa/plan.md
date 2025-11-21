# Implementation Plan: Application PWA de Recettes pour Robots Cuisiniers

**Branch**: `001-recipe-app-pwa` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-recipe-app-pwa/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Cette application PWA mobile permet aux utilisateurs de robots cuisiniers (Thermomix, Cookeo, Monsieur Cuisine) de consulter des recettes adaptées, d'ajuster automatiquement les proportions selon le nombre de personnes, et d'être guidés pas-à-pas en mode fullscreen pendant la cuisson. L'application inclut également une interface d'administration pour importer des recettes via copier-coller, avec parsing automatique par IA locale (Ollama + LLM) orchestré par n8n.

**Approche technique** : Application web progressive (PWA) construite avec Nuxt.js 4, utilisant Tailwind CSS 4 et Nuxt UI pour l'interface, avec support offline via Service Workers. Backend intégré dans Nuxt avec API endpoints. Pipeline de parsing de recettes séparé avec n8n et Ollama pour l'extraction intelligente des données.

## Technical Context

**Language/Version**: TypeScript avec Nuxt.js 4 (Vue 3 Composition API + script setup)
**Primary Dependencies**:
- Frontend: Nuxt UI (composants), Tailwind CSS 4 (styles), @vueuse/core (composables utilitaires)
- Backend: Nuxt server routes, h3 (HTTP server), Drizzle ORM ou Prisma (base de données)
- PWA: @vite-pwa/nuxt (service workers, manifest, caching)
- Parsing: n8n (orchestration workflows), Ollama (LLM local pour extraction)

**Storage**:
- Base de données: SQLite (développement/petit catalogue) ou PostgreSQL (production à grande échelle)
- Client: IndexedDB via localForage (cache offline des recettes)
- Fichiers: Système de fichiers local pour images ou CDN externe (Cloudflare R2, S3)

**Testing**:
- Vitest (tests unitaires et intégration)
- Playwright (tests E2E)
- @nuxt/test-utils (helpers de test Nuxt)

**Target Platform**:
- Mobile: iOS 15+ et Android 9+ (PWA installable)
- Desktop: Chrome, Firefox, Safari dernières versions (support secondaire)
- Mode offline obligatoire pour les recettes consultées

**Project Type**: Web application (frontend + backend intégré Nuxt)

**Performance Goals**:
- Time to Interactive (TTI) < 3 secondes sur 3G
- Lighthouse PWA score > 90
- Recalcul des proportions < 500ms
- Recherche/filtrage < 1 seconde pour 500+ recettes
- Parsing IA d'une recette < 10 secondes

**Constraints**:
- Support offline obligatoire (Service Worker)
- Mode pas-à-pas fullscreen sans mise en veille automatique (Wake Lock API)
- Interface utilisable avec mains mouillées (zones tactiles ≥ 44x44px)
- Modèle IA < 7B paramètres (Ollama avec Mistral 7B ou Llama 2 7B)
- Fonctionnement sur smartphones 2Go RAM minimum

**Scale/Scope**:
- MVP: 50-500 recettes
- Cible: jusqu'à 5000 recettes
- Utilisateurs concurrents: 100-1000 (petit à moyen trafic)
- Administration: 1-5 administrateurs pour import de recettes

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Status**: ✅ PASS

La constitution du projet est actuellement vide (template par défaut). Aucune contrainte spécifique n'est définie. Les principes de développement suivants seront appliqués par défaut :

1. **Code Quality**: TypeScript strict mode, ESLint + Prettier, conventions Nuxt
2. **Testing**: Tests pour la logique métier critique (calcul proportions, parsing IA)
3. **Accessibility**: Support WCAG 2.1 AA minimum (zones tactiles, contraste, navigation clavier)
4. **Performance**: Monitoring avec Lighthouse CI, lazy loading des images
5. **Security**: Validation des inputs côté serveur, sanitization des recettes importées, CSP headers

**Gates to verify**:
- [x] Nuxt.js 4 est stable et compatible avec les dépendances choisies
- [x] PWA est un choix approprié (pas besoin d'app native pour ce cas d'usage)
- [x] Stack technique permet d'atteindre les critères de succès définis
- [x] Architecture permet l'évolution future (favoris, authentification, sync multi-devices)

## Project Structure

### Documentation (this feature)

```text
specs/001-recipe-app-pwa/
├── plan.md              # Ce fichier (/speckit.plan command output)
├── research.md          # Phase 0 output - décisions techniques détaillées
├── data-model.md        # Phase 1 output - schéma des entités
├── quickstart.md        # Phase 1 output - guide de démarrage
├── contracts/           # Phase 1 output - contrats API
│   ├── recipes-api.yaml       # API recettes utilisateur
│   └── admin-import-api.yaml  # API import admin
└── tasks.md             # Phase 2 output (/speckit.tasks command - PAS créé par /speckit.plan)
```

### Source Code (repository root)

```text
# Application web Nuxt.js fullstack

# Configuration racine
nuxt.config.ts           # Configuration Nuxt, modules, PWA
tailwind.config.js       # Configuration Tailwind CSS 4
tsconfig.json            # Configuration TypeScript
package.json             # Dépendances npm

# Application Nuxt
app/
├── app.vue              # Composant racine
├── router.options.ts    # Configuration router Vue

# Pages (routes automatiques)
pages/
├── index.vue            # Listing des recettes (/)
├── recettes/
│   ├── [id].vue         # Détail d'une recette (/recettes/:id)
│   └── [id]/
│       └── pas-a-pas.vue # Mode pas-à-pas fullscreen (/recettes/:id/pas-a-pas)
└── admin/
    ├── index.vue        # Dashboard admin
    └── import.vue       # Interface d'import de recettes

# Composants Vue
components/
├── recipe/
│   ├── RecipeCard.vue         # Carte de recette (listing)
│   ├── RecipeDetail.vue       # Vue détaillée
│   ├── IngredientsList.vue    # Liste d'ingrédients avec proportions
│   ├── PortionAdjuster.vue    # Contrôle du nombre de personnes
│   └── StepByStepView.vue     # Vue pas-à-pas
├── filters/
│   ├── RobotFilter.vue        # Filtre par type de robot
│   ├── TimeFilter.vue         # Filtre par temps
│   └── SearchBar.vue          # Barre de recherche
└── ui/
    └── [Nuxt UI components auto-importés]

# Composables (logique réutilisable)
composables/
├── useRecipes.ts        # Gestion du catalogue de recettes
├── useRecipeDetail.ts   # Logique d'une recette (ajustement portions)
├── useStepByStep.ts     # Mode pas-à-pas (navigation, Wake Lock)
├── useOfflineCache.ts   # Gestion du cache offline (IndexedDB)
├── useFilters.ts        # Logique de recherche/filtres
└── useWakeLock.ts       # API Wake Lock pour éviter mise en veille

# Server API (backend Nuxt)
server/
├── api/
│   ├── recipes/
│   │   ├── index.get.ts      # GET /api/recipes (liste)
│   │   ├── [id].get.ts       # GET /api/recipes/:id (détail)
│   │   └── search.post.ts    # POST /api/recipes/search (recherche/filtres)
│   └── admin/
│       ├── import.post.ts    # POST /api/admin/import (import recette)
│       ├── recipes.post.ts   # POST /api/admin/recipes (créer recette)
│       ├── recipes/[id].put.ts    # PUT /api/admin/recipes/:id (modifier)
│       └── recipes/[id].delete.ts # DELETE /api/admin/recipes/:id
├── middleware/
│   └── auth.ts          # Middleware d'authentification admin
└── utils/
    └── db.ts            # Connection base de données (Drizzle/Prisma client)

# Schéma de base de données
server/database/
├── schema.ts            # Schéma Drizzle ou Prisma
└── migrations/          # Migrations de la base

# Assets
public/
├── favicon.ico
├── robots.txt
└── images/
    └── placeholders/    # Images par défaut

assets/
└── css/
    └── main.css         # Styles Tailwind + personnalisations

# Types TypeScript partagés
types/
├── recipe.ts            # Types Recette, Ingrédient, Étape
├── robot.ts             # Types Robot cuisinier
└── api.ts               # Types des réponses API

# Tests
tests/
├── unit/
│   ├── composables/     # Tests des composables
│   └── utils/           # Tests des utilitaires
├── integration/
│   └── api/             # Tests des endpoints API
└── e2e/
    ├── recipes.spec.ts       # Test parcours utilisateur recettes
    └── step-by-step.spec.ts  # Test mode pas-à-pas

# Configuration PWA
pwa-assets.config.ts     # Génération des icônes PWA

# Workflow n8n (externe ou dans /workflows)
workflows/
└── recipe-parser/
    ├── n8n-workflow.json     # Workflow n8n d'import
    └── prompts/
        └── recipe-extraction.txt # Prompt pour LLM Ollama
```

**Structure Decision**: Application web fullstack avec Nuxt.js. Le frontend et le backend sont dans le même projet Nuxt (pattern server routes). Le workflow de parsing n8n est soit déployé séparément, soit inclus dans `/workflows` pour versioning. Cette approche permet :
- SSR pour le SEO et performances initiales
- API endpoints backend intégrés (pas de CORS)
- PWA native avec @vite-pwa/nuxt
- Déploiement simplifié (un seul build)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Aucune violation identifiée. La constitution est actuellement vide.

---

## Phase 0: Research & Technical Decisions

_Status: Pending completion_

Les décisions techniques suivantes doivent être documentées dans `research.md` :

### Research Tasks

1. **Nuxt.js 4 Stability & Setup**
   - Confirmer version stable de Nuxt 4 disponible
   - Vérifier compatibilité avec @vite-pwa/nuxt
   - Patterns recommandés pour PWA avec Nuxt 4

2. **Database Choice: SQLite vs PostgreSQL**
   - SQLite: pros (simple, fichier local, pas de serveur), cons (concurrent writes limités)
   - PostgreSQL: pros (robuste, scalable), cons (infrastructure plus lourde)
   - Recommandation pour MVP (SQLite) et migration path

3. **ORM Choice: Drizzle vs Prisma**
   - Drizzle: TypeScript-first, léger, migrations SQL
   - Prisma: mature, génération types auto, outils visuels
   - Critères: performance, DX, migration facilité

4. **Offline Strategy with Service Workers**
   - Cache-first vs Network-first pour les recettes
   - Stratégie pour les images (cache avec fallback)
   - Gestion de la synchronisation lors du retour online

5. **Wake Lock API Implementation**
   - Support navigateurs (iOS Safari limitations)
   - Fallback si Wake Lock non disponible
   - Meilleure pratique pour durée de vie du lock

6. **n8n + Ollama Integration**
   - Architecture: n8n appelle Ollama en HTTP
   - Choix du modèle LLM (Mistral 7B Instruct vs Llama 2 7B Chat)
   - Prompt engineering pour extraction structurée (JSON output)
   - Gestion des erreurs de parsing et feedback utilisateur

7. **Image Storage Strategy**
   - Local filesystem vs CDN externe
   - Optimisation et compression (Sharp, Nuxt Image)
   - Support des formats modernes (WebP, AVIF)

8. **Admin Authentication**
   - Pattern simple pour MVP (basic auth, JWT)
   - Nuxt Auth utils ou custom middleware
   - Pas de gestion utilisateurs finaux dans MVP

**Output**: `research.md` avec toutes les décisions prises et leurs rationales

---

## Phase 1: Data Model & Contracts

_Status: Pending Phase 0 completion_

### 1.1 Data Model (`data-model.md`)

Extraire les entités de la spec et définir le schéma :

**Entities**:
- Recipe (Recette)
- Ingredient (Ingrédient)
- Step (Étape)
- RobotType (Type de robot)

**Relationships**:
- Recipe hasMany Ingredients
- Recipe hasMany Steps
- Recipe belongsTo RobotType (ou many-to-many si recette compatible plusieurs robots)
- Step hasMany Ingredients (ingrédients utilisés dans cette étape)

**Validation Rules**:
- Temps de préparation/cuisson: entiers positifs
- Nombre de personnes: 1-20
- Quantités d'ingrédients: nombres positifs ou fractions
- Unités: enum défini (g, ml, c.à.s, c.à.c, pincée, pièce, etc.)

**State Transitions**:
- Recipe: draft → validated → published
- Admin peut edit/delete à tout moment

### 1.2 API Contracts (`contracts/`)

Générer les contrats OpenAPI pour :

**User API** (`recipes-api.yaml`):
- `GET /api/recipes` - Liste paginée avec filtres
- `GET /api/recipes/:id` - Détail d'une recette
- `POST /api/recipes/search` - Recherche avec filtres multiples

**Admin API** (`admin-import-api.yaml`):
- `POST /api/admin/import` - Import texte brut → parsing IA → preview
- `POST /api/admin/recipes` - Créer recette validée
- `PUT /api/admin/recipes/:id` - Modifier recette
- `DELETE /api/admin/recipes/:id` - Supprimer recette
- `GET /api/admin/recipes` - Liste admin avec statuts

### 1.3 Quickstart Guide (`quickstart.md`)

Guide pour démarrer le projet :

1. Prérequis (Node.js 18+, pnpm)
2. Installation des dépendances
3. Configuration base de données
4. Configuration Ollama local (téléchargement modèle)
5. Configuration n8n (import workflow)
6. Lancement dev server
7. Accès à l'application (URLs)
8. Import de la première recette de test

### 1.4 Agent Context Update

Exécuter `.specify/scripts/bash/update-agent-context.sh claude` pour ajouter :
- Nuxt.js 4 (Vue 3 Composition API)
- Tailwind CSS 4
- Nuxt UI
- TypeScript strict
- Vitest + Playwright
- PWA patterns
- n8n + Ollama integration

---

## Phase 2: Task Breakdown

_Status: Not started (handled by `/speckit.tasks` command)_

Le découpage en tâches sera généré par la commande `/speckit.tasks` après validation du plan.

**Groupes de tâches attendus**:
1. Setup projet Nuxt + configuration PWA
2. Modèle de données + migrations
3. API backend (recettes + admin)
4. Composants UI (listing, détail, pas-à-pas)
5. Composables (offline, wake lock, filtres)
6. Workflow n8n + prompts Ollama
7. Tests (unit, integration, E2E)
8. Optimisations PWA (manifest, service workers, icônes)
9. Documentation utilisateur

---

## Success Criteria Mapping

Traçabilité entre les critères de succès de la spec et le plan d'implémentation :

| Critère | Implémentation |
|---------|----------------|
| SC-001: Consultation < 10s | SSR + lazy loading images + API optimisée |
| SC-002: Ajustement < 500ms | Calcul réactif côté client (computed Vue) |
| SC-003: Zones tactiles 44x44px | Tailwind utilities + Nuxt UI buttons (accessibilité) |
| SC-004: Offline 10 dernières | Service Worker + IndexedDB cache (composable useOfflineCache) |
| SC-005: Installation < 3s | PWA optimisée, bundle split, code splitting |
| SC-006: 90% parsing réussi | Prompt engineering Ollama + validation + corrections admin |
| SC-007: Réduction 80% temps import | Parsing automatique vs saisie manuelle complète |
| SC-008: Recherche < 1s (500+ recettes) | Index base de données + recherche full-text |
| SC-009: Écran allumé (Wake Lock) | Wake Lock API + fallback message si non supporté |
| SC-010: 95% complètent sans retour | UX pas-à-pas optimisée (contrôles clairs, progression visible) |

---

## Risks & Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Nuxt 4 instable/breaking changes | Bloquant | Vérifier stabilité en Phase 0, utiliser Nuxt 3 si nécessaire |
| Wake Lock non supporté iOS Safari | Moyen | Fallback : message utilisateur + réglages manuels |
| Parsing IA imprécis (<90%) | Moyen | Interface correction admin robuste + prompt tuning |
| Ollama trop lent (>10s) | Moyen | Optimiser prompt, utiliser modèle plus petit, feedback utilisateur |
| Offline sync conflits | Faible | MVP sans sync multi-devices, read-only offline |
| Performance mobile 2Go RAM | Moyen | Tests sur vraies devices, optimisation bundle, lazy loading |

---

## Next Steps

1. ✅ Valider ce plan avec les parties prenantes
2. ⏳ Exécuter Phase 0: Compléter `research.md`
3. ⏳ Exécuter Phase 1: Générer `data-model.md`, `contracts/`, `quickstart.md`
4. ⏳ Mettre à jour agent context (`.specify/scripts/bash/update-agent-context.sh`)
5. ⏳ Exécuter `/speckit.tasks` pour générer le découpage en tâches
6. ⏳ Commencer l'implémentation

**Status**: 📋 Plan ready for review
