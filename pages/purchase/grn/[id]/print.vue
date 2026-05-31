<template>
  <div>
    <div v-if="pending" class="p-8 text-center text-gray-500 text-sm">Loading…</div>
    <div v-else-if="error" class="p-6 text-center text-red-500">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- No-print toolbar -->
      <div class="no-print flex gap-3 p-4 border-b border-gray-200 bg-white">
        <button @click="window.print()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2">
          🖨 Print Receipt
        </button>
        <NuxtLink :to="`/purchase/grn/${route.params.id}`" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
          ← Back
        </NuxtLink>
      </div>

      <!-- Printable receipt -->
      <div class="receipt max-w-4xl mx-auto bg-white p-10 text-gray-900">

        <!-- Company Header -->
        <div class="text-center border-b-2 border-gray-800 pb-6 mb-6">
          <h1 class="text-3xl font-bold">উজ্জল ফ্লাওয়ার মিলস</h1>
          <p class="text-gray-600 mt-1">সিরাজগঞ্জ, ডেমরা, রামপুরা</p>
          <p class="text-gray-600">info@ujjalfm.com</p>
        </div>

        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold mb-2">GOODS RECEIVED NOTE</h2>
          <div class="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">
            GRN #: {{ grn.grn_number }}
          </div>
        </div>

        <!-- Details grid -->
        <div class="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div class="space-y-3">
            <div class="flex justify-between border-b pb-2">
              <span class="font-semibold text-gray-700">GRN Date:</span>
              <span>{{ grn.grn_date }}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-semibold text-gray-700">PO Number:</span>
              <span>{{ grn.po_number }}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-semibold text-gray-700">Supplier:</span>
              <span>{{ grn.supplier_name }}</span>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between border-b pb-2">
              <span class="font-semibold text-gray-700">Truck Number:</span>
              <span>{{ grn.truck_number || 'N/A' }}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-semibold text-gray-700">Unload Point:</span>
              <span>{{ grn.unload_point_name || '—' }}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-semibold text-gray-700">Unit Price:</span>
              <span>৳{{ Number(grn.unit_price_per_kg || grn.po_unit_price || 0).toLocaleString() }}/KG</span>
            </div>
          </div>
        </div>

        <!-- Quantity table -->
        <div class="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-bold mb-4">Quantity Details</h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b-2 border-gray-300">
                <th class="text-left py-2">Description</th>
                <th class="text-right py-2">Weight (KG)</th>
                <th class="text-right py-2">Value (৳)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-200 font-semibold">
                <td class="py-2">Actual Quantity Received</td>
                <td class="text-right">{{ Number(grn.quantity_received_kg).toLocaleString() }}</td>
                <td class="text-right">৳{{ Number(grn.total_value).toLocaleString() }}</td>
              </tr>
              <tr v-if="Number(grn.variance_percentage)">
                <td class="py-2">Variance</td>
                <td class="text-right" :class="Number(grn.variance_percentage) > 0 ? 'text-green-700' : 'text-red-700'">
                  {{ Number(grn.variance_percentage) > 0 ? '+' : '' }}{{ Number(grn.variance_percentage).toFixed(2) }}%
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total box -->
        <div class="border-2 border-emerald-600 rounded-lg p-4 mb-6 flex justify-between items-center">
          <span class="text-lg font-bold">TOTAL VALUE</span>
          <span class="text-2xl font-bold text-emerald-700">৳{{ Number(grn.total_value).toLocaleString() }}</span>
        </div>

        <!-- Remarks -->
        <div v-if="grn.remarks" class="mb-6">
          <h3 class="text-lg font-bold mb-2">Remarks:</h3>
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

        <div class="text-center mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500">
          <p>Computer-generated document — GRN ID: {{ grn.id }}</p>
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

declare const window: Window
</script>

<style>
@media print {
  .no-print { display: none !important; }
  .receipt  { max-width: 100% !important; padding: 20px !important; }
}
</style>
