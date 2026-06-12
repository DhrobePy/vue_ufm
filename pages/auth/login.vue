<template>
  <div>
    <NuxtLayout name="auth">
      <div class="w-full max-w-md mx-auto px-4 animate-slide-up">

        <!-- Card -->
        <div class="relative rounded-3xl overflow-hidden"
             style="background: linear-gradient(145deg, rgba(28,24,20,0.9) 0%, rgba(18,15,12,0.95) 100%); border: 1px solid rgba(245,158,11,0.15); box-shadow: 0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,158,11,0.1);">

          <!-- Top gold shimmer line -->
          <div class="h-px w-full" style="background: linear-gradient(90deg, transparent, #f59e0b 40%, #fbbf24 60%, transparent);" />

          <div class="p-8">

            <!-- Logo + title -->
            <div class="flex flex-col items-center mb-8">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-glow-pulse"
                   style="background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 0 32px rgba(245,158,11,0.4);">
                <span class="font-display font-bold text-black text-2xl">U</span>
              </div>
              <h1 class="font-display font-bold text-2xl text-white tracking-tight">Welcome back</h1>
              <p class="text-sm text-gray-500 mt-1">Sign in to Ujjal FMC ERP</p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleLogin" class="space-y-4">

              <!-- Email -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email address</label>
                <div class="relative">
                  <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="admin@ujjalfmc.com"
                    class="input-glass pl-10"
                    :class="errors.email ? 'border-red-500/50 focus:ring-red-500/30' : ''"
                  />
                </div>
                <p v-if="errors.email" class="text-xs text-red-400">{{ errors.email }}</p>
              </div>

              <!-- Password -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                <div class="relative">
                  <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  </div>
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    class="input-glass pl-10 pr-10"
                    :class="errors.password ? 'border-red-500/50 focus:ring-red-500/30' : ''"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors duration-150"
                  >
                    <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                  </button>
                </div>
                <p v-if="errors.password" class="text-xs text-red-400">{{ errors.password }}</p>
              </div>

              <!-- Remember + forgot -->
              <div class="flex items-center justify-between pt-1">
                <label class="flex items-center gap-2 cursor-pointer group">
                  <input v-model="form.remember" type="checkbox"
                         class="w-4 h-4 rounded border-white/20 bg-white/[0.05] text-gold-500 focus:ring-gold-500/40" />
                  <span class="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">Remember me</span>
                </label>
                <button type="button" class="text-xs text-gold-500/80 hover:text-gold-400 transition-colors duration-150">
                  Forgot password?
                </button>
              </div>

              <!-- Error alert -->
              <Transition name="slide-up">
                <div v-if="loginError"
                     class="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm text-red-300"
                     style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);">
                  <svg class="w-4 h-4 shrink-0 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {{ loginError }}
                </div>
              </Transition>

              <!-- Submit -->
              <button
                type="submit"
                :disabled="loading"
                class="btn-gold w-full justify-center py-3 text-sm font-semibold mt-2"
              >
                <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2zm0 2a8 8 0 100 16A8 8 0 0012 4z" stroke-opacity=".2"/><path d="M12 2a10 10 0 0110 10h-2A8 8 0 0012 4V2z"/></svg>
                <span>{{ loading ? 'Signing in…' : 'Sign in' }}</span>
                <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>

            </form>

          </div>

          <!-- Footer -->
          <div class="px-8 pb-6 text-center">
            <p class="text-[11px] text-gray-700">
              Ujjal Flour Mills Company &copy; {{ new Date().getFullYear() }} · ERP v1.0
            </p>
          </div>

        </div>

        <!-- Bottom note -->
        <p class="text-center text-[11px] text-gray-700 mt-4">
          Secured with end-to-end session encryption
        </p>

      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const form = reactive({ email: '', password: '', remember: false })
const errors = reactive({ email: '', password: '' })
const loading = ref(false)
const loginError = ref('')
const showPassword = ref(false)

async function handleLogin() {
  errors.email = ''
  errors.password = ''
  loginError.value = ''

  if (!form.email) { errors.email = 'Email is required'; return }
  if (!form.password) { errors.password = 'Password is required'; return }

  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: form.email, password: form.password },
    })
    // Hard redirect — forces the browser to send the session cookie with a
    // fresh GET request so Nuxt SSR can hydrate the session on the server side.
    // This avoids any client-side loggedIn state race with the auth middleware.
    // Root (/) resolves the user's permissions and lands them on their first
    // allowed page — admins get /dashboard, restricted users their module.
    window.location.href = '/'
  } catch (e: any) {
    loading.value = false
    loginError.value = e?.data?.statusMessage || e?.data?.message || 'Invalid email or password'
  }
}
</script>

<style scoped>
.slide-up-enter-active { transition: all 0.2s ease-out; }
.slide-up-leave-active { transition: all 0.15s ease-in; }
.slide-up-enter-from  { opacity: 0; transform: translateY(6px); }
.slide-up-leave-to    { opacity: 0; }
</style>
