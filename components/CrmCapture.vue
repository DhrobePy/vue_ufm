<template>
  <div class="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
    <button type="button" class="btn-ghost text-[11px] px-2.5 py-1" :disabled="locating" @click="locate">📍 {{ geo ? `Location captured (±${geo.acc} m)` : locating ? 'Locating…' : 'Capture my location' }}</button>
    <label v-if="geo" class="flex items-center gap-1"><input type="checkbox" :checked="pin" @change="emit('update:pin', ($event.target as HTMLInputElement).checked)" /> Save as this place's location</label>
    <template v-if="canDictate">
      <button type="button" class="btn-ghost text-[11px] px-2.5 py-1" @click="dictate">{{ listening ? '⏹ Stop' : '🎙 Dictate' }}</button>
      <select v-model="lang" class="field-input text-[11px] py-1 w-24"><option value="bn-BD">বাংলা</option><option value="en-US">English</option></select>
    </template>
    <span v-if="msg" class="text-amber-400">{{ msg }}</span>
  </div>
</template>

<script setup lang="ts">
/** Visit helpers: capture the phone's GPS position and dictate the note (browser speech recognition — nothing is uploaded by us). */
const props = defineProps<{ modelValue: string; geo: { lat: number; lon: number; acc: number } | null; pin: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [string]; 'update:geo': [any]; 'update:pin': [boolean] }>()
const locating = ref(false), listening = ref(false), msg = ref(''), lang = ref('bn-BD'), canDictate = ref(false)
let rec: any = null
onMounted(() => { canDictate.value = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) })
function locate() {
  msg.value = ''
  if (!navigator.geolocation) { msg.value = 'This browser cannot give a location.'; return }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    p => { locating.value = false; emit('update:geo', { lat: +p.coords.latitude.toFixed(6), lon: +p.coords.longitude.toFixed(6), acc: Math.round(p.coords.accuracy) }) },
    e => { locating.value = false; msg.value = e.code === 1 ? 'Location permission was refused — allow it in the browser to use this.' : 'Could not get a position, try again outdoors.' },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
}
function dictate() {
  if (listening.value) { rec?.stop(); return }
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  rec = new SR(); rec.lang = lang.value; rec.interimResults = false; rec.continuous = true
  rec.onresult = (e: any) => { let t = ''; for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript; if (t) emit('update:modelValue', (props.modelValue ? props.modelValue + ' ' : '') + t.trim()) }
  rec.onend = () => { listening.value = false }
  rec.onerror = (e: any) => { listening.value = false; msg.value = e.error === 'not-allowed' ? 'Microphone permission was refused.' : 'Could not hear that — try again.' }
  listening.value = true; msg.value = ''; rec.start()
}
</script>
