"use client"

import { Cormorant_Garamond } from "next/font/google"
import styles from "./page.module.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-cormorant",
})

export default function ConfirmationPage() {
  return (
    <div className={`${styles.page} ${cormorant.variable}`}>
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <svg
            className={styles.checkSvg}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              className={styles.ring}
              cx="32"
              cy="32"
              r="28"
              stroke="#B8996A"
              strokeWidth="1"
            />
            <path
              className={styles.check}
              d="M20 32l9 9 15-15"
              stroke="#B8996A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className={styles.hotelLabel}>Hotel Ilar</p>

        <div className={styles.ornament}>
          <span className={styles.line} />
          <span className={styles.diamond}>◆</span>
          <span className={styles.line} />
        </div>

        <h1 className={styles.title}>Pedido<br />recibido</h1>
        <p className={styles.message}>
          Tu pedido llegará en breve<br />a tu cuarto.
        </p>
      </div>
    </div>
  )
}
