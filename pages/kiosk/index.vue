<template>
  <div class="kiosk">

    <!-- ── Phase: Branch selection ─────────────────────────── -->
    <div v-if="phase === 'branch'" class="kiosk-center">
      <div class="kiosk-logo">
        <span style="font-size:52px">🏢</span>
      </div>
      <h2 class="kiosk-title">Select Your Location</h2>
      <p class="kiosk-desc">Choose the branch this kiosk is installed at.</p>
      <div class="kiosk-branch-list">
        <button
          v-for="b in branches"
          :key="b.id"
          class="kiosk-branch-btn"
          @click="selectBranch(b)"
        >
          <span style="font-size:26px">📍</span>
          <div style="flex:1">
            <div style="font-weight:700;font-size:1rem">{{ b.name }}</div>
            <div style="font-size:.8125rem;color:#64748b;margin-top:2px">{{ b.location || 'No location set' }}</div>
          </div>
          <span style="color:#64748b">›</span>
        </button>
      </div>
    </div>

    <!-- ── Phase: Initializing ──────────────────────────────── -->
    <div v-else-if="phase === 'init'" class="kiosk-center">
      <div class="kiosk-spinner"></div>
      <p class="kiosk-msg" style="margin-top:12px">{{ initMsg }}</p>
      <p v-if="branchInfo" style="font-size:.8125rem;color:#64748b;margin-top:4px">{{ branchInfo.name }}</p>
    </div>

    <!-- ── Phase: Error ─────────────────────────────────────── -->
    <div v-else-if="phase === 'error'" class="kiosk-center">
      <span style="font-size:60px">⚠️</span>
      <h2 class="kiosk-title">Setup Error</h2>
      <p class="kiosk-desc" style="color:#ef4444">{{ errorMsg }}</p>
      <div style="display:flex;gap:10px;margin-top:12px">
        <button class="kiosk-btn kiosk-btn-outline" @click="resetBranch">Change Branch</button>
        <button class="kiosk-btn" @click="doInit">Retry</button>
      </div>
    </div>

    <!-- ── Phase: Face scan (always in DOM so videoEl ref is ready) ── -->
    <div v-show="phase === 'scan'" class="kiosk-scan">

      <div class="kiosk-header">
        <span style="font-size:20px">🔒</span>
        <div style="flex:1">
          <span class="kiosk-brand">FMC-ERP Attendance</span>
          <span v-if="branchInfo" style="font-size:.75rem;color:#64748b;margin-left:8px">{{ branchInfo.name }}</span>
        </div>
        <span class="kiosk-time">{{ clockDisplay }}</span>
        <button class="kiosk-change-btn" @click="resetBranch" title="Change branch">⇄</button>
      </div>

      <!-- Camera -->
      <div class="kiosk-cam-wrap">
        <video ref="videoEl" class="kiosk-cam" autoplay muted playsinline></video>
        <canvas ref="overlayEl" class="kiosk-overlay"></canvas>
        <div class="kiosk-scanline"></div>
        <div class="kiosk-ring" :class="ringClass"></div>
      </div>

      <div class="kiosk-scan-msg" :class="scanMsgClass">
        {{ scanMsg }}
      </div>

      <!-- Recent logs -->
      <div class="kiosk-recent" v-if="recentLogs.length">
        <div class="kiosk-recent-row" v-for="log in recentLogs" :key="log.id">
          <span class="kiosk-recent-name">{{ log.name }}</span>
          <span class="kiosk-recent-action" :class="actionClass(log.action)">
            {{ actionLabel(log.action) }}
          </span>
          <span class="kiosk-recent-time">{{ log.time }}</span>
        </div>
      </div>

      <div class="kiosk-no-enroll" v-if="enrolledCount === 0 && phase === 'scan'">
        ℹ️ No face IDs enrolled — go to <strong>HR → Employees → Face ID</strong> to enrol staff
      </div>
    </div>

    <!-- ── Phase: Result feedback ───────────────────────────── -->
    <div v-if="phase === 'result'" class="kiosk-center">
      <div class="kiosk-result-icon" :class="actionClass(resultData.action)">
        <span style="font-size:48px">{{ actionEmoji(resultData.action) }}</span>
      </div>
      <h2 class="kiosk-title" style="margin-top:20px">{{ resultData.name }}</h2>
      <div class="kiosk-result-action" :class="actionClass(resultData.action)">
        {{ resultData.message || actionText(resultData.action) }}
      </div>
      <p class="kiosk-desc" style="font-size:1.25rem;margin-top:8px">{{ resultData.time }}</p>
      <div v-if="resultData.punch_count > 1" style="margin-top:6px;font-size:.8rem;opacity:.6">
        Punch #{{ resultData.punch_count }} today
        <span v-if="resultData.overtime"> · ⏰ Overtime recorded</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'kiosk' })

