export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  // Protect all /cms routes
  if (to.path.startsWith('/cms') && !loggedIn.value) {
    return navigateTo('/auth/login')
  }

  // Redirect logged-in users away from the login page
  if (to.path === '/auth/login' && loggedIn.value) {
    return navigateTo('/cms')
  }
})
