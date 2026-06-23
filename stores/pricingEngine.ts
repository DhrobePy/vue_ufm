import { defineStore } from 'pinia'

export interface EngineFormula {
  bag_50: number
  bag_74: number
  packaging_fee: number
}

export interface BranchSurcharge {
  surcharge_50: number
  surcharge_74: number
}

export interface EngineConfig {
  formula: EngineFormula
  branch_surcharges: Record<string, BranchSurcharge>
}

export interface Branch {
  id: number
  name: string
  code: string | null
}

function roundDown5(v: number): number {
  return Math.floor(v / 5) * 5
}

export const usePricingEngineStore = defineStore('pricingEngine', () => {
  const config  = ref<EngineConfig>({
    formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 },
    branch_surcharges: {},
  })
  const grades     = ref<string[]>([])
  const gradeData  = ref<Record<string, Record<string, any[]>>>({})
  const current50  = ref<Record<string, number>>({})
  const branches   = ref<Branch[]>([])
  const loading    = ref(false)

  async function fetchConfig() {
    loading.value = true
    try {
      const data = await $fetch<any>('/api/products/pricing-engine')
      config.value  = data.config
      grades.value  = data.grades
      gradeData.value = data.gradeData
      current50.value = data.current50
      branches.value  = data.branches
    } finally {
      loading.value = false
    }
  }

  async function saveConfig(payload: EngineConfig) {
    await $fetch('/api/products/pricing-engine', {
      method: 'POST',
      body: {
        action:            'save_config',
        bag_50:            payload.formula.bag_50,
        bag_74:            payload.formula.bag_74,
        packaging_fee:     payload.formula.packaging_fee,
        branch_surcharges: payload.branch_surcharges,
      },
    })
    config.value = payload
  }

  function computePrice74(price50: number): number {
    const { bag_50, bag_74, packaging_fee } = config.value.formula
    return roundDown5((price50 / bag_50) * bag_74 + packaging_fee)
  }

  function finalPrice(basePrice: number, branchId: number, weightClass: '50' | '74'): number {
    const sc = config.value.branch_surcharges[String(branchId)]
    const surcharge = weightClass === '50' ? Number(sc?.surcharge_50 ?? 0) : Number(sc?.surcharge_74 ?? 0)
    return roundDown5(basePrice + surcharge)
  }

  return {
    config, grades, gradeData, current50, branches, loading,
    fetchConfig, saveConfig, computePrice74, finalPrice,
  }
})
