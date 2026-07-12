<script setup>
definePageMeta({
  layout: 'cms'
})

const route = useRoute()
const pageId = computed(() => route.params.id)

const { data: page, refresh, error } = await useFetch(() => `/api/cms/pages/${pageId.value}`)

const title = ref('')
const slug = ref('')
const blocks = ref([])
const saving = ref(false)
const deleting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Field creation state
const newFieldType = ref('text')
const newFieldLabel = ref('')
const newFieldKey = ref('')

const selectOptions = [
  { label: 'Texte', value: 'text' },
  { label: 'Texte enrichi', value: 'tiptap' },
  { label: 'Image', value: 'image' },
]

watch(page, (newVal) => {
  if (newVal) {
    title.value = newVal.title
    slug.value = newVal.slug
    blocks.value = newVal.blocks ? JSON.parse(JSON.stringify(newVal.blocks)) : []
  }
}, { immediate: true })

const addField = () => {
  if (!newFieldLabel.value.trim() || !newFieldKey.value.trim()) return

  const key = newFieldKey.value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')

  if (!key) {
    errorMessage.value = 'Clé technique invalide.'
    return
  }

  // Check unique key constraint
  const exists = blocks.value.some((b) => b.key === key)
  if (exists) {
    errorMessage.value = `La clé "${key}" est déjà utilisée dans cette page.`
    return
  }

  errorMessage.value = ''
  blocks.value.push({
    id: Date.now().toString(),
    type: newFieldType.value,
    label: newFieldLabel.value.trim(),
    key,
    value: ''
  })

  // Reset creation form
  newFieldLabel.value = ''
  newFieldKey.value = ''
}

const removeField = (id) => {
  blocks.value = blocks.value.filter((b) => b.id !== id)
}

const savePage = async () => {
  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await $fetch(`/api/cms/pages/${pageId.value}`, {
      method: 'PATCH',
      body: {
        title: title.value,
        slug: slug.value,
        blocks: blocks.value
      }
    })
    successMessage.value = 'Page enregistrée avec succès.'
    await refresh()
    // Refresh all data globally to sync layout lists
    refreshNuxtData()
  } catch (err) {
    errorMessage.value = err.data?.message || 'Erreur lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}

const deletePage = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return

  deleting.value = true
  try {
    await $fetch(`/api/cms/pages/${pageId.value}`, {
      method: 'DELETE'
    })
    refreshNuxtData()
    navigateTo('/cms')
  } catch (err) {
    errorMessage.value = err.data?.message || 'Erreur lors de la suppression.'
    deleting.value = false
  }
}
</script>

<template>
  <div v-if="error" class="space-y-6">
    <UAlert
      icon="i-heroicons-exclamation-triangle"
      color="error"
      variant="soft"
      title="Page introuvable"
      description="La page demandée n'existe pas ou a été supprimée."
    />
    <UButton to="/cms" color="neutral" variant="ghost">Retour au Tableau de bord</UButton>
  </div>
  
  <div v-else-if="page" class="space-y-6">
    <!-- Header Page Actions -->
    <div class="flex justify-between items-center">
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>Pages</span>
          <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
          <span>{{ page.title }}</span>
        </div>
      </div>
      <UButton
        icon="i-heroicons-trash"
        color="error"
        variant="subtle"
        :loading="deleting"
        @click="deletePage"
      />
    </div>

    <!-- Layout Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Content Fields List -->
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold">Contenu de la page</h2>
          
            </div>
          </template>
          
          <!-- Empty State -->
          <div v-if="blocks.length === 0" class="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 mb-6">
            <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 class="text-base font-semibold text-gray-700 dark:text-gray-300">Aucun champ de contenu</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">Ajoutez des champs ci-dessous pour composer les informations de cette page.</p>
          </div>

          <!-- Fields List -->
          <div v-else class="space-y-6 mb-6">
            <div v-for="block in blocks" :key="block.id" class="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-b-0 last:pb-0">
              <div class="flex justify-between items-center mb-2">
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ block.label }}</span>
                  <span class="text-xs text-gray-400 dark:text-gray-500">Clé: <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-primary-500 font-mono">{{ block.key }}</code></span>
                </div>
                <UButton
                  icon="i-heroicons-trash"
                  size="xs"
                  color="error"
                  variant="ghost"
                  @click="removeField(block.id)"
                  title="Supprimer ce champ"
                />
              </div>

              <!-- Input Editor Components -->
              <div v-if="block.type === 'text'">
                <UInput v-model="block.value" placeholder="Saisissez du texte..." class="w-full" />
              </div>
              <div v-else-if="block.type === 'image'" class="space-y-2">
                <UInput v-model="block.value" placeholder="URL de l'image (ex: https://...)" class="w-full" />
                <div v-if="block.value" class="mt-2 max-w-sm border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-950">
                  <img :src="block.value" class="max-h-48 w-full object-contain p-2" />
                </div>
              </div>
              <div v-else-if="block.type === 'tiptap'">
                <TiptapEditor v-model="block.value" />
              </div>
            </div>
          </div>

          <!-- Add Input Fields Form -->
          <div class="border-t border-gray-200 dark:border-gray-800 pt-6">
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UFormField label="Type de champ" name="fieldType">
                <USelect
                  v-model="newFieldType"
                  :items="selectOptions"
                  class="w-full"
                />
              </UFormField>
              
              <UFormField label="Nom du champ" name="fieldLabel" required>
                <UInput v-model="newFieldLabel" placeholder="ex: Titre de la bannière" class="w-full" />
              </UFormField>

              <UFormField label="Clé de liaison" name="fieldKey" required help="Minuscules et _ uniquement">
                <UInput v-model="newFieldKey" placeholder="ex: banner_title" class="w-full" />
              </UFormField>
            </div>

            <div class="mt-4 flex justify-end">
              <UButton
                color="neutral"
                size="sm"
                icon="i-heroicons-plus"
                :disabled="!newFieldLabel.trim() || !newFieldKey.trim()"
                @click="addField"
              >
                Ajouter le champ
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right Column: Page Settings -->
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Paramètres</h2>
          </template>

          <form @submit.prevent="savePage" class="space-y-4">
            <UAlert
              v-if="errorMessage"
              icon="i-heroicons-exclamation-triangle"
              color="error"
              variant="soft"
              :title="errorMessage"
            />
            <UAlert
              v-if="successMessage"
              icon="i-heroicons-check-circle"
              color="success"
              variant="soft"
              :title="successMessage"
            />

            <UFormField label="Titre de la page" name="title" required>
              <UInput v-model="title" required class="w-full" />
            </UFormField>

            <UFormField label="Slug URL" name="slug" required help="Utilisez / pour la page d'accueil">
              <UInput v-model="slug" required class="w-full" />
            </UFormField>

            <UButton
              type="submit"
              color="primary"
              block
              :loading="saving"
            >
              Enregistrer les modifications
            </UButton>
          </form>
        </UCard>
      </div>
    </div>
  </div>
</template>
