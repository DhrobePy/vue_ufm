<template>
  <div class="space-y-6 max-w-2xl mx-auto">
    <UiPageHeader title="Add Driver" :breadcrumb="['Fleet','Drivers','Add']" />

    <form class="space-y-5" @submit.prevent="submit">
      <!-- Personal Info -->
      <div class="glass-card p-5 space-y-4">
        <h3 class="section-title">Personal Information</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="form-label">Full Name *</label>
            <input v-model="form.full_name" class="form-input" required placeholder="e.g. Kamal Hossain" />
          </div>
          <div>
            <label class="form-label">Mobile</label>
            <input v-model="form.mobile" class="form-input" placeholder="01711-XXXXXX" />
          </div>
          <div>
            <label class="form-label">NID No</label>
            <input v-model="form.nid" class="form-input" placeholder="National ID number" />
          </div>
          <div>
            <label class="form-label">Joining Date</label>
            <input v-model="form.joining_date" type="date" class="form-input" />
          </div>
          <div>
            <label class="form-label">Status</label>
            <select v-model="form.status" class="form-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="form-label">Address</label>
            <textarea v-model="form.address" class="form-input" rows="2" placeholder="Home address" />
          </div>
          <div>
            <label class="form-label">Photo URL</label>
            <input v-model="form.photo_url" class="form-input" placeholder="https://…" />
          </div>
          <div>
            <label class="form-label">Assigned Vehicle</label>
            <select v-model="form.assigned_vehicle_id" class="form-input">
              <option value="">— None —</option>
              <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.registration_no }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div class="glass-card p-5 space-y-4">
        <h3 class="section-title">Emergency Contact</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Contact Name</label>
            <input v-model="form.emergency_contact_name" class="form-input" placeholder="Father/Spouse/Friend" />
          </div>
          <div>
            <label class="form-label">Contact Mobile</label>
            <input v-model="form.emergency_contact_mobile" class="form-input" placeholder="01711-XXXXXX" />
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div class="glass-card p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="section-title">Documents</h3>
          <button type="button" @click="addDoc" class="btn-secondary text-xs">+ Add Document</button>
        </div>
        <div v-for="(doc, i) in form.documents" :key="i" class="grid grid-cols-5 gap-3 p-3 rounded-xl bg-white/[0.03]">
          <div>
            <label class="form-label">Type</label>
            <select v-model="doc.document_type" class="form-input">
              <option v-for="t in docTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="form-label">Document No</label>
            <input v-model="doc.document_no" class="form-input" />
          </div>
          <div>
            <label class="form-label">Issue Date</label>
            <input v-model="doc.issue_date" type="date" class="form-input" />
          </div>
          <div>
            <label class="form-label">Expiry Date</label>
            <input v-model="doc.expiry_date" type="date" class="form-input" />
          </div>
          <div class="flex items-end">
            <button type="button" @click="form.documents.splice(i, 1)" class="btn-secondary text-xs text-red-400 border-red-500/20 w-full">Remove</button>
          </div>
        </div>
        <div v-if="!form.documents.length" class="text-center py-3 text-gray-600 text-xs">No documents added yet</div>
      </div>

      <!-- Employment History -->
      <div class="glass-card p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="section-title">Employment History</h3>
          <button type="button" @click="addEmp" class="btn-secondary text-xs">+ Add</button>
        </div>
        <div v-for="(emp, i) in form.employment_history" :key="i" class="grid grid-cols-4 gap-3 p-3 rounded-xl bg-white/[0.03]">
          <div>
            <label class="form-label">Company</label>
            <input v-model="emp.company_name" class="form-input" />
          </div>
          <div>
            <label class="form-label">Designation</label>
            <input v-model="emp.designation" class="form-input" />
          </div>
          <div>
            <label class="form-label">Start Date</label>
            <input v-model="emp.start_date" type="date" class="form-input" />
          </div>
          <div>
            <label class="form-label">End Date</label>
            <input v-model="emp.end_date" type="date" class="form-input" />
          </div>
          <div class="col-span-3">
            <label class="form-label">Remarks</label>
            <input v-model="emp.remarks" class="form-input" />
          </div>
          <div class="flex items-end">
            <button type="button" @click="form.employment_history.splice(i, 1)" class="btn-secondary text-xs text-red-400 border-red-500/20 w-full">Remove</button>
          </div>
        </div>
      </div>

      <div>
        <label class="form-label">Remarks</label>
        <textarea v-model="form.remarks" class="form-input" rows="2" placeholder="Any additional notes…" />
      </div>

      <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{{ error }}</div>

      <div class="flex gap-3">
        <button type="submit" class="btn-gold" :disabled="loading">{{ loading ? 'Saving…' : 'Save Driver' }}</button>
        <NuxtLink to="/fleet/drivers" class="btn-secondary">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router  = useRouter()
const loading = ref(false)
const error   = ref('')

const { data: vData } = await useFetch('/api/fleet/vehicles')
const vehicles = computed(() => (vData.value as any)?.vehicles ?? [])

const docTypes = ['Driving License', 'NID', 'Passport', 'Birth Certificate', 'Medical Certificate', 'Other']

const form = reactive({
  full_name: '', mobile: '', nid: '', address: '',
  joining_date: '', photo_url: '',
  emergency_contact_name: '', emergency_contact_mobile: '',
  status: 'active', assigned_vehicle_id: '', remarks: '',
  documents: [] as any[],
  employment_history: [] as any[],
})

function addDoc() {
  form.documents.push({ document_type: 'Driving License', document_no: '', issue_date: '', expiry_date: '', issuing_authority: '' })
}
function addEmp() {
  form.employment_history.push({ company_name: '', designation: '', start_date: '', end_date: '', remarks: '' })
}

async function submit() {
  loading.value = true
  error.value   = ''
  try {
    const res = await $fetch('/api/fleet/drivers', { method: 'POST', body: form }) as any
    router.push(`/fleet/drivers/${res.id}`)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to save driver'
  } finally {
    loading.value = false
  }
}
</script>
