<template>
  <div class="flex h-screen overflow-hidden bg-surface-500">

    <!-- ── Sidebar ────────────────────────────────────── -->
    <AppSidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />

    <!-- ── Main column ───────────────────────────────── -->
    <div
      class="flex flex-col flex-1 min-w-0 transition-all duration-300"
      :class="sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'"
    >
      <!-- Topbar -->
      <AppTopbar
        :collapsed="sidebarCollapsed"
        @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
      />

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto px-6 py-6 animate-fade-in">
        <NuxtPage />
      </main>
    </div>

    <!-- Global overlays -->
    <GlobalSearch />
    <UiToastContainer />

  </div>
</template>

<script setup lang="ts">
const sidebarCollapsed = ref(false)
</script>
