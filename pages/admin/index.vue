<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Admin
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestion des recettes EasyCook
          </p>
        </div>
        <div class="flex gap-4">
          <UButton
            @click="navigateTo('/admin/import')"
            size="lg"
          >
            <Icon name="heroicons:plus-circle" class="w-5 h-5 mr-2" />
            Importer une recette
          </UButton>
          <UButton
            @click="handleLogout"
            color="gray"
            variant="soft"
            size="lg"
          >
            <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 mr-2" />
            Déconnexion
          </UButton>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Loading state -->
      <div v-if="loading" class="text-center py-12">
        <Icon name="heroicons:arrow-path" class="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400">Chargement des recettes...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
        <p class="font-semibold">Erreur</p>
        <p class="text-sm">{{ error.message }}</p>
      </div>

      <!-- Recipes table -->
      <div v-else class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Toutes les recettes ({{ pagination.total }})
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Incluant les brouillons et recettes publiées
          </p>
        </div>

        <div v-if="recipes.length === 0" class="text-center py-12">
          <Icon name="heroicons:document-text" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400">Aucune recette pour le moment</p>
          <UButton
            @click="navigateTo('/admin/import')"
            class="mt-4"
          >
            Importer votre première recette
          </UButton>
        </div>

        <table v-else class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Titre
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Difficulté
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Temps total
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Mis à jour
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="recipe in recipes" :key="recipe.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ recipe.title }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  /recettes/{{ recipe.slug }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    recipe.status === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  ]"
                >
                  {{ recipe.status === 'published' ? 'Publié' : 'Brouillon' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ recipe.difficulty }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ recipe.prepTime + recipe.cookTime }} min
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(recipe.updatedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="toggleStatus(recipe)"
                  class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-4"
                >
                  {{ recipe.status === 'published' ? 'Dépublier' : 'Publier' }}
                </button>
                <button
                  @click="deleteRecipe(recipe.id)"
                  class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * Admin dashboard page
 *
 * FR-065: Interface d'administration avec liste des recettes (tous statuts)
 * FR-040-041: Publier/dépublier des recettes
 */

const router = useRouter()

const recipes = ref<any[]>([])
const loading = ref(true)
const error = ref<Error | null>(null)
const pagination = ref({
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 0
})

// Check authentication
onMounted(async () => {
  if (process.client) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
  }

  await fetchRecipes()
})

async function fetchRecipes() {
  loading.value = true
  error.value = null

  try {
    const token = process.client ? localStorage.getItem('admin_token') : null

    const response = await $fetch('/api/admin/recipes', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    recipes.value = response.recipes
    pagination.value = response.pagination
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
}

async function toggleStatus(recipe: any) {
  try {
    const token = process.client ? localStorage.getItem('admin_token') : null
    const newStatus = recipe.status === 'published' ? 'draft' : 'published'

    await $fetch(`/api/admin/recipes/${recipe.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        status: newStatus
      }
    })

    // Refresh list
    await fetchRecipes()
  } catch (err) {
    alert('Erreur lors de la modification du statut')
  }
}

async function deleteRecipe(recipeId: number) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
    return
  }

  try {
    const token = process.client ? localStorage.getItem('admin_token') : null

    await $fetch(`/api/admin/recipes/${recipeId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // Refresh list
    await fetchRecipes()
  } catch (err) {
    alert('Erreur lors de la suppression')
  }
}

function handleLogout() {
  if (process.client) {
    localStorage.removeItem('admin_token')
  }
  router.push('/admin/login')
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

definePageMeta({
  layout: false
})
</script>
