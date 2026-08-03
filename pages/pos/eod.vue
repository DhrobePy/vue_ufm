<template>
  <div class="space-y-6">
    <UiPageHeader title="End of Day — Cash Reconciliation" subtitle="Count the till, confirm against the system balance, then confirm next-day deposit"
                  :breadcrumb="['POS', 'End of Day']" />

    <div class="glass-card p-5 space-y-4 max-w-xl">
      <h3 class="section-title">New Count</h3>
      <div class="space-y-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cash Box</label>
        <select v-model="form.cash_account_id" class="input-glass" @change="onAccountChange">
          <option value="">Select…</option>
          <option v-for="a in cashAccounts" :key="a.id" :value="a.id">{{ a.account_name }}{{ a.branch_name ? ` — ${a.branch_name}` : '' }}</option>
        </select>
      </div>
      <div v-if="selectedAccount" class="rounded-xl p-3 text-xs" style="background:rgba(255,255,255,0.03)">
        <div class="flex justify-between"><span class="text-gray-500">Expected (system balance)</span><span class="font-mono text-gray-200">৳{{ Number(selectedAccount.current_balance).toLocaleString() }}</span></div>
      </div>
      <div class="space-y-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actual Cash Counted</label>
        <input v-model.number="form.actual_cash" type="number" min="0" step="any" class="input-glass font-mono" />
      </div>
      <div v-if="variance !== null && Math.abs(variance) > 0.005" class="space-y-1.5">
        <p :class="['text-xs font-semibold', variance < 0 ? 'text-red-400' : 'text-amber-400']">
          Variance: ৳{{ variance.toLocaleString() }} {{ variance < 0 ? '(short)' : '(over)' }}
        </p>
        <input v-model="form.variance_reason" class="input-glass text-xs" placeholder="Reason for variance…" />
      </div>
      <div class="space-y-1.5">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Witness (optional)</label>
        <select v-model="form.witness_user_id" class="input-glass text-xs">
          <option value="">— None —</option>
          <option v-for="u in users" :key="u.id" :value="u.id">{{ u.display_name }}</option>
        </select>
      </div>
      <div class="flex justify-end">
        <button @click="submit" :disabled="!canSubmit || submitting" class="btn-gold text-xs disabled:opacity-50">
          {{ submitting ? 'Saving…' : 'Submit Count' }}
        </button>
      </div>
    </div>

    <div class="glass-card p-5">
      <h3 class="section-title mb-3">Recent Counts</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
            <th class="text-left py-2 pr-3">Date</th><th class="text-left pr-3">Branch</th>
            <th class="text-right pr-3">Expected</th><th class="text-right pr-3">Actual</th>
            <th class="text-right pr-3">Variance</th><th class="text-left pr-3">Status</th><th></th>
          </tr></thead>
          <tbody>
            <tr v-for="h in history" :key="h.id" class="border-b border-white/[0.03]">
              <td class="py-2 pr-3 text-gray-400">{{ String(h.verification_date).slice(0, 10) }}</td>
              <td class="pr-3 text-gray-300">{{ h.branch_name }}</td>
              <td class="pr-3 text-right font-mono text-gray-300">৳{{ Number(h.expected_cash).toLocaleString() }}</td>
              <td class="pr-3 text-right font-mono text-gray-300">৳{{ Number(h.actual_cash).toLocaleString() }}</td>
              <td :class="['pr-3 text-right font-mono', Math.abs(h.variance) > 0.005 ? (h.variance < 0 ? 'text-red-400' : 'text-amber-400') : 'text-emerald-400']">
                ৳{{ Number(h.variance).toLocaleString() }}
              </td>
              <td class="pr-3">
                <span :class="['px-2 py-0.5 rounded-full text-[10px] font-semibold',
                  h.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' : h.status === 'disputed' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400']">
                  {{ h.status }}
                </span>
                <span v-if="h.deposited_at" class="ml-1 text-[10px] text-blue-400">· deposited</span>
              </td>
              <td class="text-right">
                <button v-if="h.status === 'approved' && !h.deposited_at" @click="confirmDeposit(h)" class="btn-ghost text-[10px] py-1">Confirm Deposit</button>
              </td>
            </tr>
            <tr v-if="!history.length"><td colspan="7" class="py-6 text-center text-gray-600">No counts yet.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const [{ data, refresh }, { data: usersData }] = await Promise.all([
  useFetch('/api/pos/eod'),
  useFetch('/api/admin/users', { query: { per: 200 } }),
])
const cashAccounts = computed<any[]>(() => (data.value as any)?.cash_accounts ?? [])
const history       = computed<any[]>(() => (data.value as any)?.history ?? [])
const users          = computed<any[]>(() => (usersData.value as any)?.users ?? [])

const form = reactive({ cash_account_id: '' as string | number, actual_cash: 0, variance_reason: '', witness_user_id: '' as string | number })
const selectedAccount = computed(() => cashAccounts.value.find((a: any) => String(a.id) === String(form.cash_account_id)))
const variance = computed(() => selectedAccount.value ? Math.round((form.actual_cash - Number(selectedAccount.value.current_balance)) * 100) / 100 : null)

function onAccountChange() { form.actual_cash = 0; form.variance_reason = '' }

const canSubmit = computed(() =>
  !!form.cash_account_id && form.actual_cash >= 0 &&
  (Math.abs(variance.value ?? 0) < 0.005 || form.variance_reason.trim().length > 0))

const submitting = ref(false)
async function submit() {
  submitting.value = true
  try {
    await $fetch('/api/pos/eod', {
      method: 'POST',
      body: {
        cash_account_id: form.cash_account_id, actual_cash: form.actual_cash,
        variance_reason: form.variance_reason || undefined,
        witness_user_id: form.witness_user_id || undefined,
      },
    })
    success('EOD count recorded ✓')
    form.cash_account_id = ''; form.actual_cash = 0; form.variance_reason = ''; form.witness_user_id = ''
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to submit')
  } finally { submitting.value = false }
}

async function confirmDeposit(h: any) {
  const ref_ = prompt(`Bank deposit reference for ৳${Number(h.actual_cash).toLocaleString()}?`)
  if (!ref_?.trim()) return
  try {
    await $fetch(`/api/pos/eod/${h.id}/deposit`, { method: 'POST', body: { deposit_reference: ref_ } })
    success('Deposit confirmed ✓')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to confirm deposit')
  }
}
</script>
