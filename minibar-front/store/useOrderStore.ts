import { create } from "zustand"
import { api } from "@/lib/api"

export type ProductOrder = {
  id: number
  id_product: number
  product_name: string
  product_price: number
  product_quantity: number
}

export type Order = {
  id: number
  room_id: number
  cost: number
  productOrders?: ProductOrder[]
}

type OrderStore = {
  orders: Order[]
  loading: boolean
  error: string | null
  fetchOrders: () => Promise<void>
  dispatchOrder: (id: number) => Promise<void>
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get("/orders")
      set({ orders: res.data.data ?? [], loading: false })
    } catch {
      set({ loading: false, error: "No se pudieron cargar los pedidos." })
    }
  },

  dispatchOrder: async (id) => {
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }))
    try {
      await api.delete("/orders/", { params: { id } })
    } catch {
      // optimistic — backend confirms later
    }
  },
}))
