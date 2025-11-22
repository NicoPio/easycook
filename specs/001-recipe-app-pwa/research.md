# Technical Research: Application PWA de Recettes

**Branch**: `001-recipe-app-pwa` | **Date**: 2025-11-21
**Purpose**: Document all technical decisions and their rationales for Phase 0

---

## 1. Nuxt.js 4 Stability & Setup

### Decision

Utiliser **Nuxt 4.x stable**.

### Rationale

- **Nuxt 4 Status** (janvier 2025): Nuxt 4 est annoncé mais pas encore officiellement stable. La v4.0.0-rc existe mais comporte potentiellement des breaking changes et bugs.
- **Nuxt 34 Maturité**: Nuxt 4 est très stable, largement adopté, avec un écosystème de modules complet.
- **Migration Path**: Nuxt 3 → 4 sera facilitée par l'équipe Nuxt avec des outils de migration automatique.
- **Risque Mitigation**: Pour un MVP en production, la stabilité prime sur les nouvelles fonctionnalités.

### Alternatives Considered

- **Nuxt 4 RC**: Écarté car trop risqué pour production, manque de documentation et de support communautaire mature.
- **SvelteKit ou Astro**: Écartés car l'expertise Vue 3 est déjà établie dans le projet (cf. CLAUDE.md).

### Implementation

```bash
# package.json
"nuxt": "^4",
"@vite-pwa/nuxt": "^0.10.0"
```

**Compatibility Verified**:

- ✅ @vite-pwa/nuxt compatible Nuxt 4.x
- ✅ Nuxt UI compatible Nuxt 4.x
- ✅ Tailwind CSS 4 beta compatible via PostCSS

---

## 2. Database Choice: SQLite vs PostgreSQL

### Decision

**SQLite** pour le MVP, avec architecture permettant migration vers PostgreSQL.

### Rationale

