<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          EasyCook Admin
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Connectez-vous pour gérer les recettes
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
              placeholder="Adresse email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Mot de passe</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
              placeholder="Mot de passe"
            />
          </div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          <p class="text-sm">{{ error }}</p>
        </div>

        <div>
          <UButton
            type="submit"
            :loading="loading"
            :disabled="loading"
            size="xl"
            class="w-full"
          >
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Admin login page
 *
 * FR-027-030: Authentification JWT pour protéger les routes admin
 */

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if (response.token) {
      // Store JWT token in localStorage
      if (process.client) {
        localStorage.setItem('admin_token', response.token)
      }

      // Redirect to admin dashboard
      router.push('/admin')
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Identifiants invalides'
  } finally {
    loading.value = false
  }
}

// Redirect if already logged in
onMounted(() => {
  if (process.client) {
    const token = localStorage.getItem('admin_token')
    if (token) {
      router.push('/admin')
    }
  }
})

definePageMeta({
  layout: false
})
</script>
