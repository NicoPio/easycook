# Quickstart Guide: Application PWA de Recettes

**Branch**: `001-recipe-app-pwa` | **Date**: 2025-11-21

Ce guide vous permet de démarrer rapidement le projet en environnement de développement.

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

### 1. Node.js & pnpm

```bash
# Node.js 18+ requis
node --version  # Devrait afficher v18.x ou supérieur

# Installer pnpm (si pas déjà fait)
npm install -g pnpm

# Vérifier l'installation
pnpm --version  # Devrait afficher v8.x ou supérieur
```

### 2. Ollama (pour le parsing IA)

```bash
# Installation Ollama (Linux/macOS)
curl -fsSL https://ollama.com/install.sh | sh

# Windows: télécharger depuis https://ollama.com/download

# Vérifier l'installation
ollama --version

# Télécharger le modèle Mistral 7B Instruct
ollama pull mistral:7b-instruct-v0.3

# Vérifier que le modèle fonctionne
ollama run mistral:7b-instruct-v0.3 "Bonjour, écris 'OK' si tu fonctionnes"
# Devrait répondre quelque chose contenant "OK"
```

**Note** : Le téléchargement du modèle Mistral prend ~4GB d'espace disque et quelques minutes selon votre connexion.

### 3. n8n (orchestration workflows)

```bash
# Installation globale via npm
npm install -g n8n

# OU installation via Docker (recommandé pour production)
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Vérifier que n8n est accessible
# Ouvrir http://localhost:5678 dans un navigateur
```

**Alternative** : Pour le MVP, n8n peut être remplacé par un simple endpoint Nuxt qui appelle directement Ollama. Voir section "Mode Simplifié" ci-dessous.

---

## Installation du Projet

### 1. Cloner le repository

```bash
git clone https://github.com/NicoPio/easycook.git
cd easycook
```

### 2. Installer les dépendances

```bash
pnpm install
```

Cette commande installe toutes les dépendances définies dans `package.json` :

- Nuxt 4 + modules
- Drizzle ORM + better-sqlite3
- Nuxt UI + Tailwind CSS 4
- @vite-pwa/nuxt
- Et toutes les dépendances de développement (Vitest, Playwright, ESLint, etc.)

### 3. Configurer les variables d'environnement

```bash
# Copier le template d'environnement
cp .env.example .env

# Éditer le fichier .env
nano .env  # ou votre éditeur préféré
```

**Contenu du `.env`** :

```bash
# Base URL de l'application
NUXT_PUBLIC_BASE_URL=http://localhost:3000

# Base de données SQLite
DATABASE_PATH=./data/recipes.db

# Authentification Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=$2b$10$...  # Généré via bcrypt (voir ci-dessous)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Ollama API (local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral:7b-instruct-v0.3

# n8n Webhook URL (si utilisé)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/parse-recipe

# Mode (development | production)
NODE_ENV=development
```

**Générer le hash du mot de passe admin** :

```bash
# Installer bcrypt CLI (temporaire)
npx bcrypt-cli hash "votre-mot-de-passe-admin" 10

# Copier le hash dans .env
# Exemple de sortie :
# $2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRST
```

### 4. Initialiser la base de données

```bash
# Créer le répertoire data
mkdir -p data

# Générer les migrations Drizzle depuis le schéma
pnpm drizzle-kit generate

# Appliquer les migrations (créer les tables)
pnpm drizzle-kit migrate

# Vérifier que la DB existe
ls -lh data/recipes.db
# Devrait afficher le fichier ~8KB (vide avec structure)
```

**Seed des données initiales** (types de robots) :

```bash
# Exécuter le script de seed
pnpm run db:seed

# OU manuellement via drizzle studio
pnpm drizzle-kit studio
# Ouvre une interface web pour insérer les 5 robots types
```

### 5. Démarrer le serveur de développement

```bash
pnpm dev
```

**Sorties attendues** :

```
Nuxt 4 with Nitro 2.9.0

  ➜ Local:    http://localhost:3000/
  ➜ Network:  http://192.168.x.x:3000/

  ✔ Vite client warmed up in 1234ms
  ✔ Nitro built in 567ms
```

**Accès à l'application** :

- **Frontend utilisateur** : http://localhost:3000/
- **Admin login** : http://localhost:3000/admin/login
- **API publique** : http://localhost:3000/api/recipes
- **API admin** : http://localhost:3000/api/admin/recipes

---

## Configuration n8n (Workflow de Parsing)

### 1. Démarrer n8n

```bash
# Si installation globale
n8n start

# Si Docker
docker start n8n
```

Accéder à l'interface : **http://localhost:5678**

### 2. Importer le workflow

