<template>
  <div class="flex h-screen overflow-hidden">

    <!-- ── Mobile backdrop ────────────────────────────── -->
    <Transition name="backdrop">
      <div v-if="mobileSidebarOpen"
           class="fixed inset-0 z-30 bg-black/60 lg:hidden"
           @click="mobileSidebarOpen = false" />
    </Transition>

    <!-- ── Sidebar ────────────────────────────────────── -->
    <AppSidebar
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileSidebarOpen"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
      @close-mobile="mobileSidebarOpen = false"
    />

    <!-- ── Main column ───────────────────────────────── -->
    <div
      class="flex flex-col flex-1 min-w-0 transition-all duration-300 ml-0"
      :class="sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'"
    >
      <!-- Topbar -->
      <AppTopbar
        :collapsed="sidebarCollapsed"
        @toggle-sidebar="onToggleSidebar"
      />

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6 animate-fade-in">
        <NuxtPage />
      </main>
    </div>

    <!-- Global overlays -->
    <GlobalSearch />
    <UiToastContainer />

  </div>
</template>

<script setup lang="ts">
const sidebarCollapsed  = ref(false)
const mobileSidebarOpen = ref(false)

// On mobile: open drawer. On desktop: collapse/expand.
function onToggleSidebar() {
  if (window.innerWidth < 1024) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

// Close mobile sidebar on route change
const route = useRoute()
watch(() => route.path, () => { mobileSidebarOpen.value = false })
</script>

<style scoped>
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.25s ease; }
.backdrop-enter-from, .backdrop-leave-to       { opacity: 0; }
</style>
