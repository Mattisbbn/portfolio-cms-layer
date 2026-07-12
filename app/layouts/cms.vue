<script setup>
const isCollapsed = ref(false)
const { user, loggedIn, clear } = useUserSession()



const handleLogout = async () => {
  try {
    await $fetch('/api/cms/auth/logout', { method: 'POST' })
  } catch (err) {
    console.error('Logout error:', err)
  }
  await clear()
  navigateTo('/auth/login')
}

const userMenuActions = [
  [
    {
      label: 'Paramètres du profil',
      icon: 'i-heroicons-user',
      onSelect: () => navigateTo('/cms/profile')
    }
  ],
  [
    {
      label: 'Déconnexion',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      onSelect: handleLogout
    }
  ]
]

const mainLinks = [
  {
    label: 'Tableau de bord',
    icon: 'i-heroicons-squares-2x2',
    to: '/cms'
  }
]

const { data: pagesList, refresh: refreshPages } = await useFetch('/api/cms/pages')
const localPages = ref([])

watch(pagesList, (newVal) => {
  if (newVal) {
    localPages.value = [...newVal]
  }
}, { immediate: true })

const isCreateModalOpen = ref(false)
const isCreating = ref(false)
const newPageTitle = ref('')
const newPageSlug = ref('')

const openCreateModal = () => {
  newPageTitle.value = ''
  newPageSlug.value = ''
  isCreateModalOpen.value = true
}

const createPage = async () => {
  if (!newPageTitle.value.trim() || !newPageSlug.value.trim()) return
  isCreating.value = true
  try {
    const res = await $fetch('/api/cms/pages', {
      method: 'POST',
      body: {
        title: newPageTitle.value.trim(),
        slug: newPageSlug.value.trim()
      }
    })
    isCreateModalOpen.value = false
    await refreshPages()
    navigateTo(`/cms/pages/${res.id}`)
  } catch (err) {
    console.error('Error creating page:', err)
  } finally {
    isCreating.value = false
  }
}

// Drag & Drop / Reordering mode
const isReorderMode = ref(false)
const draggedIndex = ref(null)

const toggleReorderMode = () => {
  isReorderMode.value = !isReorderMode.value
}

const onDragStart = (index, event) => {
  if (!isReorderMode.value) return
  draggedIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index)
}

const onDragOver = (index, event) => {
  if (!isReorderMode.value || draggedIndex.value === null) return
  event.preventDefault()
}

const onDrop = async (index, event) => {
  if (!isReorderMode.value || draggedIndex.value === null) return
  event.preventDefault()
  
  if (draggedIndex.value !== index) {
    const item = localPages.value.splice(draggedIndex.value, 1)[0]
    localPages.value.splice(index, 0, item)
    
    // Save to server
    try {
      await $fetch('/api/cms/pages/reorder', {
        method: 'PATCH',
        body: {
          ids: localPages.value.map(p => p.id)
        }
      })
    } catch (err) {
      console.error('Failed to save pages order:', err)
      await refreshPages()
    }
  }
}

const onDragEnd = () => {
  draggedIndex.value = null
}

const colorMode = useColorMode()
const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})
</script>

