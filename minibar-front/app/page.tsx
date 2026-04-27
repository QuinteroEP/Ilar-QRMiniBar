"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Cormorant_Garamond } from "next/font/google"
import { useProductStore } from "@/store/useProductStore"
import { useCartStore } from "@/store/useCartStore"
import styles from "./page.module.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-cormorant",
})

function MenuPage() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get("room") ?? "—"
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const { products, loading, error, fetchProducts } = useProductStore()
  const { items, add, increment, decrement, count, total, submitOrder } = useCartStore()

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const getQty = (id: number) => items.find((i) => i.product.id === id)?.quantity ?? 0

  const handleSubmit = async () => {
    const roomNum = parseInt(roomId)
    if (isNaN(roomNum) || submitting) return
    setSubmitting(true)
    try {
      await submitOrder(roomNum)
      router.push("/confirmation")
    } catch {
      setSubmitting(false)
    }
  }

  const totalItems = count()
  const totalPrice = total()

  return (
    <div className={`${styles.page} ${cormorant.variable}`}>
      <header className={styles.header}>
        <p className={styles.hotelLabel}>Hotel Ilar</p>
        <div className={styles.ornament}>
          <span className={styles.ornamentLine} />
          <span className={styles.ornamentDiamond}>◆</span>
          <span className={styles.ornamentLine} />
        </div>
        <h1 className={styles.title}>Mini Bar</h1>
        <p className={styles.roomLabel}>Habitación&nbsp;{roomId}</p>
      </header>

      <main className={styles.main}>
        {loading && (
          <div className={styles.state}>
            <p className={styles.stateText}>Cargando menú…</p>
          </div>
        )}
        {error && (
          <div className={styles.state}>
            <p className={styles.stateError}>{error}</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <p className={styles.sectionLabel}>Selección del día</p>
            <ul className={styles.list}>
              {products.map((product, idx) => {
                const qty = getQty(product.id)
                return (
                  <li
                    key={product.id}
                    className={styles.item}
                    style={{ animationDelay: `${idx * 55}ms` }}
                  >
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{product.name}</span>
                      <span className={styles.itemPrice}>
                        ${product.price.toLocaleString("es-CO")}
                      </span>
                    </div>
                    <div className={styles.itemControls}>
                      {qty === 0 ? (
                        <button
                          className={styles.addBtn}
                          onClick={() => add(product)}
                          aria-label={`Agregar ${product.name}`}
                        >
                          +
                        </button>
                      ) : (
                        <div className={styles.counter}>
                          <button
                            className={styles.cBtn}
                            onClick={() => decrement(product.id)}
                            aria-label="Quitar uno"
                          >
                            −
                          </button>
                          <span className={styles.cVal}>{qty}</span>
                          <button
                            className={styles.cBtn}
                            onClick={() => increment(product.id)}
                            aria-label="Agregar uno más"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </main>

      <div className={`${styles.cartBar} ${totalItems > 0 ? styles.cartVisible : ""}`}>
        <div className={styles.cartMeta}>
          <span className={styles.cartItems}>
            {totalItems}&nbsp;{totalItems === 1 ? "artículo" : "artículos"}
          </span>
          <span className={styles.cartTotal}>
            ${totalPrice.toLocaleString("es-CO")}
          </span>
        </div>
        <button
          className={styles.sendBtn}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Enviando…" : "Enviar pedido"}
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense>
      <MenuPage />
    </Suspense>
  )
}