1. Dans l'interface n8n, cliquer sur **"Add Workflow"**
2. Cliquer sur **"Import from File"**
3. Sélectionner `workflows/recipe-parser/n8n-workflow.json`
4. Le workflow devrait s'afficher avec 5 nodes :
   - **Webhook Trigger**
   - **HTTP Request to Ollama**
   - **JSON Validation**
   - **Error Handler**
   - **HTTP Request to Nuxt** (callback)

### 3. Configurer le webhook

1. Cliquer sur le node **Webhook Trigger**
2. Copier l'URL du webhook (ex: `http://localhost:5678/webhook/abc123`)
3. Mettre à jour `.env` avec cette URL :
   ```bash
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/abc123
   ```

### 4. Activer le workflow

1. Cliquer sur le bouton **"Active"** en haut à droite (toggle OFF → ON)
2. Le webhook est maintenant en écoute

### 5. Tester le workflow

```bash
# Via curl
curl -X POST http://localhost:5678/webhook/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Poulet Basquaise\n\nPour 4 personnes\nTemps : 1h\n\nIngrédients :\n- 800g poulet\n- 2 poivrons\n\nÉtapes :\n1. Couper le poulet\n2. Faire revenir..."
  }'
```

**Réponse attendue** (après ~5-10 secondes) :

```json
{
  "status": "success",
  "data": {
    "title": "Poulet Basquaise",
    "servings": 4,
    "prepTime": 15,
    "cookTime": 45,
    "ingredients": [...],
    "steps": [...]
  }
}
```

---

## Mode Simplifié (Sans n8n)

Pour un démarrage rapide sans n8n, vous pouvez utiliser l'endpoint Nuxt qui appelle directement Ollama.

### 1. Modifier `.env`

```bash
# Désactiver n8n
# N8N_WEBHOOK_URL=  # Commenter ou laisser vide
USE_DIRECT_OLLAMA=true
```

### 2. Créer l'endpoint direct

Le fichier `server/api/admin/import-direct.post.ts` est fourni avec le projet et appelle directement Ollama sans passer par n8n.

### 3. Tester l'import direct

Dans l'interface admin :

1. Aller sur http://localhost:3000/admin/import
2. Coller le texte d'une recette
3. Cliquer sur **"Importer"**
4. Le parsing se fait directement côté serveur Nuxt

**Avantages** :

- Pas besoin d'installer/configurer n8n
- Plus simple pour le MVP

**Inconvénients** :

- Pas de workflow visuel
- Pas de retry automatique
- Moins flexible pour évolution

---

## Importer votre Première Recette

### Via l'Interface Admin

1. Accéder à http://localhost:3000/admin/login
2. Se connecter avec :
   - Email : `admin@example.com` (ou celui défini dans `.env`)
   - Mot de passe : celui que vous avez hashé
3. Aller sur **"Import"** dans le menu admin
4. Coller une recette (exemple ci-dessous)
5. Cliquer sur **"Parser la recette"**
6. Vérifier le résultat du parsing
7. Corriger les erreurs éventuelles
8. Cliquer sur **"Publier"**

### Exemple de Recette à Tester

```
Poulet Basquaise au Thermomix

Pour 4 personnes
Préparation : 15 minutes
Cuisson : 45 minutes
Difficulté : Moyen

Ingrédients :
- 800g de blanc de poulet
- 3 poivrons rouges
- 2 tomates
- 1 oignon
- 2 gousses d'ail
- 200ml de vin blanc
- 2 cuillères à soupe d'huile d'olive
- Sel et poivre

Étapes :
1. Couper le poulet en morceaux. Éplucher et émincer l'oignon et l'ail. Mettre dans le bol avec l'huile. Faire revenir 3 min à 120°C vitesse 1.

2. Ajouter les poivrons coupés en lanières et les tomates en dés. Cuire 5 min à 100°C vitesse 1.

3. Ajouter le poulet, le vin blanc, le sel et le poivre. Cuire 30 min à 90°C sens inverse vitesse 1.

4. Vérifier la cuisson du poulet. Servir chaud avec du riz.
```

### Via l'API (cURL)

```bash
# 1. Se connecter (obtenir le cookie JWT)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "votre-mot-de-passe"}' \
  -c cookies.txt

# 2. Importer la recette
curl -X POST http://localhost:3000/api/admin/import \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d @recipe.json

# 3. Créer la recette après validation
curl -X POST http://localhost:3000/api/admin/recipes \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d @parsed-recipe.json
```

---

## Vérifier que Tout Fonctionne

### 1. Frontend Utilisateur

Accéder à http://localhost:3000/

✅ **Attendu** :

