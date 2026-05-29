<template>
  <div class="space-y-6">
    <UiPageHeader title="Admin" subtitle="Users · employees · audit trail · system settings" :breadcrumb="['Admin']" />

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Users"    :value="String(stats.total_users ?? 0)"      trend="registered"      trend-up  icon="users" color="blue" />
        <KpiCard label="Active Users"   :value="String(stats.active_users ?? 0)"     trend="online capable"  trend-up  icon="check" color="teal" />
        <KpiCard label="Audit Events"   :value="String(stats.audit_this_month ?? 0)" trend="This month"      trend-up  icon="list"  color="gold" />
        <KpiCard label="Warnings 24h"   :value="String(stats.warnings_24h ?? 0)"     trend="security alerts" :trend-up="false" icon="cog" color="red" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Users -->
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="section-title">System Users</h2>
            <NuxtLink to="/admin/users" class="text-xs text-gold-500 hover:text-gold-400 font-medium">Manage →</NuxtLink>
          </div>
          <div class="space-y-2">
            <div v-for="u in users" :key="u.id"
                 class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
                   style="background:linear-gradient(135deg,#f59e0b,#d97706);">
                {{ (u.display_name || 'U')[0] }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-200 truncate">{{ u.display_name }}</p>
                <p class="text-xs text-gray-500">{{ u.role }}{{ u.branch_name ? ' · ' + u.branch_name : '' }}</p>
              </div>
              <UiStatusBadge :status="u.status" />
            </div>
            <div v-if="!users.length" class="text-xs text-center text-gray-600 py-4">No users found</div>
          </div>
        </div>

        <!-- Recent audit -->
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="section-title">Audit Trail</h2>
            <NuxtLink to="/admin/audit" class="text-xs text-gold-500 hover:text-gold-400 font-medium">View all →</NuxtLink>
          </div>
          <div class="space-y-2.5">
            <div v-for="log in recentAudit" :key="log.id" class="flex gap-3">
              <div :class="['w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                log.severity==='warning' ? 'bg-yellow-400' :
                log.severity==='error'   ? 'bg-red-400'    : 'bg-emerald-400']" />
              <div>
                <p class="text-xs text-gray-300">{{ log.description }}</p>
                <p class="text-[11px] text-gray-600">
                  {{ log.user_name }} · {{ timeAgo(log.created_at) }}
                </p>
              </div>
            </div>
            <div v-if="!recentAudit.length" class="text-xs text-center text-gray-600 py-4">No audit events</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data, pending, error } = await useFetch('/api/admin/dashboard')

const stats       = computed(() => (data.value?.stats       ?? {}) as any)
const users       = computed(() => (data.value?.users       ?? []) as any[])
const recentAudit = computed(() => (data.value?.recentAudit ?? []) as any[])

function timeAgo(dateStr: string): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
</script>
