<template>
  <div class="space-y-5">
    <UiPageHeader title="Delivery Schedule" subtitle="Orders still to go out — by required date, then your drag order"
                  :breadcrumb="['Credit Sales', 'Delivery Schedule']">
      <template #actions><button class="btn-ghost text-xs" @click="refresh()">↻ Refresh</button></template>
    </UiPageHeader>

    <div class="flex flex-wrap items-center gap-2">
      <button v-for="t in ['schedule', 'overdue']" :key="t" type="button" class="px-3 py-1.5 rounded-lg text-xs font-semibold"
              :class="tab === t ? 'btn-gold' : 'btn-ghost'" @click="tab = t">{{ t === 'schedule' ? 'Due today & upcoming' : 'Overdue' }}</button>
      <input v-model="f.order" class="input-glass text-xs w-36" placeholder="Order #" />
      <input v-model="f.customer" class="input-glass text-xs w-40" placeholder="Customer / phone" />
      <select v-model="f.vehicle" class="input-glass text-xs"><option value="">Any truck</option><option value="big_truck">Big truck</option><option value="mini_truck">Mini truck</option></select>
      <select v-model="f.branch" class="input-glass text-xs"><option value="">All branches</option><option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option></select>
      <input v-model="f.from" type="date" class="input-glass text-xs" title="Required from" />
      <input v-model="f.to" type="date" class="input-glass text-xs" title="Required to" />
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="!rows.length" class="glass-card p-8 text-center text-xs text-gray-500">Nothing on this list.</div>
    <div v-else class="glass-card p-0 overflow-hidden divide-y divide-white/[0.05]">
      <div v-for="(o, i) in rows" :key="o.id" class="px-4 py-3 flex flex-wrap items-center gap-3"
           :draggable="canReorder" @dragstart="drag = i" @dragover.prevent @drop="dropOn(i)"
           :class="canReorder ? 'cursor-grab' : ''">
        <span v-if="canReorder" class="text-gray-600 select-none">⋮⋮</span>
        <div class="min-w-[150px]">
          <NuxtLink :to="`/credit-sales/${o.id}`" class="text-xs font-bold text-gold-400 hover:underline">{{ o.order_number }}</NuxtLink>
          <p class="text-[11px] text-gray-500">{{ o.customer_name }}<span v-if="o.customer_phone"> · {{ o.customer_phone }}</span></p>
        </div>
        <div class="text-xs text-gray-400 min-w-[110px]">
          Due <strong :class="tab === 'overdue' ? 'text-red-400' : 'text-gray-200'">{{ day(o.required_date) }}</strong>
          <p class="text-[11px] text-gray-600">{{ o.branch_name }} · {{ o.delivery_type === 'mini_truck' ? 'Mini' : 'Big' }} truck</p>
        </div>
        <UiStatusBadge :status="o.status" />
        <div class="flex-1 text-[11px] text-gray-500 min-w-[200px]">
          <span v-for="(it, k) in o.items" :key="k" class="mr-3">{{ it.product_name }} {{ it.weight_variant }} {{ it.grade }} × {{ Number(it.quantity) }}</span>
        </div>
        <button v-if="canEdit" class="btn-ghost text-xs" @click="startEdit(o)">✏️ Edit</button>
      </div>
    </div>

    <UiSlideOver v-model="editOpen" title="Edit schedule" :subtitle="editing?.order_number">
      <form id="ds-form" class="p-6 space-y-4" @submit.prevent="saveEdit">
        <div><label class="field-label">Required date</label><input v-model="form.required_date" type="date" class="field-input w-full" required /></div>
        <div><label class="field-label">Truck type</label>
          <select v-model="form.delivery_type" class="field-input w-full"><option value="big_truck">Big truck</option><option value="mini_truck">Mini truck</option></select></div>
        <div><label class="field-label">Branch</label>
          <select v-model="form.branch_id" class="field-input w-full"><option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option></select></div>
        <p class="text-[11px] text-gray-600">Changes the order header only — prices and totals are not recalculated.</p>
      </form>
      <template #footer>
        <div class="p-4 flex justify-end gap-2">
          <button type="button" class="btn-ghost text-xs" @click="editOpen = false">Cancel</button>
          <button type="submit" form="ds-form" class="btn-gold text-xs">Save</button>
        </div>
      </template>
    </UiSlideOver>
  </div>
</template>

<script setup lang="ts">
const perms = usePermissions()
const { success, error: toastError } = useToast()
const tab = ref<'schedule' | 'overdue'>('schedule')
const f = reactive({ order: '', customer: '', vehicle: '', branch: '', from: '', to: '' })
const query = computed(() => ({ tab: tab.value, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '')) }))
const { data, pending, refresh } = await useFetch<any>('/api/credit-sales/delivery-schedule', { query, watch: [query] })
const rows = ref<any[]>([])
watch(data, (d) => { rows.value = [...(d?.orders ?? [])] }, { immediate: true })
const branches = computed(() => data.value?.branches ?? [])
const day = (d: any) => String(d).slice(0, 10)

const canReorder = computed(() => perms.canDo('credit_sales', 'delivery-schedule', 'can_change_priority'))
const canEdit = computed(() => perms.canExplicit('credit_sales', 'delivery-schedule', 'can_edit'))

const drag = ref<number | null>(null)
async function dropOn(i: number) {
  if (drag.value === null || drag.value === i) return
  const next = [...rows.value]
  const [moved] = next.splice(drag.value, 1)
  next.splice(i, 0, moved)
  rows.value = next
  drag.value = null
  try { await $fetch('/api/credit-sales/delivery-schedule', { method: 'POST', body: { action: 'reorder', ids: next.map(o => o.id) } }) }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not save order'); refresh() }
}

const editOpen = ref(false)
const editing = ref<any>(null)
const form = reactive({ required_date: '', delivery_type: 'big_truck', branch_id: 0 })
function startEdit(o: any) {
  editing.value = o
  Object.assign(form, { required_date: day(o.required_date), delivery_type: o.delivery_type || 'big_truck', branch_id: o.assigned_branch_id })
  editOpen.value = true
}
async function saveEdit() {
  try {
    const r: any = await $fetch('/api/credit-sales/delivery-schedule', { method: 'POST', body: { action: 'edit', order_id: editing.value.id, ...form } })
    success(r.message ?? 'Saved'); editOpen.value = false; refresh()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not save') }
}
</script>