- Page d'accueil avec le catalogue de recettes (vide si aucune recette publiée)
- Filtres par robot et difficulté
- Barre de recherche

### 2. Détail d'une Recette

1. Publier une recette via l'admin
2. Cliquer sur la carte de la recette
3. Page détail s'affiche avec ingrédients et aperçu

✅ **Attendu** :

- Affichage des ingrédients avec quantités
- Contrôle du nombre de personnes (slider ou input)
- Les quantités se recalculent instantanément
- Bouton "Mode pas-à-pas"

### 3. Mode Pas-à-Pas

1. Depuis le détail, cliquer sur "Démarrer le mode pas-à-pas"
2. L'écran passe en fullscreen

✅ **Attendu** :

- Affichage fullscreen de l'étape 1
- Navigation suivant/précédent
- Indicateur de progression (ex: "Étape 2/5")
- L'écran ne se met pas en veille (Wake Lock activé)

### 4. PWA (Installation)

1. Ouvrir Chrome/Edge sur mobile ou desktop
2. Aller sur http://localhost:3000/
3. Cliquer sur l'icône "Installer" dans la barre d'adresse

✅ **Attendu** :

- Popup d'installation PWA
- Après installation, l'app s'ouvre en mode standalone
- Fonctionne offline pour les recettes consultées

### 5. Tests Automatisés

```bash
# Tests unitaires (Vitest)
pnpm test

# Tests E2E (Playwright)
pnpm test:e2e

# Coverage
pnpm test:coverage
```

---

## Commandes Utiles

```bash
# Développement
pnpm dev                 # Démarrer le dev server
pnpm build               # Build production
pnpm preview             # Preview du build

# Base de données
pnpm drizzle-kit generate   # Générer migrations
pnpm drizzle-kit migrate    # Appliquer migrations
pnpm drizzle-kit studio     # Interface visuelle DB
pnpm db:seed                # Seed données initiales

# Tests
pnpm test                   # Tests unitaires
pnpm test:watch             # Tests en mode watch
pnpm test:e2e               # Tests E2E
pnpm test:coverage          # Coverage report

# Linting & Formatting
pnpm lint                   # ESLint
pnpm lint:fix               # Fix auto
pnpm format                 # Prettier

# PWA
pnpm generate:pwa-assets    # Générer icônes PWA

# Type Checking
pnpm typecheck              # Vérifier types TypeScript
```

---

## Dépannage

### Problème : "Ollama connection refused"

**Solution** :

```bash
# Vérifier qu'Ollama tourne
ollama list

# Relancer Ollama
ollama serve

# Sur macOS, Ollama se lance automatiquement
# Sur Linux, vérifier le service systemd
systemctl status ollama
```

### Problème : "Module not found" après pnpm install

**Solution** :

```bash
# Nettoyer les caches
rm -rf node_modules .nuxt .output
pnpm install --force
pnpm dev
```

### Problème : "Database locked" (SQLite)

**Solution** :

```bash
# SQLite en mode WAL (Write-Ahead Logging)
sqlite3 data/recipes.db "PRAGMA journal_mode=WAL;"

# OU supprimer les locks
rm data/recipes.db-shm data/recipes.db-wal
```

### Problème : Wake Lock ne fonctionne pas sur iOS

**Cause** : iOS Safari < 16.4 ne supporte pas Wake Lock API.

**Solution** : Affichage automatique d'un message utilisateur avec instructions pour désactiver la mise en veille dans les réglages iOS.

### Problème : PWA ne propose pas l'installation

**Solution** :

```bash
# Vérifier le manifest
curl http://localhost:3000/manifest.webmanifest

# Vérifier HTTPS (requis pour PWA en production)
# En dev, localhost est autorisé même en HTTP

# Vérifier les critères PWA via Lighthouse
pnpm build
pnpm preview
# Ouvrir DevTools → Lighthouse → PWA audit
```

---

## Prochaines Étapes

Une fois le projet démarré, vous pouvez :

1. **Importer des recettes** via l'admin
2. **Tester l'ajustement des proportions** sur une recette
3. **Tester le mode pas-à-pas** en fullscreen
4. **Installer la PWA** sur mobile pour tester offline
5. **Lancer les tests** pour vérifier la qualité du code
6. **Consulter la roadmap** dans `/specs/001-recipe-app-pwa/plan.md`

---

## Ressources

- **Documentation Nuxt 3** : https://nuxt.com/docs
- **Nuxt UI** : https://ui.nuxt.com/
- **Drizzle ORM** : https://orm.drizzle.team/
- **Ollama** : https://ollama.com/
- **n8n** : https://docs.n8n.io/
- **PWA Best Practices** : https://web.dev/progressive-web-apps/

---

**Bon développement ! 🚀**
