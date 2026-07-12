<script setup>
definePageMeta({
  layout: 'cms'
})

const route = useRoute()
const slug = computed(() => route.params.slug)
</script>

<template>
  <div class="space-y-6">
    <div>
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <span>Collections</span>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="capitalize">{{ slug }}</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 capitalize">{{ slug }}</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez les éléments de la collection {{ slug }}.</p>
    </div>
    
    <div class="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-6">
      <p class="text-gray-700 dark:text-gray-300">Liste des éléments pour la collection : <span class="text-primary-400 font-semibold">{{ slug }}</span></p>
    </div>
  </div>
</template>
