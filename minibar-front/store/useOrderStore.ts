import { create } from "zustand"
import { api } from "@/lib/api"

export type Order = {
  id: number
  room_id: number
  cost: number
}

type OrderStore = {
  orders: Order[]
  loading: boolean
  error: string | null
  fetchOrders: () => Promise<void>
  deleteOrder: (id: number) => Promise<void>
  addOrder: (data: Omit<Order, "id" | "cost">) => Promise<void>
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get("/orders")
      set({ orders: res.data.data, loading: false })
    } catch {
      set({ loading: false, error: "No se pudieron cargar las órdenes." })
    }
  },

  addOrder: async (data) => {
    const res = await api.post("/orders/add/", null, {
      params: { room_id: data.room_id, products_id: [], amounts: [] },
    })
    set((state) => ({ orders: [...state.orders, res.data.data] }))
  },

  deleteOrder: async (id) => {
    await api.delete(`/orders/delete/${id}`)
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    }))
  },
}))
