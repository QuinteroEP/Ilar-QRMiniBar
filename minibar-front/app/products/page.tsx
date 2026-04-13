"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useProductStore } from "@/store/useProductStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// 1. Esquema de validación con Zod
const schema = z.object({
  name:      z.string().min(1, "El nombre es requerido"),
  price:     z.coerce.number().positive("Debe ser mayor a 0"),
  inventory: z.coerce.number().int().min(0, "No puede ser negativo"),
})
type ProductForm = z.infer<typeof schema>

export default function ProductsPage() {
  // 2. Zustand — estado global
  const { products, loading, fetchProducts, addProduct, deleteProduct } = useProductStore()

  // 3. React Hook Form + Zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", price: 0, inventory: 0 },
  })

  // Carga los productos al entrar a la página
  useEffect(() => {
    fetchProducts()
  }, [])

  // 4. Submit — Axios llama al backend desde el store
  const onSubmit = async (data: ProductForm) => {
    await addProduct(data)
    reset()
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Productos del MiniBar</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-6">
        <h2 className="text-lg font-semibold">Agregar producto</h2>

        <div className="space-y-1">
          <Input placeholder="Nombre" {...register("name")} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Input placeholder="Precio" type="number" step="0.01" {...register("price")} />
          {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
        </div>

        <div className="space-y-1">
          <Input placeholder="Inventario" type="number" {...register("inventory")} />
          {errors.inventory && <p className="text-red-500 text-sm">{errors.inventory.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Agregar"}
        </Button>
      </form>

      {/* Tabla de productos */}
      {loading ? (
        <p className="text-muted-foreground">Cargando productos...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Inventario</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No hay productos
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>${p.price}</TableCell>
                  <TableCell>{p.inventory}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteProduct(p.id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
