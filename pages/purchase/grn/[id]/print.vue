<template>
  <div>
    <div v-if="pending" class="p-8 text-center text-gray-500 text-sm">Loading…</div>
    <div v-else-if="error" class="p-6 text-center text-red-500">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- No-print toolbar -->
      <div class="no-print flex gap-3 p-4 border-b border-gray-200 bg-white">
        <button @click="() => window.print()"
          class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2">
          🖨 Print Receipt
        </button>
        <NuxtLink :to="`/purchase/grn/${route.params.id}`"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
          ← Back
        </NuxtLink>
      </div>

      <!-- Printable Receipt -->
      <div class="receipt max-w-4xl mx-auto bg-white p-8 text-gray-900">

        <!-- Company Header -->
        <div class="text-center border-b-2 border-gray-800 pb-6 mb-6">
          <h1 class="text-3xl font-bold text-gray-900">UJJAL FLOUR MILLS</h1>
          <p class="text-gray-600 mt-2">Sirajganj, Demra, Rampura</p>
          <p class="text-gray-600">Phone: +880-XXX-XXXXXX | Email: info@ujjalfm.com</p>
        </div>

        <!-- Receipt Title -->
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">GOODS RECEIVED NOTE</h2>
          <div class="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">
            GRN #: {{ grn.grn_number }}
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-6 mb-6 text-sm">
          <!-- Left Column -->
          <div class="space-y-3">
            <div class="flex justify-between border-b border-gray-300 pb-2">
              <span class="font-semibold text-gray-700">GRN Date:</span>
              <span>{{ formatDate(grn.grn_date) }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-300 pb-2">
              <span class="font-semibold text-gray-700">PO Number:</span>
              <span>{{ grn.po_number }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-300 pb-2">
              <span class="font-semibold text-gray-700">Supplier:</span>
              <span>{{ grn.supplier_name }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-300 pb-2">
              <span class="font-semibold text-gray-700">Wheat Origin:</span>
              <span>{{ grn.wheat_origin || '—' }}</span>
            </div>
          </div>
          <!-- Right Column -->
          <div class="space-y-3">
            <div class="flex justify-between border-b border-gray-300 pb-2">
              <span class="font-semibold text-gray-700">Truck Number:</span>
              <span>{{ grn.truck_number || 'N/A' }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-300 pb-2">
              <span class="font-semibold text-gray-700">Unload Point:</span>
              <span>{{ grn.unload_branch_name || grn.unload_point_name || '—' }}</span>
            </div>
            <div class="flex justify-between border-b border-gray-300 pb-2">
              <span class="font-semibold text-gray-700">Unit Price:</span>
              <span>৳{{ Number(grn.unit_price_per_kg || grn.po_unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}/KG</span>
            </div>
            <div class="flex justify-between border-b border-gray-300 pb-2">
              <span class="font-semibold text-gray-700">Received By:</span>
              <span>System</span>
            </div>
          </div>
        </div>

        <!-- Quantity Details -->
        <div class="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Quantity Details</h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b-2 border-gray-300">
                <th class="text-left py-2">Description</th>
                <th class="text-right py-2">Weight (KG)</th>
                <th class="text-right py-2">Value (৳)</th>
              </tr>
            </thead>
            <tbody>
              <!-- Expected Quantity -->
              <tr v-if="hasExpected" class="border-b border-gray-200">
                <td class="py-2 text-gray-700">Expected Quantity</td>
                <td class="text-right font-mono">{{ Number(grn.expected_quantity).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
                <td class="text-right font-mono">৳{{ expectedValue.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
              </tr>
              <!-- Actual Received -->
              <tr class="border-b border-gray-200 font-semibold">
                <td class="py-2">Actual Quantity Received</td>
                <td class="text-right font-mono">{{ Number(grn.quantity_received_kg).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
                <td class="text-right font-mono">৳{{ Number(grn.total_value).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
              </tr>
              <!-- Variance -->
              <tr v-if="hasExpected" :class="varianceKg >= 0 ? 'text-green-700' : 'text-red-700'">
                <td class="py-2 font-semibold">Variance (Quantity)</td>
                <td class="text-right font-semibold font-mono">
                  {{ varianceKg >= 0 ? '+' : '' }}{{ varianceKg.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
                  ({{ varianceKg >= 0 ? '+' : '' }}{{ variancePct.toFixed(2) }}%)
                </td>
                <td class="text-right font-semibold font-mono">
                  {{ varianceKg >= 0 ? '+' : '' }}৳{{ (varianceKg * unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
                </td>
              </tr>
              <!-- Expected Payable -->
              <tr v-if="hasExpected" class="border-t-2 border-gray-400 bg-purple-50 font-bold">
                <td class="py-3 text-gray-900 uppercase tracking-wider text-xs">EXPECTED PAYABLE</td>
                <td class="text-right font-mono">{{ Number(grn.expected_quantity).toLocaleString(undefined, { minimumFractionDigits: 2 }) }} KG</td>
                <td class="text-right font-mono text-purple-700">৳{{ expectedValue.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- EXPECTED PAYABLE Total Box -->
        <div class="border-2 border-green-600 bg-green-50 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center">
            <span class="text-lg font-bold text-gray-900">EXPECTED PAYABLE (Amount Due):</span>
            <span class="text-2xl font-bold text-green-700">
              ৳{{ (hasExpected ? expectedValue : Number(grn.total_value)).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
            </span>
          </div>
        </div>

        <!-- Actual Received Value (reference) -->
        <div v-if="hasExpected" class="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold text-gray-700">Actual Received Value (for reference):</span>
            <span class="text-lg font-semibold text-gray-700">৳{{ Number(grn.total_value).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
          </div>
        </div>

        <!-- Remarks -->
        <div v-if="grn.remarks" class="mb-6">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Remarks:</h3>
          <p class="text-gray-700 bg-gray-50 p-4 rounded border border-gray-200">{{ grn.remarks }}</p>
        </div>

        <!-- Signatures -->
        <div class="grid grid-cols-3 gap-8 mt-12 pt-6 border-t-2 border-gray-300">
          <div class="text-center">
            <div class="border-t-2 border-gray-400 pt-2 mt-16">
              <p class="font-semibold">Received By</p>
              <p class="text-sm text-gray-600">Warehouse Staff</p>
            </div>
          </div>
          <div class="text-center">
            <div class="border-t-2 border-gray-400 pt-2 mt-16">
              <p class="font-semibold">Verified By</p>
              <p class="text-sm text-gray-600">Production Manager</p>
            </div>
          </div>
          <div class="text-center">
            <div class="border-t-2 border-gray-400 pt-2 mt-16">
              <p class="font-semibold">Approved By</p>
              <p class="text-sm text-gray-600">Accounts Department</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8 pt-4 border-t border-gray-300 text-sm text-gray-600">
          <p>This is a computer-generated document. Generated on {{ generatedAt }}</p>
          <p class="mt-1">GRN ID: {{ grn.id }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'print' })
const route = useRoute()

const { data, pending, error } = await useFetch(
  () => `/api/purchase/grn/${route.params.id}`,
)
const grn = computed(() => (data.value?.grn ?? {}) as any)

const unitPrice     = computed(() => Number(grn.value?.unit_price_per_kg || grn.value?.po_unit_price || 0))
const hasExpected   = computed(() => Number(grn.value?.expected_quantity || 0) > 0)
const expectedValue = computed(() => Number(grn.value?.expected_quantity || 0) * unitPrice.value)
const varianceKg    = computed(() => Number(grn.value?.quantity_received_kg || 0) - Number(grn.value?.expected_quantity || 0))
const variancePct   = computed(() => {
  const exp = Number(grn.value?.expected_quantity || 0)
  return exp > 0 ? (varianceKg.value / exp) * 100 : 0
})

const generatedAt = new Date().toLocaleString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: true,
})

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

declare const window: Window
</script>

<style>
@media print {
  .no-print  { display: none !important; }
  .receipt   { max-width: 100% !important; padding: 20px !important; }
}
</style>
