<template>
  <div class="p-6 space-y-5">

    <!-- Loading -->
    <div v-if="pending" class="glass-card p-20 text-center text-gray-400">Loading profile…</div>

    <!-- Error -->
    <div v-else-if="error" class="glass-card p-10 text-center text-red-400">
      Failed to load employee profile.
    </div>

    <template v-else-if="emp">

      <!-- ── Hero ─────────────────────────────────────────────────── -->
      <div class="glass-card p-6">
        <div class="flex items-center gap-3 mb-5">
          <NuxtLink to="/hr/employees" class="btn-secondary text-xs flex items-center gap-1">
            ← Back
          </NuxtLink>
        </div>

        <div class="flex flex-wrap items-start gap-5">
          <!-- Avatar (click to upload) -->
          <div class="shrink-0 relative group cursor-pointer" @click="triggerPhotoUpload" title="Click to change photo">
            <img v-if="photoPreview || emp.photo" :src="photoPreview || emp.photo"
                 class="w-20 h-20 rounded-full object-cover border-2 border-amber-500/50" />
            <div v-else
                 class="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-amber-400"
                 style="background: rgba(245,158,11,0.15)">
              {{ initials }}
            </div>
            <!-- Hover overlay -->
            <div class="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center
                        opacity-0 group-hover:opacity-100 transition-opacity">
              <span v-if="!photoUploading" class="text-white text-xs font-medium">📷</span>
              <span v-else class="text-white text-xs">…</span>
            </div>
            <input ref="photoInput" type="file" accept="image/*" class="hidden" @change="uploadPhoto" />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold text-white">{{ emp.first_name }} {{ emp.last_name }}</h2>
            <div class="flex flex-wrap gap-4 mt-1.5 text-sm text-gray-400">
              <span>💼 {{ emp.position_name || '—' }}</span>
              <span>🏢 {{ emp.department_name || '—' }}</span>
              <span>📍 {{ emp.branch_name || '—' }}</span>
              <span>📅 Joined {{ fmtDate(emp.hire_date) }}</span>
            </div>
            <div class="mt-2">
              <span :class="statusBadge(emp.status)" class="text-xs capitalize">{{ emp.status }}</span>
            </div>
          </div>

          <!-- Stats -->
          <div class="flex gap-3 flex-wrap">
            <div class="text-center px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div class="text-xl font-bold text-amber-400">{{ attSummary.present ?? 0 }}</div>
              <div class="text-xs text-gray-500 mt-0.5">Present</div>
            </div>
            <div class="text-center px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div class="text-xl font-bold text-red-400">{{ attSummary.absent ?? 0 }}</div>
              <div class="text-xs text-gray-500 mt-0.5">Absent</div>
            </div>
            <div class="text-center px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div class="text-xl font-bold text-blue-400">{{ leaves.length }}</div>
              <div class="text-xs text-gray-500 mt-0.5">Leaves</div>
            </div>
            <div class="text-center px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div class="text-xl font-bold text-purple-400">{{ loans.length }}</div>
              <div class="text-xs text-gray-500 mt-0.5">Loans</div>
            </div>
          </div>

          <!-- Edit button -->
          <button @click="openEditEmp" class="btn-primary text-sm shrink-0">✏️ Edit Profile</button>
        </div>
      </div>

      <!-- ── Tabs ──────────────────────────────────────────────────── -->
      <div class="glass-card p-2 flex gap-1 overflow-x-auto">
        <button v-for="t in tabs" :key="t.key"
          :class="tab === t.key
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'"
          class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
          @click="tab = t.key">
          {{ t.icon }} {{ t.label }}
        </button>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           TAB: Overview
      ════════════════════════════════════════════════════════════════ -->
      <div v-if="tab === 'overview'" class="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <!-- Personal Info -->
        <div class="glass-card p-5">
          <h3 class="font-semibold text-white mb-4 pb-3 border-b border-white/[0.06]">👤 Personal Information</h3>
          <dl class="info-grid">
            <dt>Full Name</dt><dd>{{ emp.first_name }} {{ emp.last_name }}</dd>
            <dt>Email</dt><dd>{{ emp.email || '—' }}</dd>
            <dt>Phone</dt><dd>{{ emp.phone || '—' }}</dd>
            <dt>Address</dt><dd>{{ emp.address || '—' }}</dd>
            <dt>NID</dt><dd>{{ emp.nid || '—' }}</dd>
            <dt>Date of Birth</dt><dd>{{ fmtDate(emp.dob) }}</dd>
            <dt>Gender</dt><dd class="capitalize">{{ emp.gender || '—' }}</dd>
            <dt>Blood Group</dt><dd>{{ emp.blood_group || '—' }}</dd>
            <dt>Emergency Contact</dt><dd>{{ emp.emergency_contact || '—' }}</dd>
          </dl>
        </div>

        <!-- Employment Details -->
        <div class="glass-card p-5">
          <h3 class="font-semibold text-white mb-4 pb-3 border-b border-white/[0.06]">🏷️ Employment Details</h3>
          <dl class="info-grid">
            <dt>Employee ID</dt><dd>#{{ emp.id }}</dd>
            <dt>Position</dt><dd>{{ emp.position_name || '—' }}</dd>
            <dt>Department</dt><dd>{{ emp.department_name || '—' }}</dd>
            <dt>Branch</dt><dd>{{ emp.branch_name || '—' }}</dd>
            <dt>Hire Date</dt><dd>{{ fmtDate(emp.hire_date) }}</dd>
            <dt>Base Salary</dt><dd>৳ {{ fmt(emp.base_salary) }}</dd>
            <dt>Status</dt><dd><span :class="statusBadge(emp.status)" class="text-xs capitalize">{{ emp.status }}</span></dd>
          </dl>
        </div>

        <!-- Bank Details -->
        <div class="glass-card p-5">
          <h3 class="font-semibold text-white mb-4 pb-3 border-b border-white/[0.06]">🏦 Bank Details</h3>
          <dl class="info-grid">
            <dt>Bank Name</dt><dd>{{ emp.bank_name || '—' }}</dd>
            <dt>Account No.</dt><dd>{{ emp.bank_account || '—' }}</dd>
            <dt>Bank Branch</dt><dd>{{ emp.bank_branch || '—' }}</dd>
          </dl>
        </div>

        <!-- Salary Structure -->
        <div class="glass-card p-5">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
            <h3 class="font-semibold text-white">💰 Salary Structure</h3>
            <button @click="openSalaryModal" class="btn-xs">{{ salaryStructure ? 'Edit' : 'Set Up' }}</button>
          </div>
          <div v-if="salaryStructure" class="space-y-1.5">
            <div class="sal-row earn"><span>Basic Salary</span><span>৳ {{ fmt(salaryStructure.basic_salary) }}</span></div>
            <div class="sal-row earn"><span>House Allowance</span><span>৳ {{ fmt(salaryStructure.house_allowance) }}</span></div>
            <div class="sal-row earn"><span>Transport Allowance</span><span>৳ {{ fmt(salaryStructure.transport_allowance) }}</span></div>
            <div class="sal-row earn"><span>Medical Allowance</span><span>৳ {{ fmt(salaryStructure.medical_allowance) }}</span></div>
            <div class="sal-row earn"><span>Other Allowances</span><span>৳ {{ fmt(salaryStructure.other_allowances) }}</span></div>
            <div class="sal-row total mt-1"><span>Gross Salary</span><span>৳ {{ fmt(salaryStructure.gross_salary) }}</span></div>
            <div class="sal-row ded"><span>Provident Fund</span><span>-৳ {{ fmt(salaryStructure.provident_fund) }}</span></div>
            <div class="sal-row ded"><span>Tax Deduction</span><span>-৳ {{ fmt(salaryStructure.tax_deduction) }}</span></div>
            <div class="sal-row ded"><span>Other Deductions</span><span>-৳ {{ fmt(salaryStructure.other_deductions) }}</span></div>
            <div class="sal-row net mt-1"><span>Net Salary</span><span>৳ {{ fmt(salaryStructure.net_salary) }}</span></div>
          </div>
          <p v-else class="text-gray-500 text-sm py-4 text-center">No salary structure set up yet.</p>
        </div>

        <!-- Leave Summary -->
        <div class="glass-card p-5 lg:col-span-2">
          <h3 class="font-semibold text-white mb-4 pb-3 border-b border-white/[0.06]">📋 Leave Summary</h3>
          <div v-if="leaveSummary.length" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="border-b border-white/[0.06]">
                <th class="th text-left">Leave Type</th>
                <th class="th text-left">Status</th>
                <th class="th text-right">Count</th>
                <th class="th text-right">Days</th>
              </tr></thead>
              <tbody>
                <tr v-for="r in leaveSummary" :key="r.leave_type+r.status" class="tr">
                  <td class="td capitalize">{{ ucfirst(r.leave_type) }}</td>
                  <td class="td"><span :class="leaveStatusBadge(r.status)" class="text-xs capitalize">{{ r.status }}</span></td>
                  <td class="td text-right text-gray-300">{{ r.cnt }}</td>
                  <td class="td text-right text-gray-300">{{ r.days }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-gray-500 text-sm py-4 text-center">No leave records.</p>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           TAB: Attendance Calendar
      ════════════════════════════════════════════════════════════════ -->
      <div v-if="tab === 'attendance'" class="space-y-4">

        <!-- Month nav + summary -->
        <div class="glass-card p-5">
          <div class="flex items-center gap-3 mb-4">
            <button @click="calPrev" class="btn-xs">‹</button>
            <span class="text-white font-semibold text-lg flex-1 text-center">{{ calMonthLabel }}</span>
            <button @click="calNext" class="btn-xs">›</button>
            <button @click="calGoToday" class="btn-xs text-xs">Today</button>
          </div>

          <!-- Summary chips -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="cal-chip cal-chip-green">✅ Present <b>{{ calMonthlySummary.present }}</b></span>
            <span class="cal-chip cal-chip-red">❌ Absent <b>{{ calMonthlySummary.absent }}</b></span>
            <span class="cal-chip cal-chip-amber">⏰ Late <b>{{ calMonthlySummary.late }}</b></span>
            <span class="cal-chip cal-chip-indigo">📋 On Leave <b>{{ calMonthlySummary.on_leave }}</b></span>
            <span class="cal-chip cal-chip-teal">🎉 Holiday <b>{{ calMonthlySummary.holiday }}</b></span>
            <span class="cal-chip cal-chip-gray">🗓️ Day Off <b>{{ calMonthlySummary.dayoff }}</b></span>
          </div>

          <!-- Legend -->
          <div class="flex flex-wrap gap-3 text-xs">
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-green-500/30 border border-green-500/50 inline-block"></span> Present</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-red-500/30 border border-red-500/50 inline-block"></span> Absent</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-amber-500/30 border border-amber-500/50 inline-block"></span> Late</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-indigo-500/30 border border-indigo-500/50 inline-block"></span> On Leave</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-teal-500/30 border border-teal-500/50 inline-block"></span> Holiday</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-white/[0.06] border border-white/[0.08] inline-block"></span> Day Off</span>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="glass-card p-5">
          <div class="cal-grid">
            <div v-for="d in dayHeaders" :key="d" class="cal-dow">{{ d }}</div>

            <div v-for="n in calLeadingBlanks" :key="'b'+n" class="cal-cell"></div>

            <div v-for="day in calDays" :key="day.date"
              class="cal-cell cursor-pointer"
              :class="[
                day.isToday    ? 'ring-2 ring-amber-400'   : '',
                day.isHoliday  ? 'cal-holiday'              : '',
                day.isDayOff && !day.isHoliday ? 'cal-dayoff' : '',
                day.isFuture   ? 'opacity-30 cursor-default': '',
                day.att?.status === 'present'  ? 'cal-present'  : '',
                day.att?.status === 'absent'   ? 'cal-absent'   : '',
                day.att?.status === 'late'     ? 'cal-late'     : '',
                day.att?.status === 'on_leave' ? 'cal-on-leave' : '',
              ]"
              @click="calCellClick(day)"
              :title="calCellTitle(day)"
            >
              <div class="cal-day-num">{{ day.d }}</div>
              <div v-if="day.isHoliday" class="cal-holiday-name">{{ day.holidayName }}</div>
              <template v-if="day.att">
                <div class="cal-time" v-if="day.att.clock_in">
                  {{ fmtTime(day.att.clock_in) }}
                </div>
              </template>
              <div v-else-if="day.isDayOff && !day.isHoliday" class="cal-label-small">Off</div>
            </div>
          </div>
        </div>

        <!-- Attendance Edit Popover -->
        <Teleport to="body">
          <div v-if="calEditDay" class="modal-overlay" @click.self="calEditDay = null">
            <div class="modal-box max-w-sm">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <div class="font-semibold text-white">{{ fmtDate(calEditDay.date) }}</div>
                  <div v-if="calEditDay.isHoliday" class="text-xs text-teal-400 mt-0.5">
                    🎉 {{ calEditDay.holidayName }}
                  </div>
                </div>
                <button @click="calEditDay = null" class="text-gray-400 hover:text-white text-xl leading-none">×</button>
              </div>

              <!-- Status pills -->
              <div class="flex flex-wrap gap-2 mb-4">
                <button v-for="s in attStatuses" :key="s.val"
                  :class="[s.cls, attEditForm.status === s.val ? 'ring-2 ring-white' : 'opacity-70']"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  @click="attEditForm.status = s.val">{{ s.label }}</button>
                <button class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-900/30 text-red-400 border border-red-500/30"
                  @click="calDeleteRecord">🗑 Clear</button>
              </div>

              <!-- Time inputs -->
              <div v-if="attEditForm.status !== 'absent'" class="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label class="label">Clock In</label>
                  <input v-model="attEditForm.clock_in" type="time" class="input-field w-full text-sm" />
                </div>
                <div>
                  <label class="label">Clock Out</label>
                  <input v-model="attEditForm.clock_out" type="time" class="input-field w-full text-sm" />
                </div>
              </div>

              <!-- Hours preview -->
              <div v-if="attEditForm.clock_in && attEditForm.clock_out && attEditForm.status !== 'absent'"
                   class="text-xs text-gray-400 mb-4">
                ⏱ {{ calcHours(attEditForm.clock_in, attEditForm.clock_out) }} worked
              </div>

              <div class="flex justify-end gap-3">
                <button @click="calEditDay = null" class="btn-secondary text-sm">Cancel</button>
                <button @click="calSaveRecord" :disabled="saving" class="btn-primary text-sm">
                  {{ saving ? 'Saving…' : 'Save' }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           TAB: Payroll
      ════════════════════════════════════════════════════════════════ -->
      <div v-if="tab === 'payroll'" class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-white">💰 Payroll History</h3>
          <button @click="openPayrollModal" class="btn-primary text-sm">+ Add Record</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-white/[0.06]">
              <th class="th">Period</th>
              <th class="th text-right">Gross</th>
              <th class="th text-right">Deductions</th>
              <th class="th text-right">Net Pay</th>
              <th class="th text-center">Status</th>
            </tr></thead>
            <tbody>
              <tr v-for="p in payrolls" :key="p.id" class="tr">
                <td class="td text-gray-300">{{ p.pay_period_start?.slice(0,7) ?? '—' }}</td>
                <td class="td text-right text-gray-400">৳ {{ fmt(p.gross_salary) }}</td>
                <td class="td text-right text-gray-400">৳ {{ fmt(p.deductions) }}</td>
                <td class="td text-right font-semibold text-amber-400">৳ {{ fmt(p.net_salary) }}</td>
                <td class="td text-center">
                  <span :class="payStatusBadge(p.status)" class="text-xs capitalize">{{ p.status?.replace('_',' ') }}</span>
                </td>
              </tr>
              <tr v-if="!payrolls.length">
                <td colspan="5" class="td text-center text-gray-500 py-10">No payroll records.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           TAB: Loans
      ════════════════════════════════════════════════════════════════ -->
      <div v-if="tab === 'loans'" class="space-y-5">

        <!-- Loan cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div v-for="loan in loans" :key="loan.id" class="glass-card p-5">
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="text-2xl font-bold text-amber-400">৳ {{ fmt(loan.amount) }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ loan.installments }} installments · {{ loan.installment_type }}</div>
              </div>
              <span :class="loan.status === 'active' ? 'badge-yellow' : 'badge-green'" class="text-xs capitalize">{{ loan.status }}</span>
            </div>
            <!-- Progress -->
            <div class="mb-3">
              <div class="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div class="h-full bg-amber-400 rounded-full transition-all"
                     :style="`width:${loanPct(loan)}%`"></div>
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>Paid: ৳ {{ fmt(loan.paid_amount) }}</span>
                <span>Remaining: ৳ {{ fmt(loan.remaining_amount) }}</span>
              </div>
            </div>
            <div class="text-xs text-gray-500 mb-3">Issued: {{ fmtDate(loan.loan_date) }}</div>
            <button v-if="loan.status === 'active'"
              @click="updateLoan(loan.id, 'settled')"
              class="btn-secondary text-xs w-full">Mark Settled</button>
          </div>
          <div v-if="!loans.length" class="glass-card p-10 text-center text-gray-500">
            No loans on record.
          </div>
        </div>

        <!-- Issue New Loan -->
        <div class="glass-card p-5">
          <h3 class="font-semibold text-white mb-4">🆕 Issue New Loan</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="label">Amount (৳)</label>
              <input v-model.number="newLoan.amount" type="number" min="0" class="input-field w-full" placeholder="50000" />
            </div>
            <div>
              <label class="label">Installments</label>
              <input v-model.number="newLoan.installments" type="number" min="1" class="input-field w-full" placeholder="12" />
            </div>
            <div>
              <label class="label">Type</label>
              <select v-model="newLoan.installment_type" class="input-field w-full">
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="bi_weekly">Bi-Weekly</option>
              </select>
            </div>
            <div>
              <label class="label">Loan Date</label>
              <input v-model="newLoan.loan_date" type="date" class="input-field w-full" />
            </div>
          </div>
          <div class="mt-4">
            <button @click="addLoan" :disabled="saving" class="btn-primary text-sm">
              {{ saving ? 'Saving…' : 'Issue Loan' }}
            </button>
          </div>
        </div>

        <!-- Repayment history -->
        <div v-if="loanInstallments.length" class="glass-card p-5">
          <h3 class="font-semibold text-white mb-4">📃 Repayment History</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="border-b border-white/[0.06]">
                <th class="th">Payment Date</th>
                <th class="th text-right">Amount</th>
                <th class="th text-center">Status</th>
                <th class="th">Payroll Period</th>
              </tr></thead>
              <tbody>
                <tr v-for="i in loanInstallments" :key="i.id" class="tr">
                  <td class="td text-gray-300">{{ fmtDate(i.payment_date) }}</td>
                  <td class="td text-right text-amber-400 font-semibold">৳ {{ fmt(i.amount) }}</td>
                  <td class="td text-center">
                    <span :class="i.payroll_id ? 'badge-green' : 'badge-yellow'" class="text-xs">
                      {{ i.payroll_id ? 'Deducted' : 'Pending' }}
                    </span>
                  </td>
                  <td class="td text-gray-400">{{ i.pay_period_start?.slice(0,7) ?? '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           TAB: Leaves
      ════════════════════════════════════════════════════════════════ -->
      <div v-if="tab === 'leaves'" class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-white">📋 Leave History</h3>
          <button @click="openLeaveModal" class="btn-primary text-sm">+ Add Leave</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-white/[0.06]">
              <th class="th">Type</th>
              <th class="th">From</th>
              <th class="th">To</th>
              <th class="th text-right">Days</th>
              <th class="th">Reason</th>
              <th class="th text-center">Status</th>
              <th class="th text-right">Actions</th>
            </tr></thead>
            <tbody>
              <tr v-for="l in leaves" :key="l.id" class="tr">
                <td class="td capitalize text-gray-200">{{ ucfirst(l.leave_type) }}</td>
                <td class="td text-gray-400">{{ fmtDate(l.start_date) }}</td>
                <td class="td text-gray-400">{{ fmtDate(l.end_date) }}</td>
                <td class="td text-right text-gray-300">{{ daysDiff(l.start_date, l.end_date) }}</td>
                <td class="td text-gray-500 max-w-[180px] truncate">{{ l.reason || '—' }}</td>
                <td class="td text-center">
                  <select :value="l.status"
                    @change="updateLeave(l.id, ($event.target as HTMLSelectElement).value)"
                    class="input-field text-xs py-0.5 px-2">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td class="td text-right">
                  <button @click="deleteLeave(l.id)" class="btn-xs text-red-400 hover:text-red-300">🗑</button>
                </td>
              </tr>
              <tr v-if="!leaves.length">
                <td colspan="7" class="td text-center text-gray-500 py-10">No leave records.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           TAB: Documents
      ════════════════════════════════════════════════════════════════ -->
      <div v-if="tab === 'documents'" class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-white">📁 Documents & Certificates</h3>
          <button @click="openDocModal" class="btn-primary text-sm">+ Add Document</button>
        </div>
        <div v-if="documents.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div v-for="doc in documents" :key="doc.id"
               class="flex gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <div class="text-3xl shrink-0">{{ docEmoji(doc.file_type) }}</div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-200 text-sm truncate">{{ doc.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ ucfirst(doc.category) }} · {{ doc.file_type || '—' }}</p>
              <p v-if="doc.expiry_date" :class="isExpired(doc.expiry_date) ? 'text-red-400' : 'text-gray-500'"
                 class="text-xs mt-0.5">Expires: {{ fmtDate(doc.expiry_date) }}</p>
              <p v-if="doc.notes" class="text-xs text-gray-600 mt-0.5 italic">{{ doc.notes }}</p>
            </div>
            <div class="flex flex-col gap-1">
              <a v-if="doc.file_path" :href="doc.file_path" target="_blank"
                 class="text-amber-400 hover:text-amber-300 text-xs">↗</a>
              <button @click="deleteDoc(doc.id)" class="text-red-400 hover:text-red-300 text-xs">🗑</button>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 text-sm text-center py-10">No documents uploaded.</p>
      </div>

      <!-- ════════════════════════════════════════════════════════════
           TAB: Assets
      ════════════════════════════════════════════════════════════════ -->
      <div v-if="tab === 'assets'" class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-white">🖥️ Assigned Assets</h3>
          <button @click="openAssetModal" class="btn-primary text-sm">+ Assign Asset</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-white/[0.06]">
              <th class="th">Asset</th>
              <th class="th">Code</th>
              <th class="th">Category</th>
              <th class="th">Assigned On</th>
              <th class="th">Due Date</th>
              <th class="th">Cond. In</th>
              <th class="th">Cond. Out</th>
              <th class="th text-center">Status</th>
              <th class="th text-right">Actions</th>
            </tr></thead>
            <tbody>
              <tr v-for="a in assets" :key="a.id" class="tr">
                <td class="td text-gray-200">{{ a.asset_name }}</td>
                <td class="td text-gray-400 font-mono text-xs">{{ a.asset_code }}</td>
                <td class="td text-gray-400 capitalize">{{ a.category }}</td>
                <td class="td text-gray-400">{{ fmtDate(a.assigned_on) }}</td>
                <td class="td text-gray-400">{{ fmtDate(a.due_date) }}</td>
                <td class="td text-gray-400 capitalize">{{ a.condition_in }}</td>
                <td class="td text-gray-400 capitalize">{{ a.condition_out || '—' }}</td>
                <td class="td text-center">
                  <span :class="a.returned_on ? 'badge-green' : 'badge-yellow'" class="text-xs">
                    {{ a.returned_on ? 'Returned' : 'Active' }}
                  </span>
                </td>
                <td class="td text-right">
                  <button v-if="!a.returned_on" @click="returnAsset(a)"
                    class="btn-xs">Return</button>
                </td>
              </tr>
              <tr v-if="!assets.length">
                <td colspan="9" class="td text-center text-gray-500 py-10">No assets assigned.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>

    <!-- ════════════════════════════════════════════════════════════
         MODALS
    ════════════════════════════════════════════════════════════════ -->

    <!-- Edit Employee -->
    <Teleport to="body">
      <div v-if="showEditEmp" class="modal-overlay" @click.self="showEditEmp = false">
        <div class="modal-box w-full max-w-2xl">
          <h2 class="text-lg font-bold text-white mb-5">✏️ Edit Employee Profile</h2>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="label">First Name</label><input v-model="ef.first_name" class="input-field w-full" /></div>
            <div><label class="label">Last Name</label><input v-model="ef.last_name" class="input-field w-full" /></div>
            <div><label class="label">Email</label><input v-model="ef.email" type="email" class="input-field w-full" /></div>
            <div><label class="label">Phone</label><input v-model="ef.phone" class="input-field w-full" /></div>
            <div class="col-span-2"><label class="label">Address</label><textarea v-model="ef.address" rows="2" class="input-field w-full resize-none" /></div>
            <div><label class="label">NID</label><input v-model="ef.nid" class="input-field w-full" /></div>
            <div><label class="label">Date of Birth</label><input v-model="ef.dob" type="date" class="input-field w-full" /></div>
            <div>
              <label class="label">Gender</label>
              <select v-model="ef.gender" class="input-field w-full">
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div><label class="label">Blood Group</label><input v-model="ef.blood_group" class="input-field w-full" placeholder="A+, B-, O+…" /></div>
            <div class="col-span-2"><label class="label">Emergency Contact</label><input v-model="ef.emergency_contact" class="input-field w-full" /></div>
            <div class="col-span-2 border-t border-white/[0.06] pt-3 mt-1">
              <p class="text-xs text-gray-500 mb-3 font-medium">Bank Details</p>
            </div>
            <div><label class="label">Bank Name</label><input v-model="ef.bank_name" class="input-field w-full" /></div>
            <div><label class="label">Account Number</label><input v-model="ef.bank_account" class="input-field w-full" /></div>
            <div><label class="label">Bank Branch</label><input v-model="ef.bank_branch" class="input-field w-full" /></div>
            <div class="col-span-2 border-t border-white/[0.06] pt-3 mt-1">
              <p class="text-xs text-gray-500 mb-3 font-medium">Employment</p>
            </div>
            <div>
              <label class="label">Position</label>
              <select v-model="ef.position_id" class="input-field w-full">
                <option v-for="p in positions" :key="p.id" :value="p.id">
                  {{ p.department_name }} → {{ p.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Branch</label>
              <select v-model="ef.branch_id" class="input-field w-full">
                <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>
            <div><label class="label">Hire Date</label><input v-model="ef.hire_date" type="date" class="input-field w-full" /></div>
            <div><label class="label">Base Salary (৳)</label><input v-model.number="ef.base_salary" type="number" class="input-field w-full" /></div>
            <div>
              <label class="label">Status</label>
              <select v-model="ef.status" class="input-field w-full">
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="showEditEmp = false" class="btn-secondary">Cancel</button>
            <button @click="saveEmployee" :disabled="saving" class="btn-primary">
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Salary Structure Modal -->
    <Teleport to="body">
      <div v-if="showSalary" class="modal-overlay" @click.self="showSalary = false">
        <div class="modal-box w-full max-w-xl">
          <h2 class="text-lg font-bold text-white mb-4">💰 Salary Structure</h2>
          <p class="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Earnings</p>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div><label class="label">Basic Salary</label><input v-model.number="sf.basic_salary" type="number" class="input-field w-full" /></div>
            <div><label class="label">House Allowance</label><input v-model.number="sf.house_allowance" type="number" class="input-field w-full" /></div>
            <div><label class="label">Transport Allowance</label><input v-model.number="sf.transport_allowance" type="number" class="input-field w-full" /></div>
            <div><label class="label">Medical Allowance</label><input v-model.number="sf.medical_allowance" type="number" class="input-field w-full" /></div>
            <div><label class="label">Other Allowances</label><input v-model.number="sf.other_allowances" type="number" class="input-field w-full" /></div>
          </div>
          <p class="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Deductions</p>
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div><label class="label">Provident Fund</label><input v-model.number="sf.provident_fund" type="number" class="input-field w-full" /></div>
            <div><label class="label">Tax Deduction</label><input v-model.number="sf.tax_deduction" type="number" class="input-field w-full" /></div>
            <div><label class="label">Other Deductions</label><input v-model.number="sf.other_deductions" type="number" class="input-field w-full" /></div>
          </div>
          <div class="flex gap-6 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] mb-5 text-sm">
            <div>Gross: <span class="text-amber-400 font-bold">৳ {{ fmt(sfGross) }}</span></div>
            <div>Net: <span class="text-green-400 font-bold">৳ {{ fmt(sfNet) }}</span></div>
          </div>
          <div class="flex justify-end gap-3">
            <button @click="showSalary = false" class="btn-secondary">Cancel</button>
            <button @click="saveSalaryStructure" :disabled="saving" class="btn-primary">
              {{ saving ? 'Saving…' : 'Save Structure' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Payroll Modal -->
    <Teleport to="body">
      <div v-if="showPayroll" class="modal-overlay" @click.self="showPayroll = false">
        <div class="modal-box">
          <h2 class="text-lg font-bold text-white mb-4">💰 Add Payroll Record</h2>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div><label class="label">Period Start</label><input v-model="payForm.pay_period_start" type="date" class="input-field w-full" /></div>
            <div><label class="label">Period End</label><input v-model="payForm.pay_period_end" type="date" class="input-field w-full" /></div>
            <div><label class="label">Gross Salary</label><input v-model.number="payForm.gross_salary" type="number" class="input-field w-full" /></div>
            <div><label class="label">Deductions</label><input v-model.number="payForm.deductions" type="number" class="input-field w-full" /></div>
            <div>
              <label class="label">Net Salary</label>
              <input :value="payForm.gross_salary - payForm.deductions" type="number" readonly class="input-field w-full opacity-60" />
            </div>
            <div>
              <label class="label">Status</label>
              <select v-model="payForm.status" class="input-field w-full">
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button @click="showPayroll = false" class="btn-secondary">Cancel</button>
            <button @click="savePayroll" :disabled="saving" class="btn-primary">{{ saving ? 'Saving…' : 'Save' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Leave Modal -->
    <Teleport to="body">
      <div v-if="showLeave" class="modal-overlay" @click.self="showLeave = false">
        <div class="modal-box">
          <h2 class="text-lg font-bold text-white mb-4">📋 Add Leave Record</h2>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="label">Leave Type</label>
              <select v-model="leaveForm.leave_type" class="input-field w-full">
                <option value="annual">Annual</option>
                <option value="sick">Sick</option>
                <option value="casual">Casual</option>
                <option value="unpaid">Unpaid</option>
                <option value="maternity">Maternity</option>
                <option value="paternity">Paternity</option>
              </select>
            </div>
            <div>
              <label class="label">Status</label>
              <select v-model="leaveForm.status" class="input-field w-full">
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div><label class="label">Start Date</label><input v-model="leaveForm.start_date" type="date" class="input-field w-full" /></div>
            <div><label class="label">End Date</label><input v-model="leaveForm.end_date" type="date" class="input-field w-full" /></div>
          </div>
          <div class="mb-4"><label class="label">Reason</label><textarea v-model="leaveForm.reason" rows="2" class="input-field w-full resize-none" /></div>
          <div class="flex justify-end gap-3">
            <button @click="showLeave = false" class="btn-secondary">Cancel</button>
            <button @click="saveLeave" :disabled="saving" class="btn-primary">{{ saving ? 'Saving…' : 'Save' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Document Modal -->
    <Teleport to="body">
      <div v-if="showDoc" class="modal-overlay" @click.self="showDoc = false">
        <div class="modal-box">
          <h2 class="text-lg font-bold text-white mb-4">📄 Add Document</h2>
          <div class="space-y-4">
            <div><label class="label">Document Name *</label><input v-model="docForm.name" class="input-field w-full" placeholder="NID, Degree Certificate, etc." /></div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Category</label>
                <select v-model="docForm.category" class="input-field w-full">
                  <option value="identity">Identity</option>
                  <option value="education">Education</option>
                  <option value="employment">Employment</option>
                  <option value="medical">Medical</option>
                  <option value="certificate">Certificate</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div><label class="label">File Type</label><input v-model="docForm.file_type" class="input-field w-full" placeholder="PDF, JPG…" /></div>
              <div><label class="label">Expiry Date</label><input v-model="docForm.expiry_date" type="date" class="input-field w-full" /></div>
              <div><label class="label">File Path / URL</label><input v-model="docForm.file_path" class="input-field w-full" placeholder="/uploads/…" /></div>
            </div>
            <div><label class="label">Notes</label><textarea v-model="docForm.notes" rows="2" class="input-field w-full resize-none" /></div>
          </div>
          <div class="flex justify-end gap-3 mt-5">
            <button @click="showDoc = false" class="btn-secondary">Cancel</button>
            <button @click="saveDoc" :disabled="saving" class="btn-primary">{{ saving ? 'Saving…' : 'Save' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Asset Modal -->
    <Teleport to="body">
      <div v-if="showAsset" class="modal-overlay" @click.self="showAsset = false">
        <div class="modal-box">
          <h2 class="text-lg font-bold text-white mb-4">🖥️ Assign Asset</h2>
          <div class="space-y-4">
            <div>
              <label class="label">Asset</label>
              <select v-model="assetForm.asset_id" class="input-field w-full">
                <option value="">Select asset…</option>
                <option v-for="a in availableAssets" :key="a.id" :value="a.id">
                  {{ a.name }} ({{ a.asset_code }})
                </option>
              </select>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div><label class="label">Assigned On</label><input v-model="assetForm.assigned_on" type="date" class="input-field w-full" /></div>
              <div><label class="label">Due Date</label><input v-model="assetForm.due_date" type="date" class="input-field w-full" /></div>
              <div>
                <label class="label">Condition</label>
                <select v-model="assetForm.condition_in" class="input-field w-full">
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>
            <div><label class="label">Notes</label><textarea v-model="assetForm.notes" rows="2" class="input-field w-full resize-none" /></div>
          </div>
          <div class="flex justify-end gap-3 mt-5">
            <button @click="showAsset = false" class="btn-secondary">Cancel</button>
            <button @click="saveAsset" :disabled="saving" class="btn-primary">{{ saving ? 'Saving…' : 'Assign' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toastMsg"
          :class="toastType === 'error' ? 'bg-red-900/90 border-red-500/50 text-red-200' : 'bg-green-900/90 border-green-500/50 text-green-200'"
          class="fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl border text-sm font-medium shadow-2xl">
          {{ toastMsg }}
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route  = useRoute()
const empId  = computed(() => parseInt(route.params.id as string))

const { data, pending, error, refresh } = await useFetch(() => `/api/hr/employees/${empId.value}`)
const d = computed(() => (data.value as any) ?? {})

const emp              = computed(() => d.value.employee       ?? null)
const salaryStructure  = computed(() => d.value.salary_structure ?? null)
const payrolls         = computed(() => d.value.payrolls       ?? [])
const attendance       = computed(() => d.value.attendance     ?? [])
const attSummary       = computed(() => d.value.att_summary    ?? {})
const loans            = computed(() => d.value.loans          ?? [])
const loanInstallments = computed(() => d.value.loan_installments ?? [])
const leaves           = computed(() => d.value.leaves         ?? [])
const leaveSummary     = computed(() => d.value.leave_summary  ?? [])
const documents        = computed(() => d.value.documents      ?? [])
const assets           = computed(() => d.value.assets         ?? [])
const positions        = computed(() => d.value.positions      ?? [])
const branches         = computed(() => d.value.branches       ?? [])
const holidays         = computed(() => d.value.holidays       ?? [])
const siteSettings     = computed(() => d.value.settings       ?? {})

// ── Tabs ──────────────────────────────────────────────────────────
const tab = ref('overview')
const tabs = [
  { key: 'overview',   label: 'Overview',   icon: '📊' },
  { key: 'attendance', label: 'Attendance', icon: '🕐' },
  { key: 'payroll',    label: 'Payroll',    icon: '💰' },
  { key: 'loans',      label: 'Loans',      icon: '🏦' },
  { key: 'leaves',     label: 'Leaves',     icon: '📋' },
  { key: 'documents',  label: 'Documents',  icon: '📁' },
  { key: 'assets',     label: 'Assets',     icon: '🖥️' },
]

// ── Helpers ───────────────────────────────────────────────────────
const initials = computed(() => {
  if (!emp.value) return '?'
  return ((emp.value.first_name?.[0] ?? '') + (emp.value.last_name?.[0] ?? '')).toUpperCase()
})
const fmt = (n: any) => Number(n || 0).toLocaleString('en-IN')
const fmtDate = (d: any) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return d }
}
const fmtTime = (t: string) => {
  if (!t) return ''
  return t.toString().slice(0, 5)
}
const calcHours = (inn: string, out: string) => {
  try {
    const [ih, im] = inn.split(':').map(Number)
    const [oh, om] = out.split(':').map(Number)
    const mins = (oh * 60 + om) - (ih * 60 + im)
    if (mins <= 0) return '0h'
    const h = Math.floor(mins / 60), m = mins % 60
    return `${h}h ${m > 0 ? m + 'm' : ''}`.trim()
  } catch { return '' }
}
const ucfirst = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : ''
const daysDiff = (s: string, e: string) => {
  if (!s || !e) return 0
  return Math.max(1, Math.round((new Date(e).getTime() - new Date(s).getTime()) / 864e5) + 1)
}
const loanPct = (loan: any) => {
  const total = parseFloat(loan.amount || 0)
  if (!total) return 0
  return Math.min(100, Math.round(parseFloat(loan.paid_amount || 0) / total * 100))
}
const isExpired = (d: string) => d && new Date(d) < new Date()
const docEmoji = (type: string) => {
  if (!type) return '📄'
  const t = type.toLowerCase()
  if (t.includes('pdf')) return '📕'
  if (t.includes('jpg') || t.includes('png') || t.includes('jpeg') || t.includes('img')) return '🖼️'
  if (t.includes('doc')) return '📝'
  return '📄'
}

function statusBadge(s: string) {
  const m: Record<string, string> = { active: 'badge-green', on_leave: 'badge-yellow', terminated: 'badge-red', inactive: 'badge-gray' }
  return m[s] || 'badge-gray'
}
function payStatusBadge(s: string) {
  const m: Record<string, string> = { paid: 'badge-green', approved: 'badge-blue', pending_approval: 'badge-yellow', rejected: 'badge-red' }
  return m[s] || 'badge-gray'
}
function leaveStatusBadge(s: string) {
  const m: Record<string, string> = { approved: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red' }
  return m[s] || 'badge-gray'
}

// ── Photo upload ──────────────────────────────────────────────────
const photoInput    = ref<HTMLInputElement | null>(null)
const photoPreview  = ref<string>('')
const photoUploading = ref(false)

function triggerPhotoUpload() {
  photoInput.value?.click()
}
async function uploadPhoto(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return showToast('error', 'Please select an image file')
  if (file.size > 5 * 1024 * 1024) return showToast('error', 'Image must be under 5 MB')

  // Show local preview immediately
  photoPreview.value = URL.createObjectURL(file)
  photoUploading.value = true
  try {
    const form = new FormData()
    form.append('photo', file)
    const res: any = await $fetch(`/api/hr/employees/${empId.value}/photo`, { method: 'POST', body: form })
    photoPreview.value = res.photo        // Switch to server URL
    await refresh()                       // Reload employee data
    showToast('success', 'Photo updated')
  } catch (err: any) {
    photoPreview.value = ''
    showToast('error', err?.data?.statusMessage || 'Upload failed')
  } finally {
    photoUploading.value = false
    if (photoInput.value) photoInput.value.value = ''
  }
}

// ── Toast ─────────────────────────────────────────────────────────
const toastMsg  = ref('')
const toastType = ref('success')
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(type: string, msg: string) {
  toastType.value = type
  toastMsg.value  = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 3500)
}

// ── API Action helper ─────────────────────────────────────────────
const saving = ref(false)
async function act(body: object) {
  saving.value = true
  try {
    await $fetch(`/api/hr/employees/${empId.value}`, { method: 'POST', body })
    await refresh()
    return true
  } catch (e: any) {
    showToast('error', e?.data?.message || 'Action failed')
    return false
  } finally {
    saving.value = false
  }
}

// ── Calendar ──────────────────────────────────────────────────────
const today     = new Date()
const calYear   = ref(today.getFullYear())
const calMonth  = ref(today.getMonth()) // 0-indexed
const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const calMonthLabel = computed(() =>
  new Date(calYear.value, calMonth.value, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

const attByDate = computed(() => {
  const m: Record<string, any> = {}
  attendance.value.forEach((r: any) => { m[r.date?.slice?.(0, 10) ?? r.date] = r })
  return m
})

const holidayByDate = computed(() => {
  const m: Record<string, any> = {}
  holidays.value.forEach((h: any) => { m[h.holiday_date?.slice?.(0, 10) ?? h.holiday_date] = h })
  return m
})

const dayOffNums = computed(() => {
  const raw = siteSettings.value.weekly_off || 'friday'
  const map: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }
  return raw.split(',').map((x: string) => map[x.trim().toLowerCase()]).filter((n: any) => n !== undefined)
})

const calLeadingBlanks = computed(() =>
  new Date(calYear.value, calMonth.value, 1).getDay()
)

const calDays = computed(() => {
  const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate()
  const todayStr    = today.toISOString().slice(0, 10)
  const days = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear.value}-${String(calMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dow     = new Date(calYear.value, calMonth.value, d).getDay()
    const holiday = holidayByDate.value[dateStr]
    days.push({
      d, date: dateStr, dow,
      isDayOff:    dayOffNums.value.includes(dow),
      isHoliday:   !!holiday,
      holidayName: holiday?.holiday_name ?? '',
      isToday:     dateStr === todayStr,
      isFuture:    dateStr > todayStr,
      att:         attByDate.value[dateStr] ?? null,
    })
  }
  return days
})

const calMonthlySummary = computed(() => {
  const s = { present: 0, absent: 0, late: 0, on_leave: 0, holiday: 0, dayoff: 0 }
  calDays.value.forEach((d: any) => {
    if (d.isHoliday)              s.holiday++
    else if (d.isDayOff)          s.dayoff++
    else if (d.att?.status === 'present')  s.present++
    else if (d.att?.status === 'absent')   s.absent++
    else if (d.att?.status === 'late')     s.late++
    else if (d.att?.status === 'on_leave') s.on_leave++
  })
  return s
})

function calPrev() { if (calMonth.value === 0) { calYear.value--; calMonth.value = 11 } else calMonth.value-- }
function calNext() { if (calMonth.value === 11) { calYear.value++; calMonth.value = 0 } else calMonth.value++ }
function calGoToday() { calYear.value = today.getFullYear(); calMonth.value = today.getMonth() }

const calEditDay  = ref<any>(null)
const attEditForm = reactive({ status: 'present', clock_in: '09:00', clock_out: '17:00' })
const attStatuses = [
  { val: 'present',  label: 'Present',  cls: 'bg-green-600/30 text-green-300 border border-green-500/40' },
  { val: 'absent',   label: 'Absent',   cls: 'bg-red-600/30 text-red-300 border border-red-500/40' },
  { val: 'late',     label: 'Late',     cls: 'bg-amber-600/30 text-amber-300 border border-amber-500/40' },
  { val: 'on_leave', label: 'On Leave', cls: 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' },
]

function calCellClick(day: any) {
  if (day.isFuture) return
  calEditDay.value = day
  const ws = siteSettings.value.work_start || '09:00'
  if (day.att) {
    attEditForm.status    = day.att.status
    attEditForm.clock_in  = day.att.clock_in  ? fmtTime(day.att.clock_in)  : ws
    attEditForm.clock_out = day.att.clock_out ? fmtTime(day.att.clock_out) : '17:00'
  } else {
    attEditForm.status    = day.isDayOff || day.isHoliday ? 'on_leave' : 'present'
    attEditForm.clock_in  = ws
    attEditForm.clock_out = '17:00'
  }
}

function calCellTitle(day: any) {
  const parts: string[] = []
  if (day.isHoliday) parts.push('Holiday: ' + day.holidayName)
  if (day.isDayOff)  parts.push('Day Off')
  if (day.att)       parts.push(ucfirst(day.att.status))
  if (!day.isFuture && !day.att && !day.isHoliday) parts.push('Click to mark attendance')
  return parts.join(' · ')
}

async function calSaveRecord() {
  if (!calEditDay.value) return
  const ok = await act({
    action:    'add_attendance',
    branch_id: emp.value?.branch_id || 1,
    date:      calEditDay.value.date,
    status:    attEditForm.status,
    clock_in:  attEditForm.status !== 'absent' ? attEditForm.clock_in  : '',
    clock_out: attEditForm.status !== 'absent' ? attEditForm.clock_out : '',
  })
  if (ok) { showToast('success', 'Attendance saved'); calEditDay.value = null }
}

async function calDeleteRecord() {
  if (!calEditDay.value?.att) { calEditDay.value = null; return }
  if (!confirm('Clear attendance for ' + calEditDay.value.date + '?')) return
  await act({ action: 'delete_attendance', date: calEditDay.value.date })
  calEditDay.value = null
  showToast('success', 'Record cleared')
}

// ── Edit Employee ─────────────────────────────────────────────────
const showEditEmp = ref(false)
const ef = reactive<Record<string, any>>({})
function openEditEmp() {
  const e = emp.value
  Object.assign(ef, {
    first_name: e.first_name, last_name: e.last_name,
    email: e.email, phone: e.phone, address: e.address,
    nid: e.nid || '', dob: e.dob?.slice(0,10) || '',
    gender: e.gender || '', blood_group: e.blood_group || '',
    emergency_contact: e.emergency_contact || '',
    position_id: e.position_id, branch_id: e.branch_id,
    hire_date: e.hire_date?.slice(0, 10), base_salary: e.base_salary,
    status: e.status,
    bank_name: e.bank_name || '', bank_account: e.bank_account || '', bank_branch: e.bank_branch || '',
  })
  showEditEmp.value = true
}
async function saveEmployee() {
  const ok = await act({ action: 'update_employee', ...ef })
  if (ok) { showToast('success', 'Profile updated'); showEditEmp.value = false }
}

// ── Salary Structure ──────────────────────────────────────────────
const showSalary = ref(false)
const sf = reactive({ basic_salary: 0, house_allowance: 0, transport_allowance: 0, medical_allowance: 0, other_allowances: 0, provident_fund: 0, tax_deduction: 0, other_deductions: 0 })
const sfGross = computed(() => (sf.basic_salary||0)+(sf.house_allowance||0)+(sf.transport_allowance||0)+(sf.medical_allowance||0)+(sf.other_allowances||0))
const sfNet   = computed(() => sfGross.value - (sf.provident_fund||0) - (sf.tax_deduction||0) - (sf.other_deductions||0))

function openSalaryModal() {
  const s = salaryStructure.value || {}
  Object.assign(sf, {
    basic_salary: s.basic_salary || emp.value?.base_salary || 0,
    house_allowance: s.house_allowance || 0,
    transport_allowance: s.transport_allowance || 0,
    medical_allowance: s.medical_allowance || 0,
    other_allowances: s.other_allowances || 0,
    provident_fund: s.provident_fund || 0,
    tax_deduction: s.tax_deduction || 0,
    other_deductions: s.other_deductions || 0,
  })
  showSalary.value = true
}
async function saveSalaryStructure() {
  const ok = await act({ action: 'save_salary_structure', ...sf })
  if (ok) { showToast('success', 'Salary structure saved'); showSalary.value = false }
}

// ── Payroll ───────────────────────────────────────────────────────
const showPayroll = ref(false)
const payForm = reactive({ pay_period_start: '', pay_period_end: '', gross_salary: 0, deductions: 0, status: 'paid' })
function openPayrollModal() {
  const t = new Date()
  payForm.pay_period_start = new Date(t.getFullYear(), t.getMonth(), 1).toISOString().slice(0, 10)
  payForm.pay_period_end   = new Date(t.getFullYear(), t.getMonth() + 1, 0).toISOString().slice(0, 10)
  const ss = salaryStructure.value
  payForm.gross_salary = ss?.gross_salary || emp.value?.base_salary || 0
  payForm.deductions   = ss ? (+ss.provident_fund + +ss.tax_deduction + +ss.other_deductions) : 0
  payForm.status = 'paid'
  showPayroll.value = true
}
async function savePayroll() {
  const net = payForm.gross_salary - payForm.deductions
  const ok = await act({ action: 'add_payroll', branch_id: emp.value?.branch_id || 1, ...payForm, net_salary: net })
  if (ok) { showToast('success', 'Payroll record added'); showPayroll.value = false }
}

// ── Loans ─────────────────────────────────────────────────────────
const newLoan = reactive({ amount: 0, installments: 12, installment_type: 'monthly', loan_date: new Date().toISOString().slice(0, 10) })
async function addLoan() {
  if (!newLoan.amount) return showToast('error', 'Enter loan amount')
  const ok = await act({ action: 'add_loan', branch_id: emp.value?.branch_id || 1, ...newLoan })
  if (ok) { showToast('success', 'Loan issued'); newLoan.amount = 0 }
}
async function updateLoan(loanId: number, status: string) {
  const ok = await act({ action: 'update_loan', loan_id: loanId, status })
  if (ok) showToast('success', 'Loan updated')
}

// ── Leaves ────────────────────────────────────────────────────────
const showLeave = ref(false)
const leaveForm = reactive({ leave_type: 'annual', start_date: '', end_date: '', reason: '', status: 'approved' })
function openLeaveModal() {
  const t = new Date().toISOString().slice(0, 10)
  leaveForm.start_date = t; leaveForm.end_date = t
  leaveForm.leave_type = 'annual'; leaveForm.reason = ''; leaveForm.status = 'approved'
  showLeave.value = true
}
async function saveLeave() {
  const ok = await act({ action: 'add_leave', branch_id: emp.value?.branch_id || 1, ...leaveForm })
  if (ok) { showToast('success', 'Leave added'); showLeave.value = false }
}
async function updateLeave(leaveId: number, status: string) {
  await act({ action: 'update_leave', leave_id: leaveId, status })
}
async function deleteLeave(leaveId: number) {
  if (!confirm('Delete this leave record?')) return
  const ok = await act({ action: 'delete_leave', leave_id: leaveId })
  if (ok) showToast('success', 'Leave deleted')
}

// ── Documents ─────────────────────────────────────────────────────
const showDoc = ref(false)
const docForm = reactive({ name: '', category: 'general', file_type: '', file_path: '', expiry_date: '', notes: '' })
function openDocModal() {
  Object.assign(docForm, { name: '', category: 'general', file_type: '', file_path: '', expiry_date: '', notes: '' })
  showDoc.value = true
}
async function saveDoc() {
  if (!docForm.name) return showToast('error', 'Document name required')
  const ok = await act({ action: 'add_document', ...docForm })
  if (ok) { showToast('success', 'Document added'); showDoc.value = false }
}
async function deleteDoc(docId: number) {
  if (!confirm('Delete this document?')) return
  const ok = await act({ action: 'delete_document', doc_id: docId })
  if (ok) showToast('success', 'Document deleted')
}

// ── Assets ────────────────────────────────────────────────────────
const showAsset      = ref(false)
const availableAssets = ref<any[]>([])
const assetForm = reactive({ asset_id: '', assigned_on: new Date().toISOString().slice(0, 10), due_date: '', condition_in: 'good', notes: '' })
async function openAssetModal() {
  const res: any = await $fetch('/api/hr/assets').catch(() => ({ assets: [] }))
  availableAssets.value = (res.assets ?? []).filter((a: any) => a.status === 'available')
  assetForm.asset_id = ''; assetForm.due_date = ''; assetForm.notes = ''; assetForm.condition_in = 'good'
  showAsset.value = true
}
async function saveAsset() {
  if (!assetForm.asset_id) return showToast('error', 'Select an asset')
  const ok = await act({ action: 'assign_asset', ...assetForm })
  if (ok) { showToast('success', 'Asset assigned'); showAsset.value = false }
}
async function returnAsset(assignment: any) {
  const cond = prompt('Return condition (new/good/fair/poor):', 'good')
  if (!cond) return
  const ok = await act({ action: 'return_asset', assignment_id: assignment.id, asset_id: assignment.asset_id, condition_out: cond })
  if (ok) showToast('success', 'Asset returned')
}
</script>

<style scoped>
/* Info grid */
.info-grid { display: grid; grid-template-columns: 140px 1fr; gap: 8px 12px; font-size: 0.875rem; }
.info-grid dt { color: var(--tw-text-opacity, 1); color: rgb(107 114 128); font-size: 0.8rem; }
.info-grid dd { color: rgb(229 231 235); font-weight: 500; }

/* Salary rows */
.sal-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.8125rem; }
.sal-row.earn span:last-child { color: rgb(52 211 153); }
.sal-row.ded  span:last-child { color: rgb(248 113 113); }
.sal-row.total { font-weight: 700; font-size: 0.875rem; color: rgb(245 158 11); border-bottom: none; padding-top: 8px; }
.sal-row.net   { font-weight: 700; font-size: 0.9375rem; color: rgb(52 211 153); border-bottom: none; padding-top: 8px; }

/* Calendar */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.cal-dow {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgb(107 114 128);
  padding: 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.cal-cell {
  min-height: 64px;
  border-radius: 8px;
  padding: 6px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  transition: background 0.15s;
  position: relative;
  overflow: hidden;
}
.cal-cell:hover:not(.opacity-30) { background: rgba(255,255,255,0.06); }
.cal-day-num { font-size: 0.8rem; font-weight: 600; color: rgb(209 213 219); margin-bottom: 2px; }
.cal-time { font-size: 0.65rem; color: rgb(156 163 175); font-family: monospace; }
.cal-holiday-name { font-size: 0.6rem; color: rgb(94 234 212); line-height: 1.2; margin-top: 2px; }
.cal-label-small { font-size: 0.65rem; color: rgb(107 114 128); }

.cal-present  { background: rgba(34, 197, 94, 0.12) !important; border-color: rgba(34, 197, 94, 0.3) !important; }
.cal-absent   { background: rgba(239, 68, 68, 0.12) !important; border-color: rgba(239, 68, 68, 0.3) !important; }
.cal-late     { background: rgba(245, 158, 11, 0.12) !important; border-color: rgba(245, 158, 11, 0.3) !important; }
.cal-on-leave { background: rgba(99, 102, 241, 0.12) !important; border-color: rgba(99, 102, 241, 0.3) !important; }
.cal-holiday  { background: rgba(20, 184, 166, 0.12) !important; border-color: rgba(20, 184, 166, 0.3) !important; }
.cal-dayoff   { background: rgba(255,255,255,0.02) !important; border-color: rgba(255,255,255,0.04) !important; }

/* Calendar chips */
.cal-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; }
.cal-chip b { font-weight: 700; margin-left: 4px; }
.cal-chip-green  { background: rgba(34, 197, 94, 0.1); color: rgb(134 239 172); border: 1px solid rgba(34, 197, 94, 0.2); }
.cal-chip-red    { background: rgba(239, 68, 68, 0.1); color: rgb(252 165 165); border: 1px solid rgba(239, 68, 68, 0.2); }
.cal-chip-amber  { background: rgba(245, 158, 11, 0.1); color: rgb(252 211 77); border: 1px solid rgba(245, 158, 11, 0.2); }
.cal-chip-indigo { background: rgba(99, 102, 241, 0.1); color: rgb(165 180 252); border: 1px solid rgba(99, 102, 241, 0.2); }
.cal-chip-teal   { background: rgba(20, 184, 166, 0.1); color: rgb(94 234 212); border: 1px solid rgba(20, 184, 166, 0.2); }
.cal-chip-gray   { background: rgba(255,255,255,0.04); color: rgb(156 163 175); border: 1px solid rgba(255,255,255,0.08); }

/* Toast transition */
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>
