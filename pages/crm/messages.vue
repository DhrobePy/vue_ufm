<template>
  <div class="space-y-4">
    <HubTabs hub="crm" />
    <UiPageHeader title="CRM — Messages" subtitle="Replies from customers and prospects, and what has been sent" :breadcrumb="['CRM', 'Messages']" />
    <div v-if="g" class="glass-card p-3 text-xs flex flex-wrap gap-x-4 gap-y-1 text-gray-400">
      <span :class="g.enabled ? 'text-emerald-400' : 'text-amber-400'">● Sending {{ g.enabled ? 'is on' : 'is off (Admin → Settings → CRM)' }}</span>
      <span :class="g.sms ? 'text-emerald-400' : 'text-gray-600'">SMS {{ g.sms ? 'connected' : 'not connected' }}</span>
      <span :class="g.whatsapp ? 'text-emerald-400' : 'text-gray-600'">WhatsApp {{ g.whatsapp ? 'connected' : 'not connected' }}</span>
      <span :class="g.inbound_sms || g.inbound_whatsapp ? 'text-emerald-400' : 'text-gray-600'">Replies {{ g.inbound_sms || g.inbound_whatsapp ? 'arrive here' : 'cannot arrive yet (webhook not set up)' }}</span>
      <span class="text-gray-600">{{ data?.opted_out ?? 0 }} on the do-not-contact list</span>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="glass-card p-2 max-h-[70vh] overflow-y-auto lg:col-span-1">
        <button v-for="t in data?.threads ?? []" :key="t.phone9" class="w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.05] border-b border-white/[0.04]" :class="cur === t.phone ? 'bg-white/[0.07]' : ''" @click="open(t.phone)">
          <div class="flex items-center gap-2 text-xs"><span class="font-semibold text-gray-200 flex-1 truncate">{{ t.name ?? t.phone }}</span><span v-if="Number(t.unread)" class="px-1.5 rounded-full bg-gold-500/20 text-gold-400 text-[10px]">{{ t.unread }}</span></div>
          <p class="text-[11px] text-gray-500 truncate">{{ t.direction === 'in' ? '' : 'you: ' }}{{ t.body }}</p>
          <p class="text-[10px] text-gray-600">{{ t.channel }} · {{ String(t.created_at).slice(0, 16) }}</p>
        </button>
        <p v-if="!(data?.threads ?? []).length" class="p-4 text-xs text-gray-600">No messages yet. Messages sent from a customer card or the Today list, and any replies, appear here.</p>
      </div>
      <div class="glass-card p-4 space-y-3 lg:col-span-2">
        <template v-if="conv">
          <div class="flex items-center gap-2"><h2 class="section-title flex-1">{{ conv.party?.name ?? cur }}</h2>
            <NuxtLink v-if="conv.party" :to="conv.party.party_type === 'prospect' ? `/crm/prospects/${conv.party.party_id}` : `/crm/customers/${conv.party.party_id}`" class="btn-ghost text-[11px] px-2.5 py-1">Open card</NuxtLink>
            <button v-if="!conv.opted_out" class="btn-ghost text-[11px] px-2.5 py-1" @click="optout(true)">Do not contact</button></div>
          <p v-if="conv.opted_out" class="text-xs text-red-400">⛔ This number asked not to be contacted. Sending is blocked.</p>
          <div class="space-y-2 max-h-[45vh] overflow-y-auto">
            <div v-for="m in conv.messages" :key="m.id" class="flex" :class="m.direction === 'out' ? 'justify-end' : ''">
              <div class="max-w-[80%] rounded-xl px-3 py-2 text-xs" :class="m.direction === 'out' ? 'bg-gold-500/15 text-gray-100' : 'bg-white/[0.07] text-gray-200'">
                <p class="whitespace-pre-wrap">{{ m.body }}</p>
                <p class="text-[10px] text-gray-500 mt-1">{{ m.channel }} · {{ String(m.created_at).slice(5, 16) }}<template v-if="m.by_user"> · {{ m.by_user }}</template><span v-if="m.status === 'failed'" class="text-red-400"> · not sent: {{ m.error }}</span></p></div></div>
          </div>
          <div v-if="!conv.opted_out && conv.party" class="flex gap-2 items-end">
            <select v-model="ch" class="field-input text-xs py-1.5 w-28"><option value="whatsapp">WhatsApp</option><option value="sms">SMS</option></select>
            <textarea v-model="text" rows="2" class="field-input text-xs flex-1" placeholder="Reply…" />
            <button class="btn-gold text-xs" :disabled="!text.trim() || busy || !g?.enabled" @click="reply">{{ busy ? 'Sending…' : 'Send' }}</button></div>
          <p v-if="conv.party && !g?.enabled" class="text-[11px] text-gray-600">Direct sending is off — reply from your own phone, then log it on the card.</p>
        </template>
        <p v-else class="text-xs text-gray-600">Pick a conversation on the left.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const { data, refresh } = await useFetch<any>('/api/crm/messages', { lazy: true })
const g = computed(() => data.value?.gateway)
const cur = ref(''), conv = ref<any>(null), text = ref(''), ch = ref<'whatsapp' | 'sms'>('whatsapp'), busy = ref(false)
async function open(phone: string) { cur.value = phone; conv.value = await $fetch('/api/crm/messages', { query: { phone } }); await refresh() }
async function reply() {
  busy.value = true
  try { await $fetch('/api/crm/messages/send', { method: 'POST', body: { party_type: conv.value.party.party_type, party_id: conv.value.party.party_id, channel: ch.value, text: text.value, to: cur.value } }); text.value = ''; success('Sent'); await open(cur.value) }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Not sent') } finally { busy.value = false }
}
async function optout(on: boolean) { try { await $fetch('/api/crm/messages/optout', { method: 'POST', body: { phone: cur.value, optout: on } }); await open(cur.value) } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Failed') } }
</script>
