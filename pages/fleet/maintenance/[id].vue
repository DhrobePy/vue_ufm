<template>
  <div class="space-y-6" v-if="req">
    <UiPageHeader
      :title="req.request_no"
      :subtitle="`${req.vehicle_no} · ${req.repair_type}`"
      :breadcrumb="['Fleet','Maintenance', req.request_no]"
    >
      <template #actions>
        <UiStatusBadge :status="req.status" />
      </template>
    </UiPageHeader>

    <!-- Workflow -->
    <div class="flex gap-2">
      <button v-if="req.status === 'pending'"     @click="updateStatus('in_progress')" class="btn-gold text-xs">▶ Start Work</button>
      <button v-if="req.status === 'in_progress'" @click="openComplete"  class="btn-secondary text-xs border-emerald-500/30 text-emerald-400">✓ Mark Completed</button>
      <button v-if="req.status !== 'cancelled' && req.status !== 'completed'" @click="updateStatus('cancelled')" class="btn-secondary text-xs border-red-500/30 text-red-400">✕ Cancel</button>
    </div>

    <!-- Complete + post GL entry modal -->
    <Teleport to="body">
      <div v-if="completeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)" @click.self="completeModal = false">
        <div class="glass-card p-6 w-full max-w-sm space-y-4" @click.stop>
          <h3 class="text-sm font-semibold text-gray-200">Mark Completed</h3>
          <p class="text-xs text-gray-500">
            Total cost <span class="text-gold-400 font-semibold">৳{{ Number(req.total_cost || 0).toLocaleString() }}</span>
            will be posted to the ledger as a Vehicle Maintenance expense.
          </p>
          <div>
            <label class="field-label">Paid From *</label>
            <select v-model="payMethod" class="field-input w-full">
              <option value="">Select…</option>
              <option value="cash">Petty Cash</option>
              <option value="bank">Bank</option>
            </select>
          </div>
          <div v-if="payMethod === 'cash'">
            <label class="field-label">Petty Cash Account</label>
            <select v-model="payCashAccount" class="field-input w-full">
              <option value="">— Select —</option>
              <option v-for="a in pettyCashAccounts" :key="a.id" :value="a.id">{{ a.account_name }} (৳{{ Number(a.current_balance).toLocaleString() }})</option>
            </select>
          </div>
          <div v-if="payMethod === 'bank'">
            <label class="field-label">Bank Account</label>
            <select v-model="payBankAccount" class="field-input w-full">
              <option value="">— Select —</option>
              <option v-for="a in bankAccounts" :key="a.id" :value="a.id">{{ a.bank_name }} — {{ a.account_name }}</option>
            </select>
          </div>
          <div class="flex gap-2 pt-1">
            <button @click="completeModal = false" class="btn-ghost text-xs flex-1 justify-center">Cancel</button>
            <button @click="confirmComplete"
                    :disabled="!payMethod || (payMethod === 'cash' && !payCashAccount) || (payMethod === 'bank' && !payBankAccount)"
                    class="btn-gold text-xs flex-1 justify-center disabled:opacity-40">
              Complete &amp; Post
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main -->
      <div class="lg:col-span-2 space-y-5">
        <!-- Details -->
        <div class="glass-card p-5">
          <h3 class="section-title mb-4">Request Details</h3>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div class="flex justify-between"><dt class="text-gray-500">Request No</dt><dd class="text-gray-200 font-mono">{{ req.request_no }}</dd></div>
            <div class="flex justify-between"><dt class="text-gray-500">Vehicle</dt><dd class="font-mono text-gold-400/80">{{ req.vehicle_no }}</dd></div>
            <div class="flex justify-between"><dt class="text-gray-500">Date</dt><dd class="text-gray-200">{{ req.request_date }}</dd></div>
            <div class="flex justify-between"><dt class="text-gray-500">Type</dt><dd><span class="badge text-[10px]" :class="req.repair_type === 'preventive' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'">{{ req.repair_type }}</span></dd></div>
            <div class="flex justify-between"><dt class="text-gray-500">Station</dt><dd class="text-gray-200">{{ req.station_supplier || '—' }}</dd></div>
            <div class="flex justify-between"><dt class="text-gray-500">Odometer</dt><dd class="text-gray-200">{{ req.odometer_at_request ? req.odometer_at_request.toLocaleString() + ' km' : '—' }}</dd></div>
          </dl>
          <div class="mt-4 pt-4 border-t border-white/[0.06]">
            <p class="text-xs text-gray-500 mb-1">Issue Description</p>
            <p class="text-sm text-gray-300">{{ req.issue_description || '—' }}</p>
          </div>
        </div>

        <!-- Tasks -->
        <div class="glass-card p-5">
          <h3 class="section-title mb-4">Repair Tasks</h3>
          <div v-if="!tasks.length" class="text-center py-4 text-gray-600 text-sm">No tasks recorded</div>
          <div v-else class="space-y-2">
            <div v-for="t in tasks" :key="t.id" class="flex justify-between p-3 rounded-xl bg-white/[0.03]">
              <span class="text-sm text-gray-300">{{ t.description }}</span>
              <span class="text-sm font-medium text-gray-200">৳{{ Number(t.service_cost || 0).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Materials -->
        <div class="glass-card p-5">
          <h3 class="section-title mb-4">Materials Used</h3>
          <div v-if="!materials.length" class="text-center py-4 text-gray-600 text-sm">No materials recorded</div>
          <table v-else class="w-full text-xs">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="pb-2 text-left text-gray-500">Item</th>
                <th class="pb-2 text-right text-gray-500">Qty</th>
                <th class="pb-2 text-right text-gray-500">Rate ৳</th>
                <th class="pb-2 text-right text-gray-500">Amount ৳</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in materials" :key="m.id" class="border-b border-white/[0.03]">
                <td class="py-2 text-gray-300">{{ m.item_name }}</td>
                <td class="py-2 text-right text-gray-400">{{ m.quantity }}</td>
                <td class="py-2 text-right text-gray-400">৳{{ Number(m.unit_rate || 0).toFixed(2) }}</td>
                <td class="py-2 text-right font-medium text-gray-200">৳{{ Number(m.amount || 0).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right -->
      <div class="space-y-4">
        <div class="glass-card p-4">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cost Summary</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Labour / Service</span>
              <span class="text-gray-200">৳{{ Number(taskTotal).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Materials</span>
              <span class="text-gray-200">৳{{ Number(matTotal).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between border-t border-white/[0.06] pt-2 mt-2">
              <span class="font-semibold text-gray-300">Total</span>
              <span class="font-bold text-gold-400">৳{{ Number(req.total_cost || 0).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div v-if="req.notes" class="glass-card p-4">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
          <p class="text-xs text-gray-400">{{ req.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const id    = Number(route.params.id)

const { data, refresh } = await useFetch(`/api/fleet/maintenance/${id}`)
const { data: pettyData } = await useFetch('/api/expenses/petty-cash-accounts')
const { data: bankData }  = await useFetch('/api/bank-accounts')
const { error: toastError, success } = useToast()

const req       = computed(() => (data.value as any)?.request   ?? null)
const tasks     = computed(() => (data.value as any)?.tasks     ?? [])
const materials = computed(() => (data.value as any)?.materials ?? [])
const pettyCashAccounts = computed(() => (pettyData.value as any)?.accounts ?? [])
const bankAccounts      = computed(() => (bankData.value as any)?.accounts ?? [])

const taskTotal = computed(() => tasks.value.reduce((s: number, t: any) => s + Number(t.service_cost || 0), 0))
const matTotal  = computed(() => materials.value.reduce((s: number, m: any) => s + Number(m.amount || 0), 0))

const completeModal   = ref(false)
const payMethod       = ref('')
const payCashAccount  = ref('')
const payBankAccount  = ref('')

function openComplete() {
  if (Number(req.value?.total_cost || 0) <= 0.009) { updateStatus('completed'); return }
  payMethod.value = ''; payCashAccount.value = ''; payBankAccount.value = ''
  completeModal.value = true
}

async function confirmComplete() {
  try {
    await $fetch(`/api/fleet/maintenance/${id}`, {
      method: 'PATCH',
      body: {
        status: 'completed',
        payment_method: payMethod.value,
        cash_account_id: payMethod.value === 'cash' ? payCashAccount.value : null,
        bank_account_id: payMethod.value === 'bank' ? payBankAccount.value : null,
      },
    })
    completeModal.value = false
    success('Maintenance marked complete and posted to the ledger ✓')
    refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to complete request')
  }
}

async function updateStatus(status: string) {
  await $fetch(`/api/fleet/maintenance/${id}`, { method: 'PATCH', body: { status } })
  refresh()
}
</script>