- **MVP Scope**: 50-500 recettes, 1-5 admins, pas de concurrence write intensive
- **Simplicité**: Pas de serveur DB séparé, fichier unique, backup simple
- **Performance**: Excellent pour read-heavy workloads (catalogue de recettes)
- **Déploiement**: Simplifié (un seul process, pas d'orchestration DB)
- **Cost**: Zéro coût d'infrastructure DB

### Alternatives Considered

- **PostgreSQL**: Overkill pour MVP, mais nécessaire si >5000 recettes ou édition collaborative
- **MySQL/MariaDB**: Pas d'avantage vs PostgreSQL pour ce cas d'usage

### Migration Path vers PostgreSQL

```typescript
// Utiliser un ORM qui supporte les deux
// Drizzle ORM : même schéma, change juste le driver
// Triggers de migration : volume > 1000 recettes OU > 10 req/sec write
```

### Constraints & Limitations (SQLite)

- Max 1 write concurrent (mode WAL atténue le problème)
- Pas de réplication native (acceptable pour MVP)
- Monitoring basique (vs pganalyze pour PostgreSQL)

### Implementation

```bash
# Utiliser SQLite avec Drizzle ORM
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3
```

**Database Location**: `./data/recipes.db` (gitignored, backupé séparément)

---

## 3. ORM Choice: Drizzle vs Prisma

### Decision

**Drizzle ORM** pour cette application.

### Rationale

- **TypeScript-First**: Typage naturel, pas de génération d'artéfacts
- **Performance**: Overhead minimal, requêtes SQL optimisées
- **Migrations**: SQL brut, contrôle total, transparence
- **Bundle Size**: ~10KB vs ~50KB pour Prisma client
- **Philosophy**: "SQL with TypeScript" vs abstraction complète

### Alternatives Considered

- **Prisma**: Excellent pour prototypage rapide mais :
  - Génération de client ajoute une étape de build
  - Moins de contrôle sur les requêtes SQL générées
  - Client plus lourd (impact PWA bundle)
- **Kysely**: Excellent mais moins d'intégration Nuxt
- **TypeORM**: Ancien, pattern Active Record moins moderne

### Drizzle Advantages pour ce projet

```typescript
// Typage naturel, pas de génération
import { recipes } from '~/server/database/schema'
const allRecipes = await db.select().from(recipes).where(eq(recipes.published, true))
// Type inference automatique ✅

// Migrations SQL transparentes
// drizzle-kit generate → fichier SQL lisible
// drizzle-kit migrate → exécution
```

### Implementation

```bash
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit
```

**Migration Strategy**: `drizzle-kit generate` → review SQL → commit → `drizzle-kit migrate`

---

## 4. Offline Strategy with Service Workers

### Decision

Stratégie **Cache-First pour recettes consultées** + **Network-First pour le catalogue**.

### Rationale

- **Recettes détaillées** (cache-first):
  - Contenu stable, ne change pas fréquemment
  - Critère de succès: 10 dernières recettes offline
  - Stratégie: CacheStorage API via Workbox
- **Catalogue/Listing** (network-first):
  - Contenu dynamique (nouvelles recettes ajoutées)
  - Fallback vers cache si offline
  - Indicateur visuel "Mode hors ligne"

### Strategies by Content Type

| Content Type                | Strategy      | Rationale                        |
| --------------------------- | ------------- | -------------------------------- |
| `/api/recipes/:id` (détail) | Cache-First   | Stable, offline critique         |
| `/api/recipes` (liste)      | Network-First | Dynamique, fraîcheur prioritaire |
| Images recettes             | Cache-First   | Volumineuses, rarement changées  |
| Assets (CSS, JS)            | Cache-First   | Build hash, immutables           |
| API admin                   | Network-Only  | Toujours à jour, pas d'offline   |

### Cache Expiration

```javascript
// @vite-pwa/nuxt configuration
{
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\/api\/recipes\/\d+$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'recipes-cache',
          expiration: {
            maxEntries: 50,  // 10 dernières + marge
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 semaine
          },
        },
      },
    ],
  },
}
```

### Sync Strategy on Reconnection

- **Passive Sync**: Au retour online, aucune action automatique (évite consommation data)
- **User-Triggered**: Bouton "Actualiser" dans le catalogue pour forcer refresh
- **Background Sync** (future): Pré-charger nouvelles recettes en arrière-plan (phase 2)

### Implementation

```bash
pnpm add @vite-pwa/nuxt
# Configuration dans nuxt.config.ts
```

---

## 5. Wake Lock API Implementation

### Decision

Utiliser **Screen Wake Lock API** avec fallback UI pour navigateurs non supportés.

### Rationale

- **Critère de succès SC-009**: Écran allumé pendant mode pas-à-pas
- **Support navigateurs**:
  - ✅ Chrome/Edge Android: Full support
  - ✅ Safari iOS 16.4+: Support depuis avril 2023
  - ❌ Firefox Android: Partial support (flag)
  - ❌ Anciens iOS (<16.4): Non supporté

### Fallback Strategy (iOS < 16.4 ou Firefox)

- Afficher un message persistant en haut de l'écran pas-à-pas :
  > "💡 Astuce : Désactivez la mise en veille automatique dans vos réglages pour une meilleure expérience."
- Lien direct vers tutoriel (réglages iOS/Android)

### Implementation Pattern

```typescript
// composables/useWakeLock.ts
export const useWakeLock = () => {
  let wakeLock: WakeLockSentinel | null = null

  const request = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request('screen')
        return true
      } catch (err) {
        console.warn('Wake Lock request failed:', err)
        return false
      }
    }
    return false // Not supported
  }

  const release = async () => {
    if (wakeLock) {
      await wakeLock.release()
      wakeLock = null
    }
  }

  return { request, release, isSupported: 'wakeLock' in navigator }
}
```

### UX Considerations

- **Request timing**: Au clic sur "Démarrer le mode pas-à-pas" (user gesture requis)
- **Release timing**: Sortie du mode pas-à-pas ou fin de recette
- **Re-request**: Si l'utilisateur change d'onglet puis revient (visibility change event)

---

## 6. n8n + Ollama Integration

### Decision

**Architecture découplée** : Nuxt app → n8n webhook → Ollama HTTP API → n8n → Nuxt callback.

### Rationale

- **Separation of Concerns**: Parsing workflow isolé du code applicatif
- **n8n Benefits**: Visual workflow, retry logic, monitoring, logs
- **Ollama Local**: Confidentialité des données, pas de coûts API, latence faible

### Architecture Diagram

```
┌─────────────┐      POST /webhook/parse-recipe       ┌────────┐
│ Nuxt Admin  │─────────────────────────────────────>│  n8n   │
│  Interface  │                                        │ Workflow│
└─────────────┘                                        └────┬───┘
       ↑                                                    │
       │                                                    │ HTTP POST
       │         POST /api/admin/import (parsed result)    ▼
       └────────────────────────────────────────────┌──────────┐
                                                     │  Ollama  │
                                                     │ (Mistral)│
                                                     └──────────┘
```

### LLM Model Choice: **Mistral 7B Instruct v0.3**

**Rationale**:

- **Performance**: Excellent pour extraction structurée (JSON mode)
- **Size**: 7B paramètres, balance performance/rapidité
- **Context**: 32k tokens, suffisant pour recettes longues
- **Language**: Optimisé français (européen)
- **Ollama Support**: Modèle officiel, installation simple

**Alternatives Considered**:

- ~~Llama 2 7B Chat~~: Moins bon en français
- ~~Phi-3 Mini~~: Trop limité pour parsing complexe
- ~~Mixtral 8x7B~~: Trop lourd (>13B effectif), latence trop élevée

### Ollama Setup

```bash
# Installation Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Télécharger Mistral 7B Instruct
ollama pull mistral:7b-instruct-v0.3

# Vérifier
ollama run mistral:7b-instruct-v0.3 "Bonjour"
```

### Prompt Engineering pour Extraction Structurée

**Prompt Template** (JSON mode):

```text
Tu es un assistant d'extraction de données culinaires. Extrait les informations suivantes d'une recette en français et retourne UNIQUEMENT un objet JSON valide.

Schéma attendu :
{
  "title": "string",
  "description": "string",
  "prepTime": number (en minutes),
  "cookTime": number (en minutes),
  "difficulty": "facile" | "moyen" | "difficile",
  "servings": number,
  "robotType": "thermomix" | "cookeo" | "monsieur-cuisine" | "manuel" | "tous",
  "ingredients": [
    {
      "name": "string",
      "quantity": number,
      "unit": "g" | "ml" | "piece" | "c.à.s" | "c.à.c" | "pincée",
      "optional": boolean
    }
  ],
  "steps": [
    {
      "order": number,
      "description": "string",
      "duration": number (minutes),
      "temperature": number | null (°C),
      "speed": string | null,
      "ingredients": ["nom1", "nom2"]
    }
  ]
}

Recette à parser :
---
{{ $json.recipeText }}
---

Retourne UNIQUEMENT le JSON, sans texte additionnel.
```

### n8n Workflow Structure

1. **Webhook Trigger** (POST /webhook/parse-recipe)
2. **HTTP Request to Ollama** (localhost:11434/api/generate)
3. **JSON Validation** (node Function pour valider le schéma)
4. **Error Handling** (retry 2x si échec)
5. **HTTP Request to Nuxt** (POST /api/admin/import avec résultat)

### Performance Target

- **Parsing Time**: < 10 secondes pour une recette standard (10-15 étapes)
- **Success Rate**: > 90% de parsing correct (validation automatique + correction manuelle)

### Error Handling

```typescript
// Si parsing échoue (JSON invalide, timeout)
// → Retourner "partial" avec champs extraits + zones "à corriger"
// → Admin corrige manuellement les erreurs avant validation
{
  status: 'partial',
  data: { /* ce qui a été extrait */ },
  errors: [
    { field: 'ingredients[2].quantity', message: 'Quantité non reconnue: "une poignée"' },
  ]
}
```

---

## 7. Image Storage Strategy

### Decision

**Système de fichiers local** pour le MVP, avec support CDN via configuration.

### Rationale

- **MVP Simplicity**: 50-500 recettes × 1 image = 500 images max (~100-200MB total)
- **Nuxt Image**: Module officiel pour optimisation (WebP, AVIF, redimensionnement)
- **Migration Path**: Configuration CDN triviale (change juste `baseURL`)

### Architecture

```
public/
└── uploads/
    └── recipes/
        ├── 1a2b3c4d.jpg   # Original
        ├── 1a2b3c4d.webp  # Auto-généré par Nuxt Image
        └── 1a2b3c4d.avif  # Auto-généré
```

### Nuxt Image Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  image: {
    dir: 'public/uploads',
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024
    },
    formats: ['webp', 'avif', 'jpg'] // Fallback cascade
  }
})
```

### Usage in Components

```vue
<NuxtImg
  :src="`/uploads/recipes/${recipe.image}`"
  :alt="recipe.title"
  width="400"
  height="300"
  format="webp"
  loading="lazy"
