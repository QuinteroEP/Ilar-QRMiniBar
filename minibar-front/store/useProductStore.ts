import { create } from "zustand"

export type Product = {
  id: number
  name: string
  price: number
  inventory: number
}

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Agua mineral",   price: 2.50, inventory: 20 },
  { id: 2, name: "Coca Cola",      price: 3.00, inventory: 15 },
  { id: 3, name: "Cerveza Pilsen", price: 4.50, inventory: 10 },
  { id: 4, name: "Papas fritas",   price: 2.00, inventory: 8  },
]

type ProductStore = {
  products: Product[]
  loading: boolean
  fetchProducts: () => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  addProduct: (data: Omit<Product, "id">) => Promise<void>
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true })
    // Simula un pequeño delay de red
    await new Promise((r) => setTimeout(r, 500))
    set({ products: MOCK_PRODUCTS, loading: false })
  },

  addProduct: async (data) => {
    await new Promise((r) => setTimeout(r, 300))
    const newProduct: Product = {
      id: Date.now(),
      ...data,
    }
    set((state) => ({ products: [...state.products, newProduct] }))
  },

  deleteProduct: async (id) => {
    await new Promise((r) => setTimeout(r, 300))
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }))
  },
}))
