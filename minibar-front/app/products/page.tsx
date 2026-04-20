"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useProductStore } from "@/store/useProductStore"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import s from "./page.module.css"

const schema = z.object({
  name:      z.string().min(1, "El nombre es requerido"),
  price:     z.coerce.number().positive("Debe ser mayor a 0"),
  inventory: z.coerce.number().int().min(0, "No puede ser negativo"),
})
type ProductForm = z.infer<typeof schema>

export default function ProductsPage() {
  const { products, loading, error, fetchProducts, addProduct, deleteProduct } = useProductStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", price: 0, inventory: 0 },
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const onSubmit = async (data: ProductForm) => {
    await addProduct(data)
    reset()
  }

  return (
    <div className={s.page}>

      {/* Header */}
      <header className={s.header}>
        <div className={s.headerInner}>
          <div className={s.headerAccent} />
          <span className={s.headerBrand}>Ilar Hotel</span>
          <span className={s.headerDot}>·</span>
          <span className={s.headerSection}>Gestión de MiniBar</span>
        </div>
      </header>

      <main className={s.main}>

        {/* Título */}
        <div className={s.titleBlock}>
          <h1 className={s.title}>Productos</h1>
          <p className={s.subtitle}>Administra el inventario del minibar</p>
        </div>

        {/* Formulario */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <div className={s.cardHeaderLeft}>
              <div className={s.cardDot} />
              <h2 className={s.cardTitle}>Agregar producto</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={s.formBody}>
            <div className={s.formGrid}>

              <div className={s.fieldGroup}>
                <label className={s.label}>Nombre</label>
                <input className={s.input} placeholder="Ej: Coca Cola" {...register("name")} />
                {errors.name && <p className={s.fieldError}>{errors.name.message}</p>}
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Precio (S/.)</label>
                <input className={s.input} type="number" step="0.01" placeholder="0.00" {...register("price")} />
                {errors.price && <p className={s.fieldError}>{errors.price.message}</p>}
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label}>Inventario</label>
                <input className={s.input} type="number" placeholder="0" {...register("inventory")} />
                {errors.inventory && <p className={s.fieldError}>{errors.inventory.message}</p>}
              </div>

            </div>

            <div className={s.formFooter}>
              <button type="submit" disabled={isSubmitting} className={s.btnPrimary}>
                {isSubmitting ? "Guardando..." : "Agregar producto"}
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && <div className={s.errorBanner}>{error}</div>}

        {/* Tabla */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <div className={s.cardHeaderLeft}>
              <div className={s.cardDot} />
              <h2 className={s.cardTitle}>Inventario actual</h2>
            </div>
            {!loading && (
              <span className={s.cardCount}>
                {products.length} {products.length === 1 ? "producto" : "productos"}
              </span>
            )}
          </div>

          {loading ? (
            <div className={s.loading}>
              <span className={s.dot} />
              <span className={s.dot} />
              <span className={s.dot} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className={s.tableRow}>
                  <TableHead className={s.tableHead}>Nombre</TableHead>
                  <TableHead className={s.tableHead}>Precio</TableHead>
                  <TableHead className={s.tableHead}>Inventario</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow className={s.tableRow}>
                    <TableCell colSpan={4} className={s.emptyCell}>
                      No hay productos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p.id} className={s.tableRow}>
                      <TableCell className={s.cellName}>{p.name}</TableCell>
                      <TableCell className={s.cellPrice}>
                        S/. {Number(p.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`${s.badge} ${
                          p.inventory > 10 ? s.badgeGreen :
                          p.inventory > 0  ? s.badgeAmber :
                          s.badgeRed
                        }`}>
                          {p.inventory} uds
                        </span>
                      </TableCell>
                      <TableCell style={{ textAlign: "right" }}>
                        <button className={s.btnDelete} onClick={() => deleteProduct(p.id)}>
                          Eliminar
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

      </main>
    </div>
  )
}
