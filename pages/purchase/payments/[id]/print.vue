<template>
  <div>
    <div v-if="pending" class="p-8 text-center text-gray-500 text-sm">Loading…</div>
    <div v-else-if="error" class="p-6 text-center text-red-500">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- No-print toolbar -->
      <div class="no-print flex gap-3 p-4 border-b border-gray-200 bg-white">
        <button @click="printPage" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2">
          🖨 Print Receipt
        </button>
        <NuxtLink :to="`/purchase/payments/${route.params.id}`" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
          ← Back
        </NuxtLink>
      </div>

      <!-- Receipt -->
      <div class="receipt-container max-w-4xl mx-auto bg-white p-10 text-gray-900 font-[Arial,sans-serif]">

        <!-- Header -->
        <div class="text-center border-b-4 border-emerald-600 pb-6 mb-6">
          <h1 class="text-3xl font-bold">উজ্জল ফ্লাওয়ার মিলস</h1>
          <p class="text-gray-600 mt-1">সিরাজগঞ্জ, ডেমরা, রামপুরা</p>
          <p class="text-gray-600">info@ujjalfm.com</p>
        </div>

        <!-- Title & Voucher # -->
        <div class="bg-emerald-600 text-white text-center py-3 text-xl font-bold tracking-widest mb-4">
          PAYMENT RECEIPT / VOUCHER
        </div>
        <div class="text-center bg-yellow-50 border-2 border-yellow-400 rounded py-3 mb-6">
          <span class="text-lg font-bold text-yellow-800">{{ pmt.payment_voucher_number }}</span>
          <span class="ml-3 text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            {{ pmt.is_posted ? '✓ POSTED' : '⏳ PENDING' }}
          </span>
          <span v-if="pmt.payment_type === 'advance'" class="ml-2 text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">ADVANCE</span>
        </div>

        <!-- Info grid -->
        <div class="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div class="space-y-3">
            <div class="flex border-b pb-2"><span class="font-bold w-36 text-gray-600">Payment Date:</span><span>{{ pmt.payment_date }}</span></div>
            <div class="flex border-b pb-2"><span class="font-bold w-36 text-gray-600">Payment Method:</span><span class="uppercase font-bold">{{ pmt.payment_method }}</span></div>
            <div class="flex border-b pb-2"><span class="font-bold w-36 text-gray-600">Payment Type:</span><span class="capitalize">{{ pmt.payment_type }}</span></div>
          </div>
          <div class="space-y-3">
            <div class="flex border-b pb-2"><span class="font-bold w-36 text-gray-600">PO Number:</span><span class="font-bold text-emerald-700">{{ pmt.po_number }}</span></div>
            <div class="flex border-b pb-2"><span class="font-bold w-36 text-gray-600">Reference:</span><span>{{ pmt.reference_number || '—' }}</span></div>
            <div class="flex border-b pb-2"><span class="font-bold w-36 text-gray-600">Handled By:</span><span>{{ pmt.handled_by_employee || '—' }}</span></div>
          </div>
        </div>

        <!-- Paid to -->
        <div class="bg-gray-100 rounded p-3 mb-4 flex items-center">
          <span class="font-bold w-36 text-gray-600">Paid To:</span>
          <span class="text-lg font-bold">{{ pmt.supplier_name }}</span>
        </div>

        <!-- Amount box -->
        <div class="border-2 border-emerald-600 rounded-lg p-6 text-center mb-6 bg-emerald-50">
          <p class="text-sm text-gray-500 mb-2">AMOUNT PAID</p>
          <p class="text-4xl font-bold text-emerald-700">৳ {{ Number(pmt.amount_paid).toLocaleString() }}</p>
        </div>

        <!-- Summary table -->
        <table class="w-full text-sm border-collapse mb-6">
          <tbody>
            <tr class="border-b border-gray-200">
              <td class="py-2 font-semibold text-gray-600">Total Order Value:</td>
              <td class="py-2 text-right">৳ {{ Number(pmt.total_order_value || 0).toLocaleString() }}</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="py-2 font-semibold text-gray-600">Goods Received Value:</td>
              <td class="py-2 text-right">৳ {{ Number(pmt.total_received_value || 0).toLocaleString() }}</td>
            </tr>
            <tr class="border-b-2 border-gray-400 font-bold text-emerald-700">
              <td class="py-2">Balance After Payment:</td>
              <td class="py-2 text-right">৳ {{ Number(pmt.balance_payable || 0).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Remarks -->
        <div v-if="pmt.remarks" class="border border-gray-200 rounded p-4 mb-6 bg-gray-50">
          <p class="font-bold text-gray-600 mb-1">Remarks:</p>
          <p class="text-gray-700">{{ pmt.remarks }}</p>
        </div>

        <!-- Signatures -->
        <div class="grid grid-cols-3 gap-8 mt-12 pt-6 border-t-2 border-gray-300">
          <div class="text-center">
            <div class="border-t-2 border-gray-400 pt-2 mt-16">
              <p class="font-semibold text-sm">Prepared By</p>
              <p class="text-xs text-gray-500">Accounts Department</p>
            </div>
          </div>
          <div class="text-center">
            <div class="border-t-2 border-gray-400 pt-2 mt-16">
              <p class="font-semibold text-sm">Verified By</p>
              <p class="text-xs text-gray-500">Accounts Manager</p>
            </div>
          </div>
          <div class="text-center">
            <div class="border-t-2 border-gray-400 pt-2 mt-16">
              <p class="font-semibold text-sm">Approved By</p>
              <p class="text-xs text-gray-500">Authorized Signatory</p>
            </div>
          </div>
        </div>

        <div class="text-center mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500">
          <p>Computer-generated payment receipt — Payment ID: {{ pmt.id }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'print' })
const route = useRoute()

const { data, pending, error } = await useFetch(
  () => `/api/purchase/payments/${route.params.id}`,
)
const pmt = computed(() => (data.value?.payment ?? {}) as any)

function printPage() {
  if (typeof window !== 'undefined') window.print()
}
</script>

<style>
@media print {
  .no-print { display: none !important; }
  .receipt-container { max-width: 100% !important; padding: 15px !important; }
}
</style>