const route = useRoute()

// ── State ──────────────────────────────────────────────────
const phase         = ref<string>('init')
const initMsg       = ref('Starting…')
const errorMsg      = ref('')
const branches      = ref<any[]>([])
const branchInfo    = ref<any>(null)
const scanMsg       = ref('Looking for face…')
const scanMsgClass  = ref('kiosk-msg-idle')
const ringClass     = ref('')
const resultData    = ref<any>({})
const recentLogs    = ref<any[]>([])
const clockDisplay  = ref('')
const enrolledCount = ref(0)

const videoEl   = ref<HTMLVideoElement | null>(null)
const overlayEl = ref<HTMLCanvasElement | null>(null)

let faceapi: any        = null
let stream: MediaStream | null = null
let detectInterval: ReturnType<typeof setInterval> | null = null
let clockInterval:  ReturnType<typeof setInterval> | null = null
let labeledDescriptors: any[] = []
let cooldown    = false
let modelsLoaded = false

const MATCH_THRESHOLD = 0.45

// ── Clock ──────────────────────────────────────────────────
function startClock() {
  const tick = () => {
    clockDisplay.value = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  }
  tick()
  clockInterval = setInterval(tick, 1000)
}

// ── Branch helpers ─────────────────────────────────────────
async function loadBranches() {
  try {
    const res = await $fetch<any>('/api/branches')
    branches.value = res.branches ?? []
  } catch {
    branches.value = [
      { id: 1, name: 'Head Office', location: '' },
      { id: 2, name: 'Branch 2', location: '' },
    ]
  }
}

function selectBranch(branch: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kiosk_branch_id', String(branch.id))
    localStorage.setItem('kiosk_branch_name', branch.name)
  }
  branchInfo.value = branch
  doInit()
}

function resetBranch() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('kiosk_branch_id')
    localStorage.removeItem('kiosk_branch_name')
  }
  branchInfo.value = null
  stopCamera()
  phase.value = 'branch'
}

// ── Main init ──────────────────────────────────────────────
async function doInit() {
  phase.value    = 'init'
  errorMsg.value = ''

  if (typeof window === 'undefined') return   // SSR guard

  // Restore branch from localStorage
  const storedId   = localStorage.getItem('kiosk_branch_id')
  const storedName = localStorage.getItem('kiosk_branch_name')
  if (storedId && !branchInfo.value) {
    branchInfo.value = { id: parseInt(storedId), name: storedName || `Branch ${storedId}` }
  }

  try {
    // 1. Load face-api models (dynamic import — browser only)
    if (!modelsLoaded) {
      initMsg.value = 'Loading face recognition models…'
      const fa = await import('@vladmandic/face-api')
      faceapi = fa
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models')
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      modelsLoaded = true
    }

    // 2. Verify branch
    initMsg.value = 'Verifying branch…'
    const vRes = await $fetch<any>('/api/kiosk/verify', {
      method: 'POST',
      body: { device_id: branchInfo.value?.id },
    })
    if (!vRes.success) {
      errorMsg.value = vRes.message || 'Branch not found'
      phase.value    = 'error'
      return
    }
    if (vRes.branch) branchInfo.value = { ...branchInfo.value, ...vRes.branch }

    // 3. Load face descriptors
    initMsg.value = 'Loading employee face data…'
    const fRes = await $fetch<any>('/api/kiosk/descriptors')
    labeledDescriptors = []
    enrolledCount.value = fRes.count ?? 0

    if (fRes.success && fRes.employees?.length) {
      const empMap: Record<string, string> = {}
      labeledDescriptors = fRes.employees
        .filter((e: any) => Array.isArray(e.descriptor) && e.descriptor.length === 128)
        .map((e: any) => {
          empMap[String(e.employee_id)] = e.name
          return new faceapi.LabeledFaceDescriptors(
            String(e.employee_id),
            [new Float32Array(e.descriptor)]
          )
        })
      ;(window as any)._kioskEmpMap = empMap
    }

    // 4. Switch to scan — camera starts via watcher
    phase.value = 'scan'
    await nextTick()
    await startCamera()

  } catch (e: any) {
    errorMsg.value = e.message || 'Initialization failed'
    phase.value    = 'error'
    console.error('[Kiosk]', e)
  }
}

