<template>
  <div class="space-y-6">
    <UiPageHeader title="Fleet Reports" :breadcrumb="['Fleet','Reports']" />

    <!-- Report cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink v-for="r in reports" :key="r.title" :to="r.to" class="glass-card p-5 hover:ring-1 hover:ring-white/[0.12] transition-all cursor-pointer group">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :class="r.bg">{{ r.icon }}</div>
          <div>
            <p class="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{{ r.title }}</p>
            <p class="text-xs text-gray-600">{{ r.desc }}</p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const reports = [
  { title: 'Trip Summary',          desc: 'Revenue, expenses, driver performance',   to: '/fleet/reports/trips',        icon: '🚛', bg: 'bg-blue-500/20' },
  { title: 'Vehicle Utilisation',   desc: 'Fleet availability and usage analytics', to: '/fleet/reports/vehicles',     icon: '📊', bg: 'bg-teal-500/20' },
  { title: 'Fuel Efficiency',       desc: 'Mileage, consumption by vehicle',         to: '/fleet/reports/fuel',         icon: '⛽', bg: 'bg-amber-500/20' },
  { title: 'Maintenance Summary',   desc: 'Repair costs, downtime by vehicle',       to: '/fleet/reports/maintenance',  icon: '🔧', bg: 'bg-orange-500/20' },
  { title: 'Driver Performance',    desc: 'Trips, on-time, complaints by driver',    to: '/fleet/reports/drivers',      icon: '👤', bg: 'bg-purple-500/20' },
  { title: 'Monthly P&L',           desc: 'Revenue vs cost for the period',          to: '/fleet/reports/pnl',          icon: '💰', bg: 'bg-emerald-500/20' },
]
</script>
