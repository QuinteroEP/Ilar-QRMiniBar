"use client"

import { Suspense, useEffect, useRef, useState } from "react"
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

  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bumpKey, setBumpKey] = useState(0)
  const prevCountRef = useRef(0)

  const { products, loading, error, fetchProducts } = useProductStore()
  const { items, add, increment, decrement, count, total, submitOrder } = useCartStore()

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const totalItems = count()
  const totalPrice = total()

  // Dispara animación solo cuando se agrega un producto
  useEffect(() => {
    if (totalItems > prevCountRef.current) {
      setBumpKey((k) => k + 1)
    }
    prevCountRef.current = totalItems
  }, [totalItems])

  const getQty = (id: number) => items.find((i) => i.product.id === id)?.quantity ?? 0

  const handleConfirm = async () => {
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
                const outOfStock = product.inventory === 0

                return (
                  <li
                    key={product.id}
                    className={`${styles.item} ${outOfStock ? styles.itemDisabled : ""}`}
                    style={{ animationDelay: `${idx * 55}ms` }}
                  >
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{product.name}</span>
                      <span className={styles.itemPrice}>
                        {outOfStock
                          ? "Agotado"
                          : `$${product.price.toLocaleString("es-CO")}`}
                      </span>
                    </div>
                    <div className={styles.itemControls}>
                      {outOfStock ? (
                        <span className={styles.outOfStock}>—</span>
                      ) : qty === 0 ? (
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

      {/* Cart bar */}
      <div className={`${styles.cartBar} ${totalItems > 0 ? styles.cartVisible : ""}`}>
        <div className={styles.cartMeta}>
          <span className={styles.cartItems}>
            {totalItems}&nbsp;{totalItems === 1 ? "artículo" : "artículos"}
          </span>
          <span key={bumpKey} className={styles.cartTotal}>
            ${totalPrice.toLocaleString("es-CO")}
          </span>
        </div>
        <button
          className={styles.sendBtn}
          onClick={() => setShowModal(true)}
          disabled={submitting}
        >
          Ver pedido
        </button>
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />

            <p className={styles.sheetLabel}>Hotel Ilar</p>
            <h2 className={styles.sheetTitle}>Tu pedido</h2>

            <ul className={styles.sheetList}>
              {items.map((item) => (
                <li key={item.product.id} className={styles.sheetRow}>
                  <span className={styles.sheetName}>{item.product.name}</span>
                  <span className={styles.sheetQty}>×{item.quantity}</span>
                  <span className={styles.sheetPrice}>
                    ${(item.product.price * item.quantity).toLocaleString("es-CO")}
                  </span>
                </li>
              ))}
            </ul>

            <div className={styles.sheetTotal}>
              <span className={styles.sheetTotalLabel}>Total</span>
              <span className={styles.sheetTotalPrice}>
                ${totalPrice.toLocaleString("es-CO")}
              </span>
            </div>

            <div className={styles.sheetActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? "Enviando…" : "Confirmar pedido"}
              </button>
            </div>
          </div>
        </div>
      )}
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
