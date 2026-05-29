<template>
  <header
    class="h-16 shrink-0 flex items-center gap-4 px-6 relative z-30"
    :style="`background: var(--topbar-bg); backdrop-filter: blur(16px); border-bottom: 1px solid rgb(var(--tint)/0.07);`"
  >
    <!-- Sidebar toggle -->
    <button
      @click="$emit('toggle-sidebar')"
      class="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] transition-all duration-150 shrink-0"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"/>
      </svg>
    </button>

    <!-- Breadcrumb -->
    <div class="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
      <span class="text-gray-600 truncate">{{ currentModule }}</span>
      <span v-if="currentPage" class="text-gray-700">/</span>
      <span v-if="currentPage" class="text-gray-300 font-medium truncate">{{ currentPage }}</span>
    </div>

    <div class="flex-1" />

    <!-- Global search trigger (⌘K) -->
    <button
      @click="searchStore.show()"
      class="hidden md:flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 transition-all duration-150 hover:text-gray-300 hover:bg-white/[0.05] shrink-0"
      style="border: 1px solid rgba(255,255,255,0.07); min-width: 200px;"
    >
      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <span class="flex-1 text-left text-xs">Quick search…</span>
      <kbd class="text-[10px] font-mono text-gray-600 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">⌘K</kbd>
    </button>

    <!-- Theme picker button -->
    <button
      @click="themeStore.openPicker()"
      class="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] transition-all duration-150 shrink-0"
      title="Appearance settings"
    >
      <!-- Paint palette icon -->
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-.5c0-.28-.11-.53-.29-.71-.18-.18-.29-.43-.29-.71 0-.55.45-1 1-1h1.17c2.76 0 5.12-1.93 5.12-5C21 6.48 17.04 2 12 2z"/>
        <circle cx="7" cy="11.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="10" cy="8" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="14" cy="8" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="17" cy="11.5" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    </button>

    <!-- Notification bell -->
    <div class="relative">
      <button
        @click="notifOpen = !notifOpen"
        class="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] transition-all duration-150"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <!-- Unread badge -->
        <span v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[10px] font-bold px-1"
              :style="`background: linear-gradient(135deg, var(--accent-from), var(--accent-to)); color: var(--accent-text)`">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <!-- Notification dropdown -->
      <Transition name="dropdown">
        <div v-if="notifOpen" v-click-outside="() => notifOpen = false"
             class="absolute right-0 top-full mt-2 w-84 rounded-2xl overflow-hidden z-50"
             style="background: rgba(22,22,22,0.97); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 16px 48px rgba(0,0,0,0.6); width:340px">
          <div class="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <p class="text-sm font-semibold text-gray-200">Notifications</p>
            <div class="flex items-center gap-2">
              <span v-if="unreadCount > 0"
                    class="badge text-[10px] px-2 py-0.5 rounded-full font-bold"
                    :style="`background:linear-gradient(135deg,var(--accent-from),var(--accent-to));color:var(--accent-text)`">
                {{ unreadCount }} new
              </span>
              <button v-if="unreadCount > 0"
                      @click="markAllRead"
                      class="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
                Mark all read
              </button>
            </div>
          </div>
          <div class="divide-y divide-white/[0.04] max-h-72 overflow-y-auto">
            <div v-for="n in notifications" :key="n.id"
                 @click="goNotif(n)"
                 class="flex gap-3 px-4 py-3 cursor-pointer transition-colors group"
                 :class="n.read ? 'opacity-60 hover:opacity-80' : 'hover:bg-white/[0.04]'">
              <!-- Type dot -->
              <div class="w-2 h-2 rounded-full mt-1.5 shrink-0 transition-transform group-hover:scale-125"
                   :class="n.type === 'warning' ? 'bg-yellow-400' : n.type === 'error' ? 'bg-red-400' : n.type === 'info' ? 'bg-blue-400' : 'bg-emerald-400'" />
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-300 leading-snug">{{ n.text }}</p>
                <p class="text-[10px] text-gray-600 mt-0.5">{{ n.time }}</p>
              </div>
              <!-- Unread dot -->
              <div v-if="!n.read" class="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5 shrink-0" />
              <!-- Arrow -->
              <svg class="w-3 h-3 text-gray-700 mt-1.5 shrink-0 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
            <div v-if="!notifications.length" class="px-4 py-8 text-center text-xs text-gray-600">
              No notifications
            </div>
          </div>
          <div class="px-4 py-2.5 border-t border-white/[0.06] flex justify-between items-center">
            <NuxtLink to="/admin/audit" @click="notifOpen = false"
                      class="text-xs text-gold-400 hover:text-gold-300 transition-colors">
              View full audit log →
            </NuxtLink>
            <button v-if="notifications.length" @click="notifications = []" class="text-[10px] text-gray-600 hover:text-gray-400">Clear</button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Date/time -->
    <div class="hidden lg:flex flex-col items-end shrink-0">
      <span class="text-xs font-medium text-gray-300">{{ formattedDate }}</span>
      <span class="text-[11px] text-gray-600">{{ formattedTime }}</span>
    </div>

    <!-- User avatar + dropdown -->
    <div class="relative">
      <button
        @click="dropdownOpen = !dropdownOpen"
        class="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-white/[0.07] transition-all duration-150 shrink-0"
      >
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
             :style="`background: linear-gradient(135deg, var(--accent-from), var(--accent-to)); color: var(--accent-text)`">
          {{ userInitials }}
        </div>
        <div class="hidden md:flex flex-col items-start">
          <span class="text-xs font-semibold text-gray-200 leading-tight">{{ sessionUser?.name || 'User' }}</span>
          <span class="text-[10px] text-gray-500 leading-tight font-mono">{{ sessionUser?.role || '' }}</span>
        </div>
        <svg class="w-3 h-3 text-gray-600 ml-0.5 hidden md:block" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <!-- User dropdown -->
      <Transition name="dropdown">
        <div v-if="dropdownOpen" v-click-outside="() => dropdownOpen = false"
             class="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50"
             style="background: rgba(22,22,22,0.97); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 16px 48px rgba(0,0,0,0.6);">
          <div class="p-3 border-b border-white/[0.06]">
            <p class="text-sm font-semibold text-gray-100">{{ sessionUser?.name }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ sessionUser?.email }}</p>
            <p class="text-[10px] font-mono text-gold-500/80 mt-0.5">{{ sessionUser?.role }}</p>
          </div>
          <div class="p-1.5 space-y-0.5">
            <NuxtLink to="/admin/settings"
              class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-white/[0.06] transition-all duration-150">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
              Settings
            </NuxtLink>
            <button
              class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-white/[0.06] transition-all duration-150"
              @click="themeStore.openPicker(); dropdownOpen = false">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-.5c0-.28-.11-.53-.29-.71-.18-.18-.29-.43-.29-.71 0-.55.45-1 1-1h1.17c2.76 0 5.12-1.93 5.12-5C21 6.48 17.04 2 12 2z"/>
                <circle cx="7" cy="11.5" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="10" cy="8" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="14" cy="8" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="17" cy="11.5" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
              Appearance
            </button>
            <button
              class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-white/[0.06] transition-all duration-150"
              @click="searchStore.show(); dropdownOpen = false">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Search <kbd class="ml-auto text-[10px] font-mono text-gray-600">⌘K</kbd>
            </button>
          </div>
          <div class="p-1.5 border-t border-white/[0.06]">
            <button @click="handleLogout"
              class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/></svg>
              Sign out
            </button>
          </div>
        </div>
      </Transition>
    </div>

  </header>

  <!-- Theme picker panel (Teleports to body) -->
  <ThemePicker />
