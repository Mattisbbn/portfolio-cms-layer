<script setup>
definePageMeta({
  layout: false
})

const credentials = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const { fetch: fetchSession } = useUserSession()

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    await $fetch('/api/cms/auth/login', {
      method: 'POST',
      body: credentials.value
    })
    
    await fetchSession()
    navigateTo('/cms')
  } catch (error) {
    errorMessage.value = error.data?.message || 'Identifiants invalides'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center  p-4">
    <UCard class="w-full max-w-md ">
      <template #header>
        <div class="text-center">
          <h1 class="text-xl font-bold ">Connexion au CMS</h1>
          <p class="text-sm mt-1">Accéder à la gestion de votre portfolio</p>
        </div>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <UAlert
          v-if="errorMessage"
          icon="i-heroicons-exclamation-triangle"
          color="error"
          variant="soft"
          :title="errorMessage"
        />

        <UFormField label="Adresse Email" name="email" eager class="w-full">
          <UInput 
            v-model="credentials.email" 
            type="email" 
            placeholder="admin@portfolio.com" 
            icon="i-heroicons-envelope"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField label="Mot de passe" name="password" eager class="w-full">
          <UInput 
            v-model="credentials.password" 
            type="password" 
            placeholder="••••••••" 
            icon="i-heroicons-lock-closed"
            required
            class="w-full"
          />
        </UFormField>

        <UButton 
          type="submit" 
          block 
          color="primary" 
          :loading="loading"
        >
          Se connecter
        </UButton>
      </form>
    </UCard>
  </div>
</template>