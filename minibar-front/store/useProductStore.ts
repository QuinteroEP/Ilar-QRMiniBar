import { create } from "zustand"
import { api } from "@/lib/api"

export type Product = {
  id: number
  name: string
  price: number
  inventory: number
}

type ProductStore = {
  products: Product[]
  loading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  addProduct: (data: Omit<Product, "id">) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get("/products")
      set({ products: res.data.data, loading: false })
    } catch {
      set({ loading: false, error: "No se pudieron cargar los productos. ¿El backend está corriendo?" })
    }
  },

  addProduct: async (data) => {
    await api.post("/products/add/", null, {
      params: { name: data.name, price: data.price, inventory: data.inventory },
    })
    await get().fetchProducts()
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/delete/{product_id}?id=${id}`)
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }))
  },
}))
