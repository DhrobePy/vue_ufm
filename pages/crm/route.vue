<template>
  <div class="space-y-4">
    <HubTabs hub="crm" />
    <UiPageHeader title="CRM — Route & territory" subtitle="Plan a day of visits, and see how well each district is covered" :breadcrumb="['CRM', 'Route']" />
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <template v-else-if="d">
      <div class="glass-card p-4 space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="section-title">Visit route</h2>
          <select v-model="startKey" class="field-input text-xs py-1.5 w-40"><option v-for="s in startsAll" :key="s.key" :value="s.key">Start: {{ s.label }}</option></select>
          <button class="btn-ghost text-xs" @click="myLoc">📍 Use my location</button>
          <button class="btn-gold text-xs" :disabled="!picked.length" @click="plan">Plan route ({{ picked.length }})</button>
          <span class="text-[11px] text-gray-500">{{ d.pinned }} places have an exact GPS pin; the rest sit at the middle of their district (≈). Pin a place by logging a visit with “Save as this place's location”.</span>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="max-h-96 overflow-y-auto border border-white/[0.06] rounded-lg">
            <label v-for="s in d.stops" :key="s.key" class="flex items-start gap-2 px-3 py-1.5 text-xs border-b border-white/[0.04] hover:bg-white/[0.03]" :class="s.lat == null ? 'opacity-40' : ''">
              <input v-model="sel[s.key]" type="checkbox" :disabled="s.lat == null" class="mt-0.5" />
              <span class="flex-1"><span class="text-gray-200">{{ s.name }}</span> <span class="text-gray-500">{{ s.district }}{{ s.exact ? '' : ' ≈' }}</span><br><span class="text-gray-500">{{ s.reason }}</span></span>
              <span class="text-[10px] text-gray-600">{{ s.tags.join(', ') }}</span></label>
            <p v-if="!d.stops.length" class="p-4 text-xs text-gray-600">Nothing needs a visit right now.</p>
          </div>
          <div>
            <div ref="mapEl" class="h-96 rounded-lg border border-white/[0.07] bg-white/[0.03]" />
          </div>
        </div>
        <div v-if="route.length" class="space-y-2">
          <p class="text-xs text-gray-300">{{ route.length }} stops · about {{ km }} km by road (straight-line distance + 30%, so a guide only). Order: nearest next stop from the start.</p>
          <ol class="list-decimal pl-5 text-xs text-gray-200 space-y-0.5"><li v-for="s in route" :key="s.key">{{ s.name }} <span class="text-gray-500">— {{ s.district }}{{ s.exact ? '' : ' ≈' }} · {{ s.reason }}</span></li></ol>
          <div class="flex flex-wrap gap-2"><a :href="gUrl" target="_blank" rel="noopener" class="btn-ghost text-xs">Open in Google Maps</a><button class="btn-gold text-xs" :disabled="tasking" @click="makeTasks">Make today's visit tasks</button></div>
        </div>
      </div>

      <div class="glass-card p-4 space-y-2 overflow-x-auto">
        <h2 class="section-title">Territory <span class="text-gray-600 font-normal">— by district, last 12 months</span></h2>
        <table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"><th class="px-3 py-2 text-left">District</th><th class="px-3 py-2 text-right">Customers</th><th class="px-3 py-2 text-right">Sales</th><th class="px-3 py-2 text-right">Share</th><th class="px-3 py-2 text-right">Slipping / dormant</th><th class="px-3 py-2 text-right">Risky</th><th class="px-3 py-2 text-right">Buyers not contacted in 60 d</th><th class="px-3 py-2 text-left">Looked after by</th><th v-if="isAdmin" class="px-3 py-2 text-left">Assign</th></tr></thead>
          <tbody><tr v-for="t in tr?.districts ?? []" :key="t.district" class="border-b border-white/[0.04]">
            <td class="px-3 py-2 text-gray-200">{{ t.district }}</td><td class="px-3 py-2 text-right">{{ t.customers }}</td><td class="px-3 py-2 text-right font-mono">{{ n0(t.value_12m) }}</td><td class="px-3 py-2 text-right">{{ t.share }}%</td>
            <td class="px-3 py-2 text-right" :class="t.slipping ? 'text-amber-300' : ''">{{ t.slipping }}</td><td class="px-3 py-2 text-right" :class="t.risky ? 'text-red-400' : ''">{{ t.risky }}</td>
            <td class="px-3 py-2 text-right" :class="t.not_contacted_60d && t.buyers ? 'text-amber-300' : ''">{{ t.not_contacted_60d }} / {{ t.buyers }}</td>
            <td class="px-3 py-2 text-gray-400">{{ t.owners.map((o: any) => `${o.name} (${o.n})`).join(', ') }}</td>
            <td v-if="isAdmin" class="px-3 py-2"><select class="field-input text-[11px] py-1 w-36" @change="assign(t.district, ($event.target as HTMLSelectElement))"><option value="">Choose person…</option><option value="0">— clear —</option><option v-for="u in tr.users" :key="u.id" :value="u.id">{{ u.name }}</option></select></td></tr></tbody></table>
        <p class="text-[11px] text-gray-600">Assigning sets “who looks after” for every customer of that district (only fills the CRM owner field; money and orders are untouched). Owners get a small boost in their own action list.</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()
