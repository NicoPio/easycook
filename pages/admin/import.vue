<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Importer une recette
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Collez le texte d'une recette et laissez l'IA la structurer
          </p>
        </div>
        <UButton
          @click="navigateTo('/admin')"
          color="gray"
          variant="soft"
        >
          <Icon name="heroicons:arrow-left" class="w-5 h-5 mr-2" />
          Retour
        </UButton>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Step 1: Paste recipe text -->
      <div v-if="!parsedRecipe" class="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Étape 1 : Coller le texte de la recette
        </h2>

        <textarea
          v-model="recipeText"
          rows="15"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Collez ici le texte complet de la recette (ingrédients, étapes, etc.)"
        ></textarea>

        <!-- Parsing progress -->
        <div v-if="parsing" class="mt-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:arrow-path" class="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
            <div class="flex-1">
              <p class="text-sm font-medium text-blue-800 dark:text-blue-200">
                Parsing en cours... (Tentative {{ parsingAttempt }}/3)
              </p>
              <p class="text-sm text-blue-700 dark:text-blue-300">
                L'IA analyse et structure la recette
              </p>
            </div>
          </div>
        </div>

        <!-- Parsing errors -->
        <div v-if="parsingErrors.length > 0" class="mt-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Échec du parsing automatique
              </p>
              <ul class="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                <li v-for="(error, index) in parsingErrors" :key="index">
                  {{ error }}
                </li>
              </ul>
              <p class="text-sm text-red-700 dark:text-red-300 mt-3">
                Veuillez saisir les informations manuellement ou modifier le texte de la recette.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-4">
          <UButton
            @click="handleParse"
            :disabled="!recipeText.trim() || parsing"
            :loading="parsing"
            size="lg"
          >
            <Icon name="heroicons:sparkles" class="w-5 h-5 mr-2" />
            {{ parsing ? 'Parsing...' : 'Parser avec IA' }}
          </UButton>
        </div>
      </div>

      <!-- Step 2: Review and edit parsed data -->
      <div v-else class="space-y-6">
        <!-- Recipe info -->
        <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Étape 2 : Vérifier et corriger
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre de la recette *
              </label>
              <input
                v-model="parsedRecipe.title"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de personnes *
              </label>
              <input
                v-model.number="parsedRecipe.servings"
                type="number"
                min="1"
                max="20"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temps de préparation (min) *
              </label>
              <input
                v-model.number="parsedRecipe.prepTime"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temps de cuisson (min) *
              </label>
              <input
                v-model.number="parsedRecipe.cookTime"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulté *
              </label>
              <select
                v-model="parsedRecipe.difficulty"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="facile">Facile</option>
                <option value="moyen">Moyen</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description courte
            </label>
            <input
              v-model="parsedRecipe.descriptionShort"
              type="text"
              maxlength="200"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description complète
            </label>
            <textarea
              v-model="parsedRecipe.descriptionFull"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            ></textarea>
          </div>
        </div>

        <!-- Ingredients -->
        <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Ingrédients ({{ parsedRecipe.ingredients.length }})
          </h3>
          <div class="space-y-3">
            <div
              v-for="(ingredient, index) in parsedRecipe.ingredients"
              :key="index"
              class="grid grid-cols-12 gap-2"
            >
              <input
                v-model="ingredient.name"
                type="text"
                placeholder="Nom"
                class="col-span-5 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                v-model.number="ingredient.quantity"
                type="number"
                step="0.1"
                placeholder="Quantité"
                class="col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <select
                v-model="ingredient.unit"
                class="col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="pièce">pièce</option>
                <option value="c.à.s">c.à.s</option>
                <option value="c.à.c">c.à.c</option>
                <option value="pincée">pincée</option>
                <option value="L">L</option>
                <option value="kg">kg</option>
              </select>
              <label class="col-span-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  v-model="ingredient.isOptional"
                  type="checkbox"
                  class="rounded"
                />
                Optionnel
              </label>
              <button
                @click="parsedRecipe.ingredients.splice(index, 1)"
                class="col-span-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
              >
                <Icon name="heroicons:trash" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Steps -->
        <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Étapes ({{ parsedRecipe.steps.length }})
          </h3>
          <div class="space-y-4">
            <div
              v-for="(step, index) in parsedRecipe.steps"
              :key="index"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div class="flex items-center gap-2 mb-3">
                <span class="inline-flex items-center justify-center w-8 h-8 bg-primary-500 text-white rounded-full font-bold text-sm">
                  {{ step.stepNumber }}
                </span>
                <input
                  v-model.number="step.stepNumber"
                  type="number"
                  min="1"
                  class="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <textarea
                v-model="step.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
              ></textarea>
              <div class="grid grid-cols-3 gap-2">
                <input
                  v-model.number="step.duration"
                  type="number"
                  placeholder="Durée (min)"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  v-model.number="step.temperature"
                  type="number"
                  placeholder="Température (°C)"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  v-model="step.speed"
                  type="text"
                  placeholder="Vitesse"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <div class="flex justify-between items-center">
            <UButton
              @click="reset"
              color="gray"
              variant="soft"
              size="lg"
            >
              Recommencer
            </UButton>

            <div class="flex gap-4">
              <UButton
                @click="saveRecipe('draft')"
                :loading="saving"
                color="gray"
                size="lg"
              >
                Enregistrer en brouillon
              </UButton>
              <UButton
                @click="saveRecipe('published')"
                :loading="saving"
                size="lg"
              >
                <Icon name="heroicons:check-circle" class="w-5 h-5 mr-2" />
                Publier la recette
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * Admin import page
 *
 * FR-066-069: Interface d'import avec parsing IA, édition manuelle, et publication
 */

const router = useRouter()

const recipeText = ref('')
const parsing = ref(false)
const parsingAttempt = ref(0)
const parsingErrors = ref<string[]>([])
const parsedRecipe = ref<any>(null)
const saving = ref(false)

// Check authentication
onMounted(() => {
  if (process.client) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    }
  }
})

async function handleParse() {
  parsing.value = true
  parsingAttempt.value = 0
  parsingErrors.value = []

  try {
    const token = process.client ? localStorage.getItem('admin_token') : null

    const response = await $fetch('/api/admin/import', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        recipeText: recipeText.value
      }
    })

    if (response.status === 'success') {
      parsedRecipe.value = response.data
      parsingAttempt.value = response.attempts
    } else {
      parsingErrors.value = response.errors || ['Échec du parsing']
      parsingAttempt.value = response.attempts
    }
  } catch (err: any) {
    parsingErrors.value = [err.data?.message || 'Erreur de connexion au service d\'IA']
  } finally {
    parsing.value = false
  }
}

async function saveRecipe(status: 'draft' | 'published') {
  saving.value = true

  try {
    const token = process.client ? localStorage.getItem('admin_token') : null

    await $fetch('/api/admin/recipes', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        ...parsedRecipe.value,
        status
      }
    })

    alert(status === 'published' ? 'Recette publiée avec succès !' : 'Recette enregistrée en brouillon')
    router.push('/admin')
  } catch (err: any) {
    alert('Erreur lors de l\'enregistrement : ' + (err.data?.message || 'Erreur inconnue'))
  } finally {
    saving.value = false
  }
}

function reset() {
  recipeText.value = ''
  parsedRecipe.value = null
  parsingErrors.value = []
  parsingAttempt.value = 0
}

definePageMeta({
  layout: false
})
</script>
