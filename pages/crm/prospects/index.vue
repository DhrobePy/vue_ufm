<template>
  <div class="space-y-4">
    <HubTabs hub="crm" />
    <UiPageHeader title="Prospects" subtitle="New customers to win — assessed before we open credit" :breadcrumb="['CRM', 'Prospects']">
      <template #actions>
        <button class="btn-ghost text-xs mr-2" @click="finding = !finding">{{ finding ? 'Close search' : '🔎 Find prospects' }}</button>
        <button class="btn-gold text-xs" @click="adding = !adding">{{ adding ? 'Close' : '+ Add prospect' }}</button>
      </template>
    </UiPageHeader>

    <div v-if="finding" class="glass-card p-4 space-y-3">
      <div class="text-[11px] text-gray-500">Searches public business listings (OpenStreetMap; Google Places if a key is set). Only the business type and area are sent out. Contact details on listings are often missing or stale — verify before calling. Nothing is saved until you pick it.</div>
      <div class="flex flex-wrap items-center gap-2">
        <select v-model="q.district" class="field-input text-xs w-40"><option v-for="a in areas" :key="a" :value="a">{{ a }}</option></select>
        <label v-for="(label, k) in kinds" :key="k" class="text-xs text-gray-400 flex items-center gap-1"><input v-model="q.kinds" type="checkbox" :value="k" />{{ label }}</label>
        <button class="btn-gold text-xs" :disabled="searching || !q.kinds.length" @click="search">{{ searching ? 'Searching… (up to a minute)' : 'Search' }}</button>
      </div>
      <div v-if="found">
        <div class="text-xs text-gray-400 mb-2">{{ found.candidates.length }} new · {{ found.already_known }} already customers/prospects hidden · {{ found.with_phone }} with phone · {{ found.with_address }} with address · source: {{ found.source }}</div>
        <div class="flex items-center gap-2 mb-2">
          <button class="btn-ghost text-xs" @click="showMap ? closeMap() : drawMap()">{{ showMap ? 'Hide map' : '🗺 Show all on map' }}</button>
          <span class="text-[10px] text-gray-600">{{ found.candidates.filter((c: any) => c.lat != null).length }} of {{ found.candidates.length }} have a map position</span>
        </div>
        <div v-if="showMap" ref="mapEl" class="h-96 w-full rounded-xl border border-white/[0.07] mb-2 z-0"></div>
        <div class="max-h-96 overflow-auto border border-white/[0.07] rounded-xl">
          <table class="w-full text-xs"><tbody>
            <tr v-for="(c, i) in found.candidates" :key="i" class="border-b border-white/[0.04]">
              <td class="px-2 py-1.5 whitespace-nowrap"><input v-model="picked" type="checkbox" :value="i" /> <button class="ml-1" title="Show this pin on the map" @click="drawMap(i)">📍</button> <a :href="gmaps(c)" target="_blank" rel="noopener" class="text-[10px] text-gray-500 hover:underline" title="Open in Google Maps">Google↗</a></td>
              <td class="px-2 py-1.5"><a :href="c.source_url" target="_blank" rel="noopener" class="text-gold-400 hover:underline">{{ c.name }}</a><div class="text-[10px] text-gray-600">{{ c.segment }}</div></td>
              <td class="px-2 py-1.5 text-gray-400">{{ c.phone || '—' }}</td><td class="px-2 py-1.5 text-gray-500">{{ c.address || '—' }}</td>
            </tr>
          </tbody></table>
        </div>
        <button class="btn-gold text-xs mt-2" :disabled="!picked.length || busy" @click="savePicked">Add {{ picked.length }} selected as prospects</button>
      </div>
    </div>

    <div v-if="adding" class="glass-card p-4 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input v-model="n.name" class="field-input text-xs" placeholder="Name *" /><input v-model="n.business_name" class="field-input text-xs" placeholder="Business name" />
        <select v-model="n.segment" class="field-input text-xs"><option value="">Business type (guess if blank)</option><option v-for="s in segments" :key="s" :value="s">{{ s }}</option></select>
        <input v-model="n.phone" class="field-input text-xs" placeholder="Phone" /><input v-model="n.address" class="field-input text-xs sm:col-span-2" placeholder="Address / area" />
        <input v-model="n.source" class="field-input text-xs" placeholder="Where did you hear of them?" /><input v-model="n.source_url" class="field-input text-xs sm:col-span-2" placeholder="Link (page / listing), if found online" />
      </div>
      <button class="btn-gold text-xs" :disabled="!n.name.trim() || busy" @click="add">Save prospect</button>
    </div>

    <div class="flex flex-wrap gap-1.5"><button v-for="s in stages" :key="s" class="px-3 py-1.5 rounded-xl text-xs border" :class="stage === s ? 'bg-gold-500/15 text-gold-400 border-gold-500/25' : 'text-gray-500 border-white/[0.07]'" @click="stage = stage === s ? '' : s">{{ s }} <span class="text-gray-600">{{ count(s) }}</span></button></div>
    <div class="glass-card overflow-x-auto">
      <table class="w-full text-xs">
        <thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"><th class="px-3 py-2 text-left">Prospect</th><th class="px-3 py-2 text-left">Type · district</th><th class="px-3 py-2 text-left">Stage</th><th class="px-3 py-2 text-right">Fit</th><th class="px-3 py-2 text-left">Risk</th><th class="px-3 py-2 text-right">Potential / month ৳</th><th class="px-3 py-2 text-left">Verdict</th><th class="px-3 py-2 text-left">Last contact</th></tr></thead>
        <tbody>
          <tr v-for="p in shown" :key="p.id" class="border-b border-white/[0.04]">
            <td class="px-3 py-2"><NuxtLink :to="`/crm/prospects/${p.id}`" class="text-gold-400 hover:underline">{{ p.name }}</NuxtLink><div class="text-[10px] text-gray-600">{{ p.business_name }}<span v-if="p.created_by_agent"> · found by assistant</span> <a :href="gmaps(p)" target="_blank" rel="noopener" class="text-gray-500 hover:underline">📍 Map</a></div></td>
            <td class="px-3 py-2 text-gray-400">{{ p.segment ?? '—' }} · {{ p.district ?? '—' }}</td><td class="px-3 py-2">{{ p.stage }}</td>
            <td class="px-3 py-2 text-right font-mono">{{ p.fit }}</td><td class="px-3 py-2" :class="p.risk_band === 'High' ? 'text-red-400' : p.risk_band === 'Medium' ? 'text-amber-400' : 'text-emerald-400'">{{ p.risk_band }}</td>
            <td class="px-3 py-2 text-right font-mono">{{ n0(p.potential_monthly_low) }} – {{ n0(p.potential_monthly_high) }}</td><td class="px-3 py-2 text-gray-300">{{ p.verdict }}</td>
            <td class="px-3 py-2 text-gray-500">{{ p.last_contact ? String(p.last_contact).slice(0, 10) : '—' }}</td>
          </tr>
          <tr v-if="!shown.length"><td colspan="8" class="px-3 py-8 text-center text-gray-600">No prospects yet. Add one, or ask the assistant to find some.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const segments = ['Trader / Store', 'Bakery', 'Food manufacturer', 'Hotel / Institution', 'Other business', 'Unclassified']
