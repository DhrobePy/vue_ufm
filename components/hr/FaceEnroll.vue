<template>
  <div class="face-enroll">

    <!-- Status banner -->
    <div class="face-status" :class="statusClass">
      {{ statusMsg }}
    </div>

    <!-- Error if no employee -->
    <div v-if="!employeeId" class="face-status status-error">
      No employee ID — cannot save face data
    </div>

    <!-- Video / Canvas -->
    <div class="face-video-wrap">
      <video ref="videoEl" class="face-video" autoplay muted playsinline></video>
      <canvas ref="overlayEl" class="face-overlay"></canvas>
      <div v-if="samples.length > 0" class="face-badge">
        ✓ {{ samples.length }}/3 captured
      </div>
    </div>

    <!-- Controls -->
    <div class="face-controls">
      <template v-if="!streaming">
        <button
          class="btn-primary"
          :disabled="loading || !employeeId"
          @click="startCamera"
        >
          {{ loading ? 'Loading models…' : '📷 Start Camera' }}
        </button>
      </template>
      <template v-else>
        <button
          class="btn-primary"
          :disabled="!faceDetected || samples.length >= 3 || capturing"
          @click="captureSample"
        >
          {{ capturing ? 'Capturing…' : `📸 Capture (${samples.length}/3)` }}
        </button>
        <button
          v-if="samples.length === 3"
          class="btn-primary"
          style="background:#22c55e;border-color:#22c55e"
          :disabled="enrolling"
          @click="enroll"
        >
          {{ enrolling ? 'Saving…' : '💾 Save Face ID' }}
        </button>
        <button class="btn-secondary" @click="reset">↺ Reset</button>
      </template>
    </div>

    <p style="font-size:.75rem;color:#64748b;text-align:center;margin-top:4px">
      Position face clearly in frame · Capture 3 samples · Click Save
    </p>

    <div v-if="debugInfo" class="face-debug">{{ debugInfo }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ employeeId: number | null }>()
const emit  = defineEmits<{ (e: 'done'): void }>()

const videoEl      = ref<HTMLVideoElement | null>(null)
const overlayEl    = ref<HTMLCanvasElement | null>(null)
const streaming    = ref(false)
const loading      = ref(false)
const capturing    = ref(false)
const enrolling    = ref(false)
const faceDetected = ref(false)
const samples      = ref<number[][]>([])
const statusMsg    = ref('Click "Start Camera" to begin')
const statusType   = ref<'idle'|'ok'|'warn'|'error'>('idle')
const debugInfo    = ref('')

let faceapi: any = null
let stream: MediaStream | null       = null
let detectInterval: ReturnType<typeof setInterval> | null = null
let modelsLoaded = false

const statusClass = computed(() => ({
  'status-idle':  statusType.value === 'idle',
  'status-ok':    statusType.value === 'ok',
  'status-warn':  statusType.value === 'warn',
  'status-error': statusType.value === 'error',
}))

function setStatus(type: 'idle'|'ok'|'warn'|'error', msg: string) {
  statusType.value = type
  statusMsg.value  = msg
}

async function loadModels() {
  if (modelsLoaded) return
  setStatus('idle', 'Loading face recognition models…')
  const fa = await import('@vladmandic/face-api')
  faceapi = fa
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models')
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
  modelsLoaded = true
}

async function startCamera() {
  if (!props.employeeId) return
  loading.value   = true
  debugInfo.value = ''
  try {
    await loadModels()
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: { ideal: 'user' } }
      })
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({ video: true })
    }
    videoEl.value!.srcObject = stream
    await new Promise<void>(r => { videoEl.value!.onloadedmetadata = () => r() })
    await videoEl.value!.play()
    streaming.value = true
    setStatus('ok', 'Camera ready — position face in frame')
    startDetection()
  } catch (e: any) {
    setStatus('error', 'Camera failed: ' + (e.message || 'Permission denied'))
    debugInfo.value = String(e)
  } finally {
    loading.value = false
  }
}

