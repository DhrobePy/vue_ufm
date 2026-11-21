<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-3" @click.self="close">
    <div class="glass-card w-full max-w-lg p-4 space-y-3 max-h-[90vh] overflow-y-auto">
      <div class="flex items-start gap-2"><div class="flex-1"><h3 class="section-title">Message {{ name }}</h3><p class="text-[11px] text-gray-500">{{ kindLabel }} — a draft you check and send; nothing goes out by itself.</p></div><button class="text-gray-500 hover:text-gray-200 text-lg leading-none" @click="close">×</button></div>
      <div class="flex flex-wrap gap-2">
        <select v-model="ch" class="field-input text-xs py-1.5 w-32"><option value="whatsapp">WhatsApp</option><option value="sms">SMS</option></select>
        <select v-model="lang" class="field-input text-xs py-1.5 w-28"><option value="bn">বাংলা</option><option value="en">English</option></select>
        <select v-if="partyType === 'customer'" v-model="kd" class="field-input text-xs py-1.5 w-40"><option v-for="(l, k) in KINDS" :key="k" :value="k">{{ l }}</option></select>
        <button class="btn-gold text-xs" :disabled="busy" @click="write">{{ busy ? 'Writing…' : body ? 'Rewrite' : 'Write draft' }}</button>
      </div>
      <textarea v-model="body" rows="6" class="field-input text-xs w-full" placeholder="Press “Write draft”, then edit as you like." />
      <p v-if="source" class="text-[11px] text-gray-600">{{ source === 'assistant' ? 'written by the assistant' : 'standard template (switch the assistant on in Settings → CRM for tailored drafts)' }} · {{ body.length }} characters{{ ch === 'sms' && body.length > 160 ? ' · more than one SMS' : '' }}</p>
      <p v-if="body.includes('[PHONE]')" class="text-[11px] text-amber-400">Replace [PHONE] with the company number (or set it in Admin → Settings → Company) before sending.</p>
      <p v-if="optedOut" class="text-[11px] text-red-400">This number asked not to be contacted — do not message it.</p>
      <p v-if="!phone" class="text-[11px] text-amber-400">No phone number on record for this contact.</p>
      <div class="flex flex-wrap gap-2 items-center">
        <button v-if="gw?.enabled && (ch === 'sms' ? gw.sms : gw.whatsapp)" class="btn-gold text-xs" :disabled="!ok || sending" @click="send">{{ sending ? 'Sending…' : 'Send now' }}</button>
        <a v-if="ch === 'whatsapp' && waUrl" :href="waUrl" target="_blank" rel="noopener" class="btn-ghost text-xs" :class="{ 'pointer-events-none opacity-40': !ok }" @click="logManual('Opened WhatsApp')">Open in WhatsApp</a>
        <a v-if="ch === 'sms' && smsUrl" :href="smsUrl" class="btn-ghost text-xs" :class="{ 'pointer-events-none opacity-40': !ok }" @click="logManual('Opened SMS app')">Open in SMS app</a>
        <button class="btn-ghost text-xs" :disabled="!body" @click="copy">Copy</button>
        <span v-if="gw && !gw.enabled" class="text-[11px] text-gray-600">Direct sending is off (Settings → CRM) — use the buttons that open your own phone.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean; partyType: 'customer' | 'prospect'; partyId: number; name: string; phone: string | null; kind?: string; optedOut?: boolean }>()
const emit = defineEmits<{ close: []; done: [] }>()
const { success, error: toastError } = useToast()
const KINDS: Record<string, string> = { reorder: 'Reorder nudge', collect: 'Payment reminder', winback: 'Win-back', crosssell: 'Offer a product', checkin: 'Check-in' }
const ch = ref<'whatsapp' | 'sms'>('whatsapp'), lang = ref<'bn' | 'en'>('bn'), kd = ref(props.kind ?? 'checkin'), body = ref(''), source = ref(''), busy = ref(false), sending = ref(false)
const { data: gw } = await useFetch<any>('/api/crm/messages/status', { lazy: true, server: false })
watch(() => props.open, v => { if (v) { kd.value = props.kind ?? 'checkin'; body.value = ''; source.value = '' } })
const kindLabel = computed(() => props.partyType === 'prospect' ? 'First contact' : KINDS[kd.value])
const intl = computed(() => { const d = String(props.phone ?? '').replace(/\D/g, ''); return d.startsWith('880') ? d : d.startsWith('0') ? '88' + d : d.length === 10 ? '880' + d : d })
const ok = computed(() => !!body.value.trim() && !!props.phone && !props.optedOut && !body.value.includes('[PHONE]'))
const waUrl = computed(() => intl.value ? `https://wa.me/${intl.value}?text=${encodeURIComponent(body.value)}` : '')
const smsUrl = computed(() => intl.value ? `sms:+${intl.value}?body=${encodeURIComponent(body.value)}` : '')
async function write() {
  busy.value = true
  try { const r: any = await $fetch(props.partyType === 'customer' ? `/api/crm/customers/${props.partyId}/draft` : `/api/crm/prospects/${props.partyId}/draft`, { method: 'POST', body: { kind: kd.value, channel: ch.value, lang: lang.value } }); body.value = r.body; source.value = r.source }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not write a draft') } finally { busy.value = false }
}
async function logManual(what: string) {
  await $fetch('/api/crm/interactions', { method: 'POST', body: { party_type: props.partyType, party_id: props.partyId, channel: ch.value, summary: `${what}: ${body.value.slice(0, 300)}` } }).catch(() => {})
  emit('done')
}
async function send() {
  sending.value = true
  try { await $fetch('/api/crm/messages/send', { method: 'POST', body: { party_type: props.partyType, party_id: props.partyId, channel: ch.value, text: body.value } }); success('Sent'); emit('done'); close() }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Not sent') } finally { sending.value = false }
}
async function copy() { try { await navigator.clipboard.writeText(body.value); success('Copied') } catch { toastError('Copy failed') } }
function close() { emit('close') }
</script>
