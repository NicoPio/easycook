<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-lg w-full text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        <div class="mt-4">
          <UIcon
            name="i-lucide-search"
            class="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600"
          />
        </div>
      </div>

      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Page introuvable</h2>

      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>

      <div class="space-y-4">
        <UButton to="/" size="lg" color="primary" class="w-full sm:w-auto">
          <UIcon name="i-lucide-home" class="w-5 h-5 mr-2" />
          Retour à l'accueil
        </UButton>

        <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Vous cherchez peut-être :
          </h3>

          <div class="grid gap-3">
            <UButton to="/" variant="soft" color="gray" class="justify-start" block>
              <UIcon name="i-lucide-layers" class="w-5 h-5 mr-2" />
              Catalogue de recettes
            </UButton>

            <UButton to="/admin/login" variant="soft" color="gray" class="justify-start" block>
              <UIcon name="i-lucide-lock" class="w-5 h-5 mr-2" />
              Administration
            </UButton>
          </div>
        </div>
      </div>

      <div class="mt-12 text-sm text-gray-500 dark:text-gray-500">
        <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

// Set proper HTTP status code for SEO
useHead({
  title: 'Page introuvable - EasyCook',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
})

// Set 404 status code
const event = useRequestEvent()
if (event) {
  setResponseStatus(event, 404)
}
</script>
