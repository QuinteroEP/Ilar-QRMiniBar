"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Cormorant_Garamond } from "next/font/google"
import { useProductStore } from "@/store/useProductStore"
import styles from "./page.module.css"
import { useSearchParams } from "next/navigation"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-cormorant",
})

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const router = useRouter()
  const { products, fetchProducts } = useProductStore()
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [roomInput, setRoomInput] = useState("")
  const [roomError, setRoomError] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // If there's a ?room= query param, prefill the input and open the modal
  useEffect(() => {
    const roomQuery = searchParams?.get("room")
    if (roomQuery) {
      setRoomInput(roomQuery)
      setRoomError("")
      setShowRoomModal(true)
      if (roomQuery.trim() && !isNaN(parseInt(roomQuery)) && parseInt(roomQuery) > 0) {
        router.push(`/menu?room=${roomQuery.trim()}`)
      } else {
        setRoomError("El número de habitación en la URL no es válido.")
      }
    }
  }, [searchParams])

  const featured = products.slice(0, 4)

  

  const handleOrder = () => {
    const num = parseInt(roomInput.trim())
    if (!roomInput.trim() || isNaN(num) || num <= 0) {
      setRoomError("Ingresa un número de habitación válido.")
      return
    }
    router.push(`/menu?room=${num}`)
  }

  const openModal = () => {
    setRoomInput("")
    setRoomError("")
    setShowRoomModal(true)
  }

  return (
    <div className={`${styles.page} ${cormorant.variable}`}>

      {/* Hero */}
      <header className={styles.hero}>
        <p className={styles.hotelLabel}>Hotel Ilar</p>
        <div className={styles.ornament}>
          <span className={styles.ornamentLine} />
          <span className={styles.ornamentDiamond}>◆</span>
          <span className={styles.ornamentLine} />
        </div>
        <h1 className={styles.heroTitle}>Mini Bar</h1>
        <p className={styles.heroSub}>
          Una selección curada para su comodidad
        </p>
      </header>

      <main className={styles.main}>

        {/* Welcome text */}
        <section className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>Bienvenido</h2>
          <p className={styles.welcomeText}>
            Disfrute desde la comodidad de su habitación nuestra selección
            de bebidas, snacks y productos de temporada, disponibles las
            24 horas del día.
          </p>
        </section>

        {/* Featured products */}
        {featured.length > 0 && (
          <section className={styles.featured}>
            <p className={styles.sectionLabel}>Destacados</p>
            <ul className={styles.featuredGrid}>
              {featured.map((p, idx) => (
                <li
                  key={p.id}
                  className={styles.featuredCard}
                  style={{ animationDelay: `${idx * 70}ms` }}
                >
                  <span className={styles.featuredName}>{p.name}</span>
                  <span className={styles.featuredPrice}>
                    ${p.price.toLocaleString("es-CO")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <section className={styles.cta}>
          <div className={styles.ctaDivider} />
          <p className={styles.ctaHint}>
            Para realizar un pedido ingrese el número de su habitación
          </p>
          <button className={styles.ctaBtn} onClick={openModal}>
            ¿Desea hacer un pedido?
          </button>
        </section>

      </main>

      {/* Room number modal */}
      {showRoomModal && (
        <div className={styles.overlay} onClick={() => setShowRoomModal(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />

            <p className={styles.sheetLabel}>Nuevo pedido</p>
            <h2 className={styles.sheetTitle}>¿Cuál es su<br />habitación?</h2>

            <input
              className={`${styles.roomInput} ${roomError ? styles.roomInputError : ""}`}
              type="number"
              inputMode="numeric"
              placeholder="Ej: 205"
              value={roomInput}
              onChange={(e) => {
                setRoomInput(e.target.value)
                setRoomError("")
              }}
              onKeyDown={(e) => e.key === "Enter" && handleOrder()}
              autoFocus
            />
            {roomError && <p className={styles.inputError}>{roomError}</p>}

            <div className={styles.sheetActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowRoomModal(false)}
              >
                Cancelar
              </button>
              <button className={styles.confirmBtn} onClick={handleOrder}>
                Ver el menú →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
