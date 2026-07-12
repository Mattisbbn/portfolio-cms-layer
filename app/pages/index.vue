<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div class="max-w-md w-full text-center space-y-6">
      <h1 class="text-4xl font-bold text-gray-900 tracking-tight">Mon Portfolio</h1>
      <p class="text-gray-600">Bienvenue sur mon espace de projets. Le contenu ici est dynamique et administrable.</p>

      <div class="pt-6">
        <UButton to="/auth/login" icon="i-heroicons-arrow-right-on-rectangle" size="md" variant="solid">Accéder au CMS</UButton>
      </div>
    </div>
  </div>
</template>
