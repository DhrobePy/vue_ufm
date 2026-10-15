<template>
  <UiSlideOver :model-value="modelValue" title="Goods on Board" :subtitle="orderLabel" @update:model-value="$emit('update:modelValue', $event)">
    <form id="dispatch-form" class="p-6 space-y-4" @submit.prevent="submit">
      <p class="text-xs text-gray-500">Truck and driver are required. Putting goods on board posts the invoice to the customer ledger.</p>
      <div>
        <label class="field-label">Truck number *</label>
        <input v-model="f.truck_number" class="field-input w-full" required placeholder="e.g. DM-DA-14-1304" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="field-label">Driver name *</label>
          <input v-model="f.driver_name" class="field-input w-full" required />
        </div>
        <div>
          <label class="field-label">Driver contact</label>
          <input v-model="f.driver_contact" class="field-input w-full" inputmode="tel" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="field-label">Bags boarded</label>
          <input v-model.number="f.bags_boarded" type="number" min="0" step="1" class="field-input w-full" placeholder="optional" />
        </div>
        <div>
          <label class="field-label">Bag size (kg)</label>
          <input v-model.number="f.bag_size_kg" type="number" min="0" step="0.01" class="field-input w-full" placeholder="optional" />
        </div>
      </div>
      <div class="rounded-xl p-3 space-y-3" style="border:1px solid rgba(255,255,255,0.08)">
        <p class="text-xs font-semibold text-gray-400">Additional discount (optional)</p>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="field-label">Amount (৳)</label>
            <input v-model.number="f.extra_discount_amount" type="number" min="0" step="0.01" class="field-input w-full" />
          </div>
          <div>
            <label class="field-label">Reason {{ f.extra_discount_amount > 0 ? '*' : '' }}</label>
            <input v-model="f.extra_discount_reason" class="field-input w-full" maxlength="500"
                   :required="f.extra_discount_amount > 0" placeholder="e.g. short-weight adjustment" />
          </div>
        </div>
        <p class="text-[11px] text-gray-600">Reduces this order's invoice before it is posted; the reason is kept on the order.</p>
      </div>
    </form>
    <template #footer>
      <div class="p-4 flex justify-end gap-2">
        <button type="button" class="btn-ghost text-xs" @click="$emit('update:modelValue', false)">Cancel</button>
        <button type="submit" form="dispatch-form" class="btn-gold text-xs" :disabled="busy">{{ busy ? 'Posting…' : '📦 Confirm Goods on Board' }}</button>
      </div>
    </template>
  </UiSlideOver>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; orderId: number | null; orderLabel?: string }>()
const emit = defineEmits<{ 'update:modelValue': [boolean]; done: [] }>()
const { success, error: toastError } = useToast()

const blank = () => ({ truck_number: '', driver_name: '', driver_contact: '', bags_boarded: null as number | null,
  bag_size_kg: null as number | null, extra_discount_amount: 0, extra_discount_reason: '' })
const f = reactive(blank())
const busy = ref(false)
watch(() => props.modelValue, (open) => { if (open) Object.assign(f, blank()) })

async function submit() {
  if (!props.orderId) return
  busy.value = true
  try {
    await $fetch(`/api/credit-sales/${props.orderId}/workflow`, {
      method: 'POST',
      body: { to_status: 'goods_on_board', comments: 'Goods on board', dispatch: { ...f } },
    })
    success(`${props.orderLabel ?? 'Order'} — goods on board, invoice posted`)
    emit('update:modelValue', false)
    emit('done')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to mark goods on board')
  } finally {
    busy.value = false
  }
}
</script>
