# EasyCook - Application PWA de Recettes pour Robots Cuisiniers

Application web progressive (PWA) pour consulter et gérer des recettes optimisées pour robots cuisiniers (Thermomix, Cookeo, Monsieur Cuisine, etc.).

## 🚀 Fonctionnalités

### Pour les utilisateurs
- **Catalogue de recettes** : Parcourez toutes les recettes disponibles avec filtres par robot, difficulté et temps
- **Recherche avancée** : Trouvez rapidement des recettes par mot-clé
- **Ajustement des portions** : Adaptez automatiquement les quantités d'ingrédients (1-20 personnes)
- **Mode pas-à-pas** : Interface fullscreen optimisée pour cuisiner avec navigation tactile
- **Support offline** : Les 10 dernières recettes consultées restent accessibles hors ligne
- **PWA installable** : Installez l'application sur votre appareil

### Pour les administrateurs
- **Import intelligent** : Parsez automatiquement des recettes en texte brut avec IA (Ollama)
- **Gestion CRUD** : Créez, modifiez et supprimez des recettes
- **Workflow draft/publié** : Validez les recettes avant publication
- **Authentification JWT** : Sécurisation de l'espace admin

## 🛠️ Stack Technique

- **Framework** : [Nuxt 3](https://nuxt.com/) avec Vue 3 Composition API
- **UI** : [Nuxt UI](https://ui.nuxt.com/) + Tailwind CSS 4
- **Base de données** : SQLite avec [Drizzle ORM](https://orm.drizzle.team/)
- **PWA** : [@vite-pwa/nuxt](https://vite-pwa-org.netlify.app/frameworks/nuxt)
- **IA** : [Ollama](https://ollama.ai/) (Mistral) pour le parsing de recettes
- **TypeScript** : Strict mode activé
- **Cache offline** : IndexedDB via localForage

## 📋 Prérequis

- Node.js 18+ ou 20+
- npm ou pnpm
- Ollama (optionnel, pour l'import IA de recettes)

## 🏁 Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-org/easycook.git
cd easycook

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement
# Éditer .env avec vos valeurs

# Générer et exécuter les migrations de base de données
npm run db:generate
npm run db:push

# Peupler la base de données avec des données initiales
npm run db:seed
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_PATH=./data/easycook.db

# Admin (pour JWT auth)
ADMIN_EMAIL=admin@easycook.app
ADMIN_PASSWORD_HASH=$2b$10$... # Générer avec bcrypt
JWT_SECRET=your-secret-key-here

# Ollama (optionnel, pour import IA)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

### Générer le hash du mot de passe admin

```bash
npx tsx -e "import bcrypt from 'bcryptjs'; console.log(bcrypt.hashSync('votre-mot-de-passe', 10))"
```

## 🚦 Démarrage

### Développement

```bash
npm run dev
```

Application disponible sur `http://localhost:3000`

### Production

```bash
# Build
npm run build

# Preview
npm run preview
```

## 📁 Structure du Projet

```
easycook/
├── components/        # Composants Vue réutilisables
│   ├── filters/      # Composants de filtrage
│   ├── recipe/       # Composants liés aux recettes
│   └── ui/           # Composants UI génériques
├── composables/      # Composables Vue pour logique partagée
├── pages/            # Pages Nuxt (routing auto)
│   ├── admin/       # Interface admin
│   └── recettes/    # Pages recettes
├── server/           # Backend Nuxt (API + DB)
│   ├── api/         # Routes API
│   ├── database/    # Schémas Drizzle et seeds
│   ├── middleware/  # Middleware d'authentification
│   └── utils/       # Utilitaires serveur
├── types/            # Types TypeScript
├── workflows/        # Prompts IA et workflows
└── public/           # Assets statiques
```

## 📚 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build pour production |
| `npm run preview` | Preview du build de production |
| `npm run lint` | Linter le code |
| `npm run format` | Formater le code avec Prettier |
| `npm run db:generate` | Générer les migrations Drizzle |
| `npm run db:push` | Appliquer les migrations |
| `npm run db:seed` | Peupler la DB avec données initiales |

## 🔐 Authentification Admin

1. Accédez à `/admin/login`
2. Connectez-vous avec les identifiants configurés dans `.env`
3. Le token JWT est stocké dans localStorage

## 🤖 Configuration Ollama (Import IA)

Pour utiliser l'import automatique de recettes :

```bash
# Installer Ollama
curl https://ollama.ai/install.sh | sh

# Télécharger le modèle Mistral
ollama pull mistral

# Lancer Ollama
ollama serve
```

L'import sera disponible sur `/admin/import`

## 🧪 Tests

Les tests ne sont pas inclus dans cette version. Pour ajouter des tests :

```bash
# Installer Vitest
npm install -D vitest @vue/test-utils

# Créer des tests dans __tests__/ ou .spec.ts files
```

## 📱 PWA

L'application est installable en tant que PWA :

- **Desktop** : Cliquez sur l'icône d'installation dans la barre d'adresse
- **Mobile** : Menu → "Ajouter à l'écran d'accueil"

### Fonctionnalités PWA

- ✅ Manifest avec icônes et splash screens
- ✅ Service worker avec stratégies de cache
- ✅ Support offline (IndexedDB)
- ✅ Mise à jour automatique
- ✅ Wake Lock API (mode pas-à-pas)

## 🔒 Sécurité

- Content Security Policy (CSP) configurée
- Headers de sécurité (X-Frame-Options, X-Content-Type-Options, etc.)
- JWT pour authentification admin
- Validation côté serveur avec Zod
- Protection CSRF sur formulaires

## 🌐 Déploiement

### Vercel / Netlify

```bash
# Build
npm run build

# Le dossier .output/ contient l'application buildée
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

## 📖 Documentation Additionnelle

- [Quickstart Guide](./specs/001-recipe-app-pwa/quickstart.md)
- [Spécifications](./specs/001-recipe-app-pwa/spec.md)
- [Plan d'implémentation](./specs/001-recipe-app-pwa/plan.md)
- [Modèle de données](./specs/001-recipe-app-pwa/data-model.md)

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- Équipe EasyCook

## 🙏 Remerciements

- [Nuxt](https://nuxt.com/) pour le framework
- [Nuxt UI](https://ui.nuxt.com/) pour les composants
- [Drizzle ORM](https://orm.drizzle.team/) pour l'ORM
- [Ollama](https://ollama.ai/) pour l'IA locale

---

**Made with ❤️ for home cooks everywhere**
