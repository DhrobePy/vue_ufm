<template>
  <div class="space-y-4">
    <HubTabs hub="crm" />
    <UiPageHeader title="Ask the CRM assistant" subtitle="Questions about customers, collections and prospects — answers come from your live data" :breadcrumb="['CRM', 'Ask']" />
    <div v-if="st && !(st.enabled && st.configured)" class="glass-card p-4 text-xs text-amber-200 border border-amber-500/30">
      <strong>The assistant is not ready:</strong>
      <span v-if="!st.enabled"> it is switched off (an admin turns it on in Settings → CRM).</span>
      <span v-else> the server has no API key yet — the administrator must add <code>NUXT_ANTHROPIC_API_KEY</code> to the server settings file. Everything else in the CRM works without it.</span>
    </div>
    <div v-else-if="st" class="text-[11px] text-gray-600">Model {{ st.model }} · {{ st.used_today }} / {{ st.daily_limit }} questions today{{ st.web_search ? ' · web search on' : '' }} · phone numbers {{ st.mask_phones ? 'are hidden from the AI' : 'are shared with the AI' }} · it can add prospects, notes and tasks, never change money or send messages.</div>

    <div class="glass-card p-4 space-y-3 min-h-[20rem]">
      <div v-if="!msgs.length" class="space-y-2">
        <p class="text-xs text-gray-500">Try:</p>
        <button v-for="s in samples" :key="s" class="block text-left text-xs px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 w-full" @click="send(s)">{{ s }}</button>
      </div>
      <div v-for="(m, i) in msgs" :key="i" class="text-sm" :class="m.role === 'user' ? 'text-right' : ''">
        <div class="inline-block max-w-[92%] text-left px-3 py-2 rounded-xl whitespace-pre-wrap" :class="m.role === 'user' ? 'bg-gold-500/15 text-gray-100' : 'bg-white/[0.05] text-gray-200'">{{ m.text }}</div>
        <p v-if="m.meta" class="text-[10px] text-gray-600 mt-0.5">{{ m.meta }}</p>
      </div>
      <p v-if="busy" class="text-xs text-gray-500 animate-pulse">Thinking… (it may look things up first)</p>
    </div>
    <form class="flex gap-2" @submit.prevent="send(q)">
      <input v-model="q" class="field-input flex-1" placeholder="Ask about a customer, a collection, your portfolio, or new prospects…" :disabled="busy" />
      <button class="btn-gold" :disabled="busy || !q.trim() || !(st?.enabled && st?.configured)">Ask</button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { error: toastError } = useToast()
const { data: st } = await useFetch<any>('/api/crm/agent-status')
const msgs = ref<{ role: 'user' | 'assistant'; text: string; meta?: string }[]>([]), q = ref(''), busy = ref(false)
const samples = ['Which customers should we call first today, and why?', 'How is our customer portfolio — where are we weak?', 'Which good payers could have their credit limit reviewed?', 'Find 5 bakeries in Gazipur or Narayanganj that could buy our moyda, with their contact details and where you found them.']
async function send(text: string) {
  text = text.trim(); if (!text || busy.value) return
  const history = msgs.value.map(m => ({ role: m.role, text: m.text })); msgs.value.push({ role: 'user', text }); q.value = ''; busy.value = true
  try {
    const r: any = await $fetch('/api/crm/agent', { method: 'POST', body: { question: text, history } })
    msgs.value.push({ role: 'assistant', text: r.answer, meta: `${r.tools_used.length ? 'looked at: ' + r.tools_used.join(', ') + ' · ' : ''}${r.web_searches ? r.web_searches + ' web search(es) · ' : ''}${r.tokens.input + r.tokens.output} tokens` })
  } catch (e: any) { msgs.value.push({ role: 'assistant', text: `⚠ ${e?.data?.statusMessage ?? 'Something went wrong'}` }); toastError(e?.data?.statusMessage ?? 'Failed') } finally { busy.value = false }
}
</script>
