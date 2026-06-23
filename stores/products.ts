import { defineStore } from 'pinia'

export interface Product {
  id: number
  base_name: string
  base_sku: string | null
  category: string
  description: string | null
  status: 'active' | 'inactive'
  variant_count: number
}

export interface ProductVariant {
  id: number
  product_id: number
  product_name?: string
  sku: string | null
  weight_variant: string
  grade: string | null
  unit_of_measure: string
  weight_kg: number | null
  status: 'active' | 'inactive'
}

export const useProductsStore = defineStore('products', () => {
  const products  = ref<Product[]>([])
  const loading   = ref(false)
  const error     = ref<string | null>(null)

  async function fetchProducts() {
    loading.value = true
    error.value   = null
    try {
      const data = await $fetch<{ products: Product[] }>('/api/products/base')
      products.value = data.products ?? []
    } catch (e: any) {
      error.value = e?.data?.statusMessage ?? 'Failed to load products'
    } finally {
      loading.value = false
    }
  }

  async function createProduct(payload: { base_name: string; base_sku?: string; category: string; description?: string }) {
    const res = await $fetch<{ id: number }>('/api/products/base', { method: 'POST', body: payload })
    await fetchProducts()
    return res
  }

  async function updateProduct(id: number, payload: Partial<Product>) {
    await $fetch(`/api/products/base/${id}`, { method: 'PUT', body: payload })
    await fetchProducts()
  }

  async function deleteProduct(id: number) {
    await $fetch(`/api/products/base/${id}`, { method: 'DELETE' })
    products.value = products.value.filter(p => p.id !== id)
  }

  const byId = computed(() => new Map(products.value.map(p => [p.id, p])))

  return { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct, byId }
})
