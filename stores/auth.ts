export const useAuthStore = defineStore('auth', () => {
  const user = ref<null | {
    id: number
    name: string
    email: string
    role: string
    branch: string
    avatar: string
  }>(null)

  const isLoggedIn = computed(() => !!user.value)

  function setUser(u: typeof user.value) {
    user.value = u
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    user.value = null
    await navigateTo('/auth/login')
  }

  return { user, isLoggedIn, setUser, logout }
})
