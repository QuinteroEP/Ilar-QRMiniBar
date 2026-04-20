"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useOrderStore } from "@/store/useOrderStore"

const schema = z.object({
  room_id: z.coerce.number().int().positive("Debe ser un número de habitación válido"),
})
type OrderForm = z.infer<typeof schema>

export default function OrdersPage() {
  const { orders, loading, error, fetchOrders, addOrder, deleteOrder } = useOrderStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderForm>({
    resolver: zodResolver(schema),
    defaultValues: { room_id: 0 },
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const onSubmit = async (data: OrderForm) => {
    await addOrder(data)
    reset()
  }

  return (
    <div>
      <h1>Órdenes</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Nueva orden</h2>

        <div>
          <label>Habitación</label>
          <input type="number" placeholder="Nro. habitación" {...register("room_id")} />
          {errors.room_id && <p>{errors.room_id.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear orden"}
        </button>
      </form>

      {/* Error */}
      {error && <p>{error}</p>}

      {/* Lista de órdenes */}
      {loading ? (
        <p>Cargando órdenes...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Habitación</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4}>No hay órdenes registradas</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>Hab. {o.room_id}</td>
                  <td>S/. {Number(o.cost).toFixed(2)}</td>
                  <td>
                    <button onClick={() => deleteOrder(o.id)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