/>
```

### CDN Migration Path (Phase 2)

```typescript
// Quand > 1000 recettes ou besoin global CDN
image: {
  domains: ['cdn.example.com'],
  alias: {
    cdn: 'https://cdn.example.com/recipes',
  },
}
// Change juste src="/uploads/..." → src="/cdn/..."
```

### Optimization Settings

- **Compression**: Quality 80 (balance qualité/taille)
- **Formats**: WebP prioritaire (90% support), AVIF (meilleur ratio), JPG fallback
- **Lazy Loading**: Toutes les images sauf hero (above fold)
- **Placeholder**: BlurHash ou LQIP (Low Quality Image Placeholder)

### Upload Flow (Admin)

1. Admin colle URL image ou upload fichier
2. Server télécharge/sauvegarde dans `public/uploads/recipes/`
3. Nuxt Image génère variants à la demande (cache)
4. PWA met en cache les variants utilisés

---

## 8. Admin Authentication

### Decision

**Authentification JWT simple** avec middleware Nuxt, sans framework Auth complexe.

### Rationale

- **Scope MVP**: 1-5 admins, pas de self-service signup
- **No User Management**: Pas d'utilisateurs finaux à authentifier
- **Simplicity**: Pas besoin de OAuth, 2FA, password reset flows
- **Security**: JWT + httpOnly cookies + CSRF protection suffisant

### Implementation Pattern

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const path = event.node.req.url

  // Protéger uniquement les routes /api/admin/*
  if (path?.startsWith('/api/admin')) {
    const token = getCookie(event, 'auth_token')

    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'Authentication required'
      })
    }

    try {
      const payload = await verifyJWT(token)
      event.context.user = payload // Disponible dans les handlers
    } catch (err) {
      throw createError({
        statusCode: 401,
        message: 'Invalid or expired token'
      })
    }
  }
})
```