async function startCamera() {
  stopCamera()
  if (!videoEl.value) return

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'user' }, width: { ideal: 640 }, height: { ideal: 480 } }
    })
  } catch {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
  }

  videoEl.value.srcObject = stream
  await new Promise<void>(resolve => {
    videoEl.value!.onloadedmetadata = () => resolve()
  })
  await videoEl.value.play()
  startDetection()
}

function stopCamera() {
  if (detectInterval) { clearInterval(detectInterval); detectInterval = null }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
}

// ── Face detection loop ────────────────────────────────────
function startDetection() {
  if (!faceapi) return
  const matcher = labeledDescriptors.length
    ? new faceapi.FaceMatcher(labeledDescriptors, MATCH_THRESHOLD)
    : null

  detectInterval = setInterval(async () => {
    if (cooldown || phase.value !== 'scan') return
    if (!videoEl.value || videoEl.value.readyState < 2) return
    cooldown = true

    let det: any
    try {
      det = await faceapi
        .detectSingleFace(videoEl.value, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor()
    } catch {
      cooldown = false
      return
    }

    const canvas = overlayEl.value
    if (!canvas) { cooldown = false; return }
    const dims = { width: videoEl.value.videoWidth, height: videoEl.value.videoHeight }
    faceapi.matchDimensions(canvas, dims)
    const ctx = canvas.getContext('2d')
    ctx?.clearRect(0, 0, canvas.width, canvas.height)

    if (!det) {
      scanMsg.value      = 'No face detected — step closer'
      scanMsgClass.value = 'kiosk-msg-idle'
      ringClass.value    = ''
      cooldown = false
      return
    }

    const resized = faceapi.resizeResults(det, dims)
    faceapi.draw.drawDetections(canvas, resized)

    if (!matcher) {
      scanMsg.value      = 'No employees enrolled — contact your administrator'
      scanMsgClass.value = 'kiosk-msg-warn'
      cooldown = false
      return
    }

    const match = matcher.findBestMatch(det.descriptor)

    if (match.label === 'unknown') {
      scanMsg.value      = 'Face not recognized'
      scanMsgClass.value = 'kiosk-msg-warn'
      ringClass.value    = 'ring-warn'
      setTimeout(() => { cooldown = false }, 1500)
    } else {
      scanMsg.value      = 'Recognized! Recording attendance…'
      scanMsgClass.value = 'kiosk-msg-ok'
      ringClass.value    = 'ring-ok'
      await doRecord(match.label)
    }
  }, 300)
}

// ── Record attendance ──────────────────────────────────────
async function doRecord(employeeIdStr: string) {
  try {
    const res = await $fetch<any>('/api/kiosk/clock-in', {
      method: 'POST',
      body: { employee_id: parseInt(employeeIdStr), device_id: branchInfo.value?.id ?? 1 },
    })

    if (res.success) {
      const empName = res.employee_name
        || ((window as any)._kioskEmpMap ?? {})[employeeIdStr]
        || 'Employee'

      // Format time display
      const rawTime = res.time ?? ''
      const timeStr  = rawTime.length >= 16 ? rawTime.slice(11, 16) : rawTime

      recentLogs.value.unshift({ id: Date.now(), name: empName, action: res.action, time: timeStr })
      if (recentLogs.value.length > 5) recentLogs.value.pop()

      resultData.value = {
        name:        empName,
        action:      res.action,
        message:     res.message,
        time:        timeStr,
        punch_count: res.punch_count ?? 1,
        overtime:    res.overtime ?? false,
      }
      phase.value = 'result'
      setTimeout(() => {
        phase.value        = 'scan'
        scanMsg.value      = 'Looking for face…'
        scanMsgClass.value = 'kiosk-msg-idle'
        ringClass.value    = ''
        cooldown           = false
      }, 3000)
    } else {
      scanMsg.value      = res.message || 'Already recorded'
      scanMsgClass.value = 'kiosk-msg-warn'
      setTimeout(() => { cooldown = false }, 3000)
    }
  } catch {
    cooldown = false
  }
}

// ── UI helpers ─────────────────────────────────────────────
function actionClass(action: string) {
  if (action === 'clock_in')  return 'ci'
  if (action === 'clock_out') return 'co'
  return 'ret'
}
function actionEmoji(action: string) {
  if (action === 'clock_in')  return '✅'
  if (action === 'clock_out') return '👋'
  return '🔄'
}
function actionText(action: string) {
  if (action === 'clock_in')  return 'Clocked In'
  if (action === 'clock_out') return 'Clocked Out'
  return 'Welcome Back'
}
function actionLabel(action: string) {
  if (action === 'clock_in')  return '↑ IN'
  if (action === 'clock_out') return '↓ OUT'
  return '↺ BACK'
}

// ── Lifecycle ──────────────────────────────────────────────
onMounted(async () => {
  startClock()

  // Support ?branch=2 URL param (from HR dashboard "Open Kiosk" link)
  const urlBranch = route.query.branch as string | undefined
  if (urlBranch && typeof window !== 'undefined') {
    localStorage.setItem('kiosk_branch_id', urlBranch)
  }

  const storedId = typeof window !== 'undefined' ? localStorage.getItem('kiosk_branch_id') : null
  if (storedId) {
    branchInfo.value = {
      id:   parseInt(storedId),
      name: typeof window !== 'undefined'
        ? (localStorage.getItem('kiosk_branch_name') || `Branch ${storedId}`)
        : `Branch ${storedId}`,
    }
    await doInit()
  } else {
    await loadBranches()
    phase.value = 'branch'
  }
})

onUnmounted(() => {
  if (detectInterval) clearInterval(detectInterval)
  if (clockInterval)  clearInterval(clockInterval)
  stopCamera()
})
</script>

<style scoped>
/* ── Base ─────────────────────────────────────────────────── */
.kiosk {
  width: 100vw;
  height: 100vh;
  background: #0f172a;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  overflow: hidden;
}

/* ── Centered phases ──────────────────────────────────────── */
.kiosk-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 32px;
  text-align: center;
  max-width: 480px;
  width: 100%;
}
.kiosk-logo  { margin-bottom: 4px; }
.kiosk-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin: 0; }
.kiosk-desc  { font-size: .875rem; color: #94a3b8; max-width: 340px; margin: 0; }
.kiosk-msg   { color: #94a3b8; font-size: .875rem; }
.kiosk-spinner {
  width: 48px; height: 48px; border-radius: 50%;
  border: 3px solid rgba(245,158,11,.2);
  border-top-color: #f59e0b;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Buttons ─────────────────────────────────────────────── */
.kiosk-btn {
  padding: 10px 28px;
  background: #f59e0b;
  color: #0f172a;
  border: none;
  border-radius: 8px;
  font-size: .875rem;
  font-weight: 700;
  cursor: pointer;
  transition: background .2s;
}
.kiosk-btn:hover { background: #d97706; }
.kiosk-btn-outline {
  background: transparent;
  border: 1px solid #334155;
  color: #94a3b8;
}
.kiosk-btn-outline:hover { background: #1e293b; }

/* ── Branch list ─────────────────────────────────────────── */
.kiosk-branch-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
}
.kiosk-branch-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  color: #f1f5f9;
  text-align: left;
  transition: background .2s, border-color .2s;
}
.kiosk-branch-btn:hover { background: #263347; border-color: #f59e0b; }

/* ── Scan layout ─────────────────────────────────────────── */
.kiosk-scan {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  align-items: center;
}
.kiosk-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding-bottom: 12px;
  border-bottom: 1px solid #1e293b;
}
.kiosk-brand { font-size: 1rem; font-weight: 700; color: #f1f5f9; }
.kiosk-time  { font-size: .9375rem; font-weight: 600; color: #94a3b8; font-family: monospace; }
.kiosk-change-btn {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 1rem;
}
.kiosk-change-btn:hover { background: #263347; color: #f1f5f9; }

/* ── Camera ──────────────────────────────────────────────── */
.kiosk-cam-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 14px;
  overflow: hidden;
  border: 2px solid #1e293b;
  background: #000;
}
.kiosk-cam {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}
.kiosk-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
}
.kiosk-scanline {
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
  animation: scanLine 2.5s ease-in-out infinite;
}
@keyframes scanLine {
  0%   { top: 0%;   opacity: 1; }
  50%  { top: 100%; opacity: .4; }
  100% { top: 0%;   opacity: 1; }
}
.kiosk-ring {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  border: 3px solid transparent;
  transition: border-color .3s;
}
.kiosk-ring.ring-ok   { border-color: #22c55e; }
.kiosk-ring.ring-warn { border-color: #f59e0b; }

/* ── Scan message ────────────────────────────────────────── */
.kiosk-scan-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 18px;
  border-radius: 10px;
  font-size: .9375rem;
  font-weight: 600;
  width: 100%;
}
.kiosk-msg-idle  { background: #1e293b; color: #94a3b8; }
.kiosk-msg-ok    { background: rgba(34,197,94,.15); color: #22c55e; }
.kiosk-msg-warn  { background: rgba(245,158,11,.15); color: #f59e0b; }
.kiosk-msg-error { background: rgba(225,29,72,.15);  color: #ef4444; }

/* ── No-enroll notice ────────────────────────────────────── */
.kiosk-no-enroll {
  background: rgba(245,158,11,.08);
  border: 1px solid rgba(245,158,11,.2);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: .8125rem;
  color: #f59e0b;
  width: 100%;
  text-align: center;
}

/* ── Recent log ──────────────────────────────────────────── */
.kiosk-recent { width: 100%; display: flex; flex-direction: column; gap: 4px; }
.kiosk-recent-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1e293b;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: .8125rem;
}
.kiosk-recent-name   { flex: 1; font-weight: 600; color: #f1f5f9; }
.kiosk-recent-action {
  font-weight: 700;
  font-size: .75rem;
  padding: 2px 8px;
  border-radius: 99px;
}
.kiosk-recent-action.ci  { background: rgba(34,197,94,.15);  color: #22c55e; }
.kiosk-recent-action.co  { background: rgba(99,102,241,.15); color: #6366f1; }
.kiosk-recent-action.ret { background: rgba(245,158,11,.15); color: #f59e0b; }
.kiosk-recent-time   { color: #64748b; font-size: .75rem; font-family: monospace; }

/* ── Result screen ───────────────────────────────────────── */
.kiosk-result-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52px;
}
.kiosk-result-icon.ci  { background: rgba(34,197,94,.15);  border: 3px solid #22c55e; }
.kiosk-result-icon.co  { background: rgba(99,102,241,.15); border: 3px solid #6366f1; }
.kiosk-result-icon.ret { background: rgba(245,158,11,.15); border: 3px solid #f59e0b; }

.kiosk-result-action {
  padding: 6px 20px;
  border-radius: 99px;
  font-size: 1rem;
  font-weight: 700;
  margin-top: 8px;
}
.kiosk-result-action.ci  { background: rgba(34,197,94,.15);  color: #22c55e; }
.kiosk-result-action.co  { background: rgba(99,102,241,.15); color: #6366f1; }
.kiosk-result-action.ret { background: rgba(245,158,11,.15); color: #f59e0b; }
</style>