const stages = ['new', 'researching', 'contacted', 'quoted', 'trial', 'won', 'lost']
const stage = ref(''), adding = ref(false), busy = ref(false)
const { data, refresh } = await useFetch<any>('/api/crm/prospects')
const all = computed(() => (data.value?.prospects ?? []) as any[])
const shown = computed(() => stage.value ? all.value.filter(p => p.stage === stage.value) : all.value)
const count = (s: string) => all.value.filter(p => p.stage === s).length
const n0 = (v: number) => Math.round(Number(v ?? 0)).toLocaleString('en-US')
const n = reactive({ name: '', business_name: '', segment: '', phone: '', address: '', source: '', source_url: '' })
const finding = ref(false), searching = ref(false)
const areas = ['Dhaka', 'Gazipur', 'Narayanganj', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Bogura', 'Sirajganj', 'Cumilla', 'Mymensingh']
const kinds = { bakery: 'Bakeries', sweets: 'Sweets / confectionery', wholesale: 'Wholesalers / traders', factory: 'Food factories' }
const q = reactive({ district: 'Dhaka', kinds: ['bakery', 'sweets'] as string[] })
const found = ref<any>(null), picked = ref<number[]>([])
async function search() {
  searching.value = true; picked.value = []
  try { found.value = await $fetch('/api/crm/prospects/discover', { method: 'POST', body: q }); if (showMap.value) await drawMap() }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Search failed — the listing service may be busy, try again') } finally { searching.value = false }
}
// ── map: Leaflet from cdnjs + OpenStreetMap tiles, loaded only when the button is pressed ──
const showMap = ref(false), mapEl = ref<HTMLElement | null>(null)
let map: any = null, pins: any[] = []
const esc = (s: string) => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!))
const gmaps = (c: any) => c.lat != null ? `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lon}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.name, c.address, c.district].filter(Boolean).join(' '))}`
function loadLeaflet(): Promise<any> {
  const w = window as any
  if (w.L) return Promise.resolve(w.L)
  return new Promise((res, rej) => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css)
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    s.onload = () => res(w.L); s.onerror = () => rej(new Error('The map library could not be loaded — check the internet connection'))
    document.head.appendChild(s)
  })
}
function closeMap() { map?.remove(); map = null; pins = []; showMap.value = false }
async function drawMap(focus?: number) {
  try {
    showMap.value = true; await nextTick()
    const L = await loadLeaflet(), list = (found.value?.candidates ?? []) as any[]
    if (!map) { map = L.map(mapEl.value, { scrollWheelZoom: false }).setView([23.78, 90.4], 11); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(map) }
    pins.forEach(p => p?.remove()); pins = []
    const icon = L.icon({ iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] })
    list.forEach((c, i) => {
      if (c.lat == null) { pins.push(null); return }
      pins.push(L.marker([c.lat, c.lon], { icon }).addTo(map).bindPopup(`<b>${esc(c.name)}</b><br>${esc(c.segment)}<br>${esc(c.phone || 'no phone listed')}<br>${esc(c.address || '')}<br><a href="${gmaps(c)}" target="_blank" rel="noopener">Open in Google Maps</a>`))
    })
    map.invalidateSize()                       // size first, then fit — otherwise the zoom is computed for an empty box
    const has = pins.filter(Boolean)
    if (focus != null && pins[focus]) { map.setView(pins[focus].getLatLng(), 17); pins[focus].openPopup() }
    else if (focus != null) toastError('This listing has no map position — use the Google link')
    else if (has.length) map.fitBounds(L.featureGroup(has).getBounds().pad(0.1))
    map.invalidateSize()
  } catch (e: any) { toastError(e?.message ?? 'Map failed to open'); showMap.value = false }
}
onBeforeUnmount(() => map?.remove())
async function savePicked() {
  busy.value = true; let ok = 0, skipped = 0
  for (const i of picked.value) {
    const c = found.value.candidates[i]
    try { await $fetch('/api/crm/prospects', { method: 'POST', body: { name: c.name, segment: c.segment, district: c.district, address: c.address, phone: c.phone, website: c.website, source: c.source, source_url: c.source_url, source_note: c.source_note } }); ok++ }
    catch { skipped++ }
  }
  success(`${ok} prospect${ok === 1 ? '' : 's'} added${skipped ? `, ${skipped} skipped (duplicate)` : ''}`)
  picked.value = []; await refresh(); await search()
  busy.value = false
}
async function add() {
  busy.value = true
  try { const r: any = await $fetch('/api/crm/prospects', { method: 'POST', body: { ...n } }); success('Prospect saved'); navigateTo(`/crm/prospects/${r.id}`) }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } finally { busy.value = false }
}
</script>
