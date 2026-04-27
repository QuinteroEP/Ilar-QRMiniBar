"use client"

import { useEffect, useRef } from "react"
import { Cormorant_Garamond } from "next/font/google"
import { useOrderStore } from "@/store/useOrderStore"
import styles from "./page.module.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-cormorant",
})

export default function OrdersPage() {
  const { orders, loading, error, fetchOrders, dispatchOrder } = useOrderStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchOrders()
    intervalRef.current = setInterval(fetchOrders, 15000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchOrders])

  return (
    <div className={`${styles.page} ${cormorant.variable}`}>
      <header className={styles.header}>
        <p className={styles.hotelLabel}>Hotel Ilar</p>
        <div className={styles.ornament}>
          <span className={styles.ornamentLine} />
          <span className={styles.ornamentDiamond}>◆</span>
          <span className={styles.ornamentLine} />
        </div>
        <h1 className={styles.title}>Pedidos</h1>
        <p className={styles.subtitle}>Panel del encargado</p>
        <button className={styles.refreshBtn} onClick={fetchOrders} disabled={loading}>
          {loading ? "…" : "↻ Actualizar"}
        </button>
      </header>

      <main className={styles.main}>
        {loading && orders.length === 0 && (
          <div className={styles.state}>
            <p className={styles.stateText}>Cargando pedidos…</p>
          </div>
        )}

        {error && (
          <div className={styles.state}>
            <p className={styles.stateError}>{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>◇</p>
            <p className={styles.emptyText}>Sin pedidos pendientes</p>
            <p className={styles.emptyHint}>Los pedidos nuevos aparecerán aquí automáticamente</p>
          </div>
        )}

        {orders.length > 0 && (
          <>
            <div className={styles.topBar}>
              <span className={styles.count}>
                {orders.length} {orders.length === 1 ? "pedido pendiente" : "pedidos pendientes"}
              </span>
            </div>

            <ul className={styles.list}>
              {orders.map((order, idx) => (
                <li
                  key={order.id}
                  className={styles.card}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.roomBadge}>
                      <span className={styles.roomLabel}>Habitación</span>
                      <span className={styles.roomNumber}>{order.room_id}</span>
                    </div>
                    <span className={styles.orderTotal}>
                      ${order.cost.toLocaleString("es-CO")}
                    </span>
                  </div>

                  {order.productOrders && order.productOrders.length > 0 && (
                    <ul className={styles.products}>
                      {order.productOrders.map((p) => (
                        <li key={p.id} className={styles.productRow}>
                          <span className={styles.productName}>{p.product_name}</span>
                          <span className={styles.productQty}>×{p.product_quantity}</span>
                          <span className={styles.productPrice}>
                            ${(p.product_price * p.product_quantity).toLocaleString("es-CO")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className={styles.cardFooter}>
                    <span className={styles.orderId}>Pedido #{order.id}</span>
                    <button
                      className={styles.dispatchBtn}
                      onClick={() => dispatchOrder(order.id)}
                    >
                      Despachar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}
