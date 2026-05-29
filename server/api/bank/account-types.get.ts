import { query } from '~/server/utils/db'

// UI config per DB enum value
const TYPE_CONFIG: Record<string, { name: string; icon: string; color: string; description: string }> = {
  Checking: { name: 'Current / Checking', icon: '🏦', color: '#10b981', description: 'Primary operational accounts for daily transactions and payments.' },
  Savings:  { name: 'Savings Account',    icon: '💰', color: '#3b82f6', description: 'Interest-bearing savings and reserve accounts.' },
  Loan:     { name: 'Loan Account',       icon: '🏛', color: '#ef4444', description: 'Bank loan and credit facility accounts.' },
  Credit:   { name: 'Credit Account',     icon: '💳', color: '#8b5cf6', description: 'Credit line and overdraft accounts.' },
  Other:    { name: 'Other / MFS',        icon: '📱', color: '#f59e0b', description: 'bKash, Nagad, Rocket and other mobile financial accounts.' },
}

export default defineEventHandler(async () => {
  const rows = await query(
    `SELECT account_type, COUNT(*) AS cnt
     FROM bank_accounts
     WHERE status != 'closed'
     GROUP BY account_type`,
  ) as any[]

  const countMap: Record<string, number> = {}
  for (const r of rows) countMap[r.account_type] = Number(r.cnt)

  // Always include Checking/Savings even if count = 0; skip empty Others
  const types = Object.entries(TYPE_CONFIG).map(([id, cfg]) => ({
    id,
    name:        cfg.name,
    icon:        cfg.icon,
    color:       cfg.color,
    description: cfg.description,
    count:       countMap[id] ?? 0,
    status:      'active',
  })).filter(t => t.count > 0 || ['Checking', 'Savings'].includes(t.id))

  return { types }
})
