import { defineStore } from 'pinia'

export interface EngineFormula {
  bag_50: number
  bag_74: number
  packaging_fee: number
}

export interface EngineConfig {
  formula: EngineFormula
}

export interface Branch {
  id: number
  name: string
  code: string | null
  branch_type: 'factory' | 'sales_region' | 'office' | null
  source_branch_id: number | null
}

export interface PriceComponent {
  id: number
  branch_id: number
  name: string
  weight_class: '50' | '74' | 'all'
  charge_type: 'base' | 'mini_truck'
  amount: number
  is_active: number
}

function roundDown5(v: number): number {
  return Math.floor(v / 5) * 5
}

export const usePricingEngineStore = defineStore('pricingEngine', () => {
  const config = ref<EngineConfig>({
    formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 },
  })
  const grades             = ref<string[]>([])
  const gradeData          = ref<Record<string, Record<string, any[]>>>({})
  const branches           = ref<Branch[]>([])
  const componentsByBranch = ref<Record<string, PriceComponent[]>>({})
  const current50ByFactory = ref<Record<string, Record<string, number>>>({})
  const loading            = ref(false)

  async function fetchConfig() {
    loading.value = true
    try {
      const data = await $fetch<any>('/api/products/pricing-engine')
      config.value             = data.config
      grades.value             = data.grades
      gradeData.value          = data.gradeData
      branches.value           = data.branches
      componentsByBranch.value = data.componentsByBranch ?? {}
      current50ByFactory.value = data.current50ByFactory ?? {}
    } finally {
      loading.value = false
    }
  }

  async function saveConfig(payload: EngineConfig) {
    await $fetch('/api/products/pricing-engine', {
      method: 'POST',
      body: {
        action:        'save_config',
        bag_50:        payload.formula.bag_50,
        bag_74:        payload.formula.bag_74,
        packaging_fee: payload.formula.packaging_fee,
      },
    })
    config.value = payload
  }

  function computePrice74(price50: number): number {
    const { bag_50, bag_74, packaging_fee } = config.value.formula
    return roundDown5((price50 / bag_50) * bag_74 + packaging_fee)
  }

  /** Sum of active in-price charges for a branch + weight class ('all' always counts). */
  function sumBaseCharges(branchId: number, weightClass: string): number {
    return (componentsByBranch.value[String(branchId)] ?? [])
      .filter(c => c.is_active && c.charge_type === 'base'
        && (c.weight_class === weightClass || c.weight_class === 'all'))
      .reduce((s, c) => s + Number(c.amount), 0)
  }

  /** Final stored price for a branch: factory-anchored chain, floor-৳5 at every step. */
  function finalPrice(base: number, branchId: number, weightClass: '50' | '74'): number | null {
    const branch = branches.value.find(b => b.id === branchId)
    if (!branch || branch.branch_type === 'office') return null

    if (branch.branch_type === 'factory')
      return roundDown5(base + sumBaseCharges(branch.id, weightClass))

    if (!branch.source_branch_id) return null
    const factoryPrice = roundDown5(base + sumBaseCharges(branch.source_branch_id, weightClass))
    return roundDown5(factoryPrice + sumBaseCharges(branch.id, weightClass))
  }

  /** Per-bag surcharge applied at order time when delivery is by mini truck. */
  function miniTruckSurcharge(branchId: number, weightClass: string): number {
    return (componentsByBranch.value[String(branchId)] ?? [])
      .filter(c => c.is_active && c.charge_type === 'mini_truck'
        && (c.weight_class === weightClass || c.weight_class === 'all'))
      .reduce((s, c) => s + Number(c.amount), 0)
  }

  return {
    config, grades, gradeData, branches, componentsByBranch, current50ByFactory, loading,
    fetchConfig, saveConfig, computePrice74, sumBaseCharges, finalPrice, miniTruckSurcharge,
  }
})