</template>

<script setup lang="ts">
defineProps<{ collapsed: boolean }>()
defineEmits(['toggle-sidebar'])

const route  = useRoute()
const router = useRouter()
const { user: sessionUser, clear } = useUserSession()
const searchStore = useGlobalSearch()
const themeStore  = useTheme()
const { success } = useToast()

const dropdownOpen = ref(false)
const notifOpen    = ref(false)

// Initialise theme on mount
onMounted(() => themeStore.init())

// User display
const userInitials = computed(() => {
  const name = sessionUser.value?.name || 'U'
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
})

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  await clear()
  await navigateTo('/auth/login')
}

// Breadcrumb
const routeSegments = computed(() => route.path.split('/').filter(Boolean))
const currentModule = computed(() => {
  const seg = routeSegments.value[0]
  if (!seg) return 'Home'
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
})
const currentPage = computed(() => {
  const seg = routeSegments.value[1]
  if (!seg) return ''
  if (/^\d+$/.test(seg)) return `#${seg}`
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
})

// Clock
const now = ref(new Date())
let clockInterval: ReturnType<typeof setInterval>
onMounted(() => { clockInterval = setInterval(() => { now.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(clockInterval))
const formattedDate = computed(() => now.value.toLocaleDateString('en-BD', { weekday: 'short', day: 'numeric', month: 'short' }))
const formattedTime = computed(() => now.value.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }))

// ── Notifications ─────────────────────────────────────
interface Notification {
  id: number
  text: string
  type: 'warning' | 'error' | 'success' | 'info'
  time: string
  route: string
  read: boolean
}

const notifications = ref<Notification[]>([])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function goNotif(n: Notification) {
  n.read = true
  notifOpen.value = false
  router.push(n.route)
}

function markAllRead() {
  notifications.value.forEach(n => (n.read = true))
}

// Click-outside directive
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el._clickOutside = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) binding.value(e)
    }
    document.addEventListener('click', el._clickOutside, true)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', (el as any)._clickOutside, true)
  },
}
</script>

<style scoped>
.dropdown-enter-active { transition: all 0.15s ease-out; }
.dropdown-leave-active { transition: all 0.1s ease-in; }
.dropdown-enter-from   { opacity: 0; transform: translateY(-6px) scale(0.97); }
.dropdown-leave-to     { opacity: 0; transform: translateY(-4px) scale(0.98); }
</style>
