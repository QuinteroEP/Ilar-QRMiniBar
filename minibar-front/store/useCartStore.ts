import { create } from "zustand"
import { Product } from "./useProductStore"
import { api } from "@/lib/api"

type CartItem = { product: Product; quantity: number }

type CartStore = {
  items: CartItem[]
  add: (product: Product) => void
  increment: (productId: number) => void
  decrement: (productId: number) => void
  clear: () => void
  count: () => number
  total: () => number
  submitOrder: (roomId: number) => Promise<void>
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  add: (product) =>
    set((s) => ({ items: [...s.items, { product, quantity: 1 }] })),

  increment: (id) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.product.id === id ? { ...i, quantity: i.quantity + 1 } : i
      ),
    })),

  decrement: (id) =>
    set((s) => ({
      items: s.items
        .map((i) => (i.product.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    })),

  clear: () => set({ items: [] }),

  count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  total: () =>
    get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  submitOrder: async (roomId: number) => {
    const { items, clear } = get()
    const params = new URLSearchParams()
    params.append("room_id", String(roomId))
    items.forEach((i) => {
      params.append("products_id", String(i.product.id))
      params.append("amounts", String(i.quantity))
    })
    await api.post(`/orders/add/?${params.toString()}`)
    clear()
  },
}))
