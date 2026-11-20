<template>
  <ReportFrame title="Role Access Matrix" subtitle="Which modules each role's users can open — from the live permissions the app enforces" :period="today" filename="role-access-matrix" :sheets="sheets">
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <template v-else-if="data">
      <div class="no-print flex flex-wrap gap-4 text-xs text-gray-500">
        <span><span class="inline-block w-3 h-3 rounded bg-emerald-500 align-middle mr-1" />All users of the role</span>
        <span><span class="inline-block w-3 h-3 rounded bg-amber-400 align-middle mr-1" />Some users</span>
        <span><span class="inline-block w-3 h-3 rounded bg-gray-600 align-middle mr-1" />None</span>
        <span>🛡 = users on the role's default access (no personal permission set)</span>
      </div>
      <div class="glass-card overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500">
            <th class="px-3 py-2 text-left">Role</th><th class="px-3 py-2 text-center">Users</th>
            <th v-for="(l, k) in data.modules" :key="k" class="px-2 py-2 text-center whitespace-nowrap">{{ l }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in data.roles" :key="r.role" class="border-b border-white/[0.04]">
              <td class="px-3 py-2 font-semibold text-gray-200 whitespace-nowrap">{{ r.role }} <span v-if="r.presetUsers" :title="`${r.presetUsers} user(s) on role-default access`">🛡</span></td>
              <td class="px-3 py-2 text-center text-gray-500">{{ r.users }}</td>
              <td v-for="(l, k) in data.modules" :key="k" class="px-2 py-2 text-center">
                <span class="inline-block min-w-[2.5rem] px-2 py-0.5 rounded text-[11px] font-bold" :class="cls(r, String(k))">{{ txt(r, String(k)) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="no-print text-[11px] text-gray-600">Admin and Superadmin always have every module. Set exact access per user under Admin → Users → Permissions.</p>
    </template>
  </ReportFrame>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const today = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)
const { data, pending } = await useFetch<any>('/api/admin/role-matrix')
const cnt = (r: any, k: string) => Number(r.mods[k] ?? 0)
const cls = (r: any, k: string) => cnt(r, k) >= r.users && r.users > 0 ? 'bg-emerald-500 text-white' : cnt(r, k) > 0 ? 'bg-amber-400 text-white' : 'bg-white/10 text-gray-500'
const txt = (r: any, k: string) => cnt(r, k) >= r.users && r.users > 0 ? 'All' : cnt(r, k) > 0 ? `${cnt(r, k)}/${r.users}` : '—'
const sheets = computed(() => data.value ? [{ name: 'Role access', cols: [{ key: 'role', label: 'Role' }, { key: 'users', label: 'Users', fmt: 'qty' as const }, ...Object.entries(data.value.modules).map(([k, l]) => ({ key: k, label: String(l) }))],
  rows: data.value.roles.map((r: any) => ({ role: r.role, users: r.users, ...Object.fromEntries(Object.keys(data.value.modules).map(k => [k, txt(r, k)])) })) }] : [])
</script>