function startDetection() {
  clearInterval(detectInterval!)
  detectInterval = setInterval(async () => {
    if (!videoEl.value || videoEl.value.readyState < 2) return
    try {
      const det = await faceapi
        .detectSingleFace(videoEl.value, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor()

      const canvas = overlayEl.value
      if (!canvas) return
      const dims = { width: videoEl.value.videoWidth, height: videoEl.value.videoHeight }
      faceapi.matchDimensions(canvas, dims)
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)

      if (det) {
        faceDetected.value = true
        if (samples.value.length < 3) setStatus('ok', 'Face detected ✓ — click Capture')
        const resized = faceapi.resizeResults(det, dims)
        faceapi.draw.drawDetections(canvas, resized)
        faceapi.draw.drawFaceLandmarks(canvas, resized)
      } else {
        faceDetected.value = false
        if (samples.value.length < 3) setStatus('warn', 'No face detected — move closer')
      }
    } catch { /* frame error — skip */ }
  }, 200)
}

async function captureSample() {
  if (!faceDetected.value || capturing.value) return
  capturing.value = true
  try {
    const det = await faceapi
      .detectSingleFace(videoEl.value, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceDescriptor()
    if (!det) { setStatus('warn', 'Face lost — try again'); return }
    samples.value.push(Array.from(det.descriptor))
    if (samples.value.length < 3) setStatus('ok', `Sample ${samples.value.length}/3 — keep going`)
    else setStatus('ok', '3/3 samples captured — click Save Face ID ✓')
  } finally { capturing.value = false }
}

async function enroll() {
  if (!props.employeeId) { setStatus('error', 'Employee ID missing'); return }
  if (samples.value.length < 3) { setStatus('warn', 'Need 3 samples'); return }

  enrolling.value = true
  debugInfo.value = ''
  try {
    // Average 3 descriptors for a more stable reference
    const avg = Array.from({ length: 128 }, (_, i) =>
      samples.value.reduce((sum, d) => sum + d[i], 0) / samples.value.length
    )
    if (avg.length !== 128 || avg.some(v => isNaN(v))) {
      setStatus('error', 'Descriptor error — reset and try again')
      return
    }

    setStatus('idle', 'Saving face data to server…')
    const res = await $fetch<any>('/api/hr/employees/face', {
      method: 'POST',
      body: { employee_id: props.employeeId, descriptor: avg },
    })

    if (res.success) {
      setStatus('ok', `✅ Face ID saved for employee #${props.employeeId}`)
      stopCamera()
      emit('done')
    } else {
      setStatus('error', res.message || 'Server returned failure')
      debugInfo.value = JSON.stringify(res)
    }
  } catch (e: any) {
    const msg = e?.message || String(e)
    setStatus('error', 'Save failed: ' + msg)
    debugInfo.value = 'emp=' + props.employeeId + ' | ' + msg
  } finally { enrolling.value = false }
}

function reset() {
  samples.value      = []
  faceDetected.value = false
  debugInfo.value    = ''
  setStatus('ok', 'Reset — position face and capture again')
}

function stopCamera() {
  if (detectInterval) { clearInterval(detectInterval); detectInterval = null }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
  streaming.value = false
}

onUnmounted(stopCamera)
</script>

<style scoped>
.face-enroll { display: flex; flex-direction: column; gap: 12px; }

.face-status {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 14px; border-radius: 8px; font-size: .8125rem; font-weight: 500;
}
.status-idle  { background: rgba(255,255,255,.05); color: #94a3b8; border: 1px solid rgba(255,255,255,.08); }
.status-ok    { background: rgba(34,197,94,.1);  color: #22c55e; border: 1px solid rgba(34,197,94,.2); }
.status-warn  { background: rgba(245,158,11,.1); color: #f59e0b; border: 1px solid rgba(245,158,11,.2); }
.status-error { background: rgba(225,29,72,.1);  color: #ef4444; border: 1px solid rgba(225,29,72,.2); }

.face-video-wrap {
  position: relative; width: 100%; aspect-ratio: 4/3;
  background: #0f172a; border-radius: 10px; overflow: hidden;
  border: 1px solid rgba(255,255,255,.08);
}
.face-video    { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
.face-overlay  { position: absolute; inset: 0; width: 100%; height: 100%; transform: scaleX(-1); }
.face-badge {
  position: absolute; top: 10px; right: 10px;
  background: rgba(34,197,94,.9); color: #fff;
  font-size: .75rem; font-weight: 700;
  padding: 4px 10px; border-radius: 99px;
}
.face-controls { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.face-debug {
  padding: 8px 12px; background: rgba(255,255,255,.04);
  border-radius: 6px; font-size: .75rem; font-family: monospace;
  color: #64748b; word-break: break-all;
}
</style>