const { data: d, pending, refresh } = await useFetch<any>('/api/crm/route', { lazy: true })
const { data: tr, refresh: refreshTr } = await useFetch<any>('/api/crm/territory', { lazy: true })
const isAdmin = computed(() => ['admin', 'superadmin'].includes(String((sessionUser.value as any)?.role ?? '').toLowerCase()))
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const sel = reactive<Record<string, boolean>>({}), startKey = ref('demra'), mine = ref<any>(null), route = ref<any[]>([]), tasking = ref(false)
const startsAll = computed(() => [...(d.value?.starts ?? []), ...(mine.value ? [mine.value] : [])])
const start = computed(() => startsAll.value.find((s: any) => s.key === startKey.value) ?? startsAll.value[0])
const picked = computed(() => (d.value?.stops ?? []).filter((s: any) => sel[s.key] && s.lat != null))
let map: any = null, layer: any = null
const mapEl = ref<HTMLElement | null>(null)
const hav = (a: any, b: any) => { const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r, x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)) }
// nearest-neighbour order — within ~20 % of the best possible for a day's worth of stops
const order = (from: any, stops: any[]) => { const left = [...stops], out: any[] = []; let cur = from; while (left.length) { let bi = 0; for (let i = 1; i < left.length; i++) if (hav(cur, left[i]) < hav(cur, left[bi])) bi = i; cur = left.splice(bi, 1)[0]; out.push(cur) } return out }
const km = computed(() => { let t = 0, cur = start.value; for (const s of route.value) { t += hav(cur, s); cur = s } return Math.round(t * 1.3) })
const gUrl = computed(() => { const pts = [start.value, ...route.value.slice(0, 9)].map((p: any) => `${p.lat},${p.lon}`); return `https://www.google.com/maps/dir/${pts.join('/')}` })
function loadLeaflet(): Promise<any> {
  const w = window as any
  if (w.L) return Promise.resolve(w.L)
  return new Promise((res, rej) => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css)
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'; s.onload = () => res(w.L); s.onerror = () => rej(new Error('The map library could not be loaded — check the internet connection')); document.head.appendChild(s)
  })
}
async function plan() {
  route.value = order(start.value, picked.value)
  try {
    const L = await loadLeaflet(); await nextTick()
    if (!map) { map = L.map(mapEl.value, { scrollWheelZoom: false }).setView([23.9, 90.2], 8); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(map) }
    layer?.remove(); layer = L.layerGroup().addTo(map)
    const pts = [start.value, ...route.value]
    L.polyline(pts.map((p: any) => [p.lat, p.lon]), { color: '#d4a017', weight: 3, opacity: 0.8 }).addTo(layer)
    pts.forEach((p: any, i: number) => L.marker([p.lat, p.lon], { icon: L.divIcon({ className: '', html: `<div style="background:${i ? '#d4a017' : '#16a34a'};color:#000;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font:700 11px sans-serif;border:2px solid #fff">${i || '●'}</div>`, iconSize: [22, 22] }) }).addTo(layer).bindPopup(i ? `${i}. ${esc(p.name)}` : esc(p.label ?? 'Start')))
    map.invalidateSize(); map.fitBounds(L.latLngBounds(pts.map((p: any) => [p.lat, p.lon])).pad(0.15)); map.invalidateSize()
  } catch (e: any) { toastError(e?.message ?? 'Map failed to open') }
}
const esc = (s: string) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
function myLoc() {
  navigator.geolocation?.getCurrentPosition(p => { mine.value = { key: 'me', label: 'My location', lat: p.coords.latitude, lon: p.coords.longitude }; startKey.value = 'me' }, () => toastError('Location permission was refused.'), { enableHighAccuracy: true, timeout: 15000 })
}
async function makeTasks() {
  tasking.value = true
  const due = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)
  try { for (const s of route.value) await $fetch('/api/crm/tasks', { method: 'POST', body: { party_type: s.party_type, party_id: s.id, kind: 'visit', title: `Visit: ${s.reason}`.slice(0, 280), due_date: due } }); success(`${route.value.length} visit tasks added for today`); await refresh() }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } finally { tasking.value = false }
}
async function assign(district: string, el: HTMLSelectElement) {
  const v = el.value; if (v === '') return
  if (!confirm(`Make ${el.options[el.selectedIndex].text} look after ALL customers in ${district}?`)) { el.value = ''; return }
  try { const r: any = await $fetch('/api/crm/territory/assign', { method: 'POST', body: { district, owner_user_id: Number(v) || null } }); success(`${r.updated} customers updated`); await refreshTr() } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') }
  el.value = ''
}
onBeforeUnmount(() => { map?.remove(); map = null })
</script>