<template>
  <div class="flex h-screen w-full bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 antialiased overflow-hidden">
    <aside
      :class="[
        isCollapsed ? 'w-20' : 'w-64',
        'bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex flex-col justify-between transition-all duration-300 ease-in-out relative z-10'
      ]"
    >
      <button
        @click="isCollapsed = !isCollapsed"
        class="absolute -right-3 top-1/2 -translate-y-1/2 bg-primary-500 hover:bg-primary-600 text-gray-950 rounded-full p-1 border border-gray-200 dark:border-gray-800 transition shadow-md"
      >
        <UIcon :name="isCollapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'" class="w-4 h-4 block" />
      </button>

      <div class="flex flex-col min-h-0">
        <header class="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-center">
          <UDropdownMenu :items="userMenuActions" :content="{ align: 'start', side: 'bottom' }" class="w-full">
            <div
              :class="[
                'flex items-center gap-3 w-full cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition',
                isCollapsed ? 'justify-center' : ''
              ]"
            >
              <UAvatar src="https://avatars.githubusercontent.com/u/1?v=4" alt="Avatar" size="sm" class="ring-2 ring-primary-500/20" />
              <div v-if="!isCollapsed" class="flex flex-col min-w-0 text-left">
                <span class="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{{ user.name }}</span>
                <span class="text-xs text-gray-500 truncate">{{ user.email }}</span>
              </div>
            </div>
          </UDropdownMenu>
        </header>

        <nav class="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
          <UNavigationMenu :items="mainLinks" orientation="vertical" :collapsed="isCollapsed" class="w-full" />
          
          <!-- Section Pages -->
          <div class="mt-4">
            <div
              :class="[
                'px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center',
                isCollapsed ? 'justify-center' : 'justify-between'
              ]"
            >
              <span v-if="!isCollapsed">Pages</span>
              <UIcon v-else name="i-heroicons-document-duplicate" class="w-4 h-4 text-gray-500" />
              <div v-if="!isCollapsed" class="flex items-center gap-1">
                <UButton
                  :icon="isReorderMode ? 'i-heroicons-check' : 'i-heroicons-arrows-up-down'"
                  size="2xs"
                  color="neutral"
                  variant="ghost"
                  :class="isReorderMode ? 'text-primary-500' : ''"
                  @click="toggleReorderMode"
                  title="Réorganiser"
                />
                <UButton
                  icon="i-heroicons-plus"
                  size="2xs"
                  color="neutral"
                  variant="ghost"
                  @click="openCreateModal"
                  title="Créer une page"
                />
              </div>
            </div>
            <ul class="mt-2 space-y-1" @dragover.prevent>
              <li
                v-for="(page, index) in localPages"
                :key="page.id"
                :draggable="isReorderMode"
                @dragstart="onDragStart(index, $event)"
                @dragover="onDragOver(index, $event)"
                @drop="onDrop(index, $event)"
                @dragend="onDragEnd"
                :class="[
                  'group relative flex items-center gap-3 text-sm px-2.5 py-2 rounded-lg transition',
                  isReorderMode ? 'cursor-grab active:cursor-grabbing border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30' : 'hover:bg-gray-100/60 dark:hover:bg-gray-800/60 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                  isCollapsed ? 'justify-center' : '',
                  draggedIndex === index ? 'opacity-40 border-primary-500 dark:border-primary-500' : ''
                ]"
              >
                <UIcon
                  :name="isReorderMode ? 'i-heroicons-bars-3' : 'i-heroicons-document-text'"
                  :class="[
                    'w-5 h-5 transition-transform',
                    isReorderMode ? 'text-gray-400 drag-handle' : 'text-primary-500 group-hover:scale-110'
                  ]"
                />
                <span v-if="!isCollapsed" class="truncate flex-1">{{ page.title }}</span>
                <span v-if="!isCollapsed && !isReorderMode && $route.path === `/cms/pages/${page.id}`" class="w-1.5 h-1.5 rounded-full bg-primary-500" />
                <NuxtLink v-if="!isReorderMode" :to="`/cms/pages/${page.id}`" class="absolute inset-0 z-10" />
              </li>
              <li v-if="localPages.length === 0 && !isCollapsed" class="text-xs text-gray-400 dark:text-gray-500 px-3 py-2 italic text-center">
                Aucune page
              </li>
            </ul>
          </div>

          <div>
            <div
              :class="[
                'px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center',
                isCollapsed ? 'justify-center' : 'justify-between'
              ]"
            >
              <span v-if="!isCollapsed">Collections</span>
              <UIcon v-else name="i-heroicons-folder-open" class="w-4 h-4 text-gray-500" />
              <UButton v-if="!isCollapsed" icon="i-heroicons-plus" size="2xs" color="neutral" variant="ghost" />
            </div>
            <ul class=" mt-2">
              <!-- <li>
                <NuxtLink
                  to="/cms/collection/projets-web"
                  :class="[
                    'flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-2.5 py-2 rounded-lg hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition group',
                    isCollapsed ? 'justify-center' : ''
                  ]"
                >
                  <UIcon name="i-heroicons-folder" class="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform" />
                  <span v-if="!isCollapsed" class="truncate flex-1">Projets Web</span>
                  <UBadge v-if="!isCollapsed" color="neutral" variant="solid" size="xs" class="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">4</UBadge>
                </NuxtLink>
              </li> -->
            </ul>
          </div>
        </nav>
      </div>

      <footer class="p-3 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2 bg-gray-50/50 dark:bg-gray-900/50">
    
        <ClientOnly>
          <UButton
            :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
            color="neutral"
            variant="ghost"
            :block="!isCollapsed"
            :class="[isCollapsed ? 'justify-center p-2' : 'justify-start']"
            @click="isDark = !isDark"
          >
            <span v-if="!isCollapsed">{{ isDark ? 'Mode sombre' : 'Mode clair' }}</span>
          </UButton>
        </ClientOnly>
      </footer>
    </aside>

    <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6">
      <slot />
    </main>

    <!-- Modal pour créer une page -->
    <UModal v-model:open="isCreateModalOpen" title="Créer une page" description="Remplissez les détails pour créer une nouvelle page.">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Titre de la page" name="title" required>
            <UInput v-model="newPageTitle" placeholder="ex: À propos" class="w-full" required />
          </UFormField>
          <UFormField label="Slug URL" name="slug" required help="Utilisez / pour la page d'accueil">
            <UInput v-model="newPageSlug" placeholder="ex: a-propos ou /" class="w-full" required />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="isCreateModalOpen = false">Annuler</UButton>
          <UButton color="primary" :loading="isCreating" :disabled="!newPageTitle.trim() || !newPageSlug.trim()" @click="createPage">Créer la page</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