### Login Flow

1. **Admin Login Page** (`/admin/login`)
2. POST `/api/auth/login` avec credentials (email + password)
3. Server vérifie credentials (hardcodés en env var pour MVP)
4. Génère JWT (expire 7 jours), set httpOnly cookie
5. Redirect vers `/admin/dashboard`

### Security Measures

- **JWT Secret**: Variable d'environnement (`JWT_SECRET`)
- **HttpOnly Cookies**: Pas d'accès JavaScript (XSS protection)
- **SameSite=Strict**: CSRF protection
- **Short Expiry**: 7 jours, renouvellement automatique
- **HTTPS Only**: En production (certificat Let's Encrypt)

### Credentials Storage (MVP)

```bash
# .env (gitignored)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=<bcrypt hash>
JWT_SECRET=<random 32 chars>
```

### Phase 2 Evolution (si nécessaire)

- Ajouter table `admins` en DB (multi-admins)
- Password reset flow
- 2FA (TOTP)
- Session management (revoke tokens)

### Libraries

```bash
pnpm add jose # JWT moderne, crypto Web APIs
pnpm add bcrypt # Password hashing
```

---

## Summary of Decisions

| Decision Area    | Choice                                        | Phase      |
| ---------------- | --------------------------------------------- | ---------- |
| Framework        | Nuxt 4 (stable)                               | ✅ Decided |
| Database         | SQLite (MVP) → PostgreSQL (scale)             | ✅ Decided |
| ORM              | Drizzle ORM                                   | ✅ Decided |
| Offline Strategy | Cache-First (détails) + Network-First (liste) | ✅ Decided |
| Wake Lock        | Screen Wake Lock API + fallback UI            | ✅ Decided |
| LLM Model        | Mistral 7B Instruct v0.3 via Ollama           | ✅ Decided |
| n8n Integration  | Webhook → Ollama → Callback                   | ✅ Decided |
| Image Storage    | Local filesystem + Nuxt Image                 | ✅ Decided |
| Admin Auth       | JWT + httpOnly cookies (simple)               | ✅ Decided |

---

## Technical Risks & Mitigations (Updated)

| Risk                            | Mitigation                                              |
| ------------------------------- | ------------------------------------------------------- |
| SQLite limits concurrent writes | Mode WAL activé, monitoring write frequency             |
| Wake Lock iOS < 16.4            | Fallback UI avec instructions claires                   |
| Ollama parsing < 90% accuracy   | Interface correction admin robuste, prompt iterations   |
| Local images grow > 1GB         | Monitoring taille, alerte si > 500MB, doc migration CDN |

---

**Next**: Phase 1 - Data Model & Contracts
