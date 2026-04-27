# Ilar-QRMiniBar

Sistema de gestión de mini-bar para hotel. Los huéspedes escanean un QR en su habitación para ver y pedir productos del mini-bar.

## Estructura del repositorio

```
Ilar-QRMiniBar/
├── MiniBar/              ← Backend (FastAPI + PostgreSQL + SQLAlchemy ORM)
├── minibar-front/        ← Frontend (Next.js 15 + TypeScript)
├── config.py
└── README.md
```

---

## Backend — MiniBar

**Stack:** FastAPI, PostgreSQL, SQLAlchemy ORM (Mapped[], declarative Base)

**Correr:**
```bash
cd MiniBar
# Requiere variables de entorno:
$env:DB_USER = "postgres"
$env:ILAR_PASS = "tu_contraseña"
$env:DB_ADDR = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "ilar"
uvicorn main:app --reload
```

**Base de datos:** PostgreSQL. Configuración completamente por variables de entorno en `db/database.py`.
Las tablas se crean automáticamente al iniciar vía `models/ORM.py → orm()` llamado en `@app.on_event("startup")`.

**Modelos y tablas:**
- `product` — id, name, inventory, price
- `room` — id, number
- `bar_order` — id, room_id (FK→room), cost + relationship cascade a ProductOrder
- `product-order` — id, id_product (FK→product), id_order (FK→bar_order), quantity
- `reservation` — id (placeholder, sin campos útiles aún)

**Deploy:** Backend corriendo en Vercel. `app.py` es el entry point (con CORS `allow_origins=["*"]`). `MiniBar/api/index.py` es el handler que Vercel invoca.

**Endpoints implementados (`/api`):**

| Método | Ruta | Estado |
|--------|------|--------|
| GET | /products | Funcional |
| GET | /products/{product_id} | Roto — bug path param |
| POST | /products/add/ | Funcional (params en query string, no body) |
| PUT | /products/update/{product_id} | Roto — bug path param |
| DELETE | /products/delete/{product_id} | Roto — bug path param |
| GET | /orders | Funcional |
| GET | /orders/{order_id} | Roto — bug path param |
| POST | /orders/add/ | Funcional (params en query string) |
| PUT | /orders/update/{order_id} | Roto — bug path param |
| DELETE | /orders/delete/{order_id} | Roto — bug path param |
| GET | /rooms | Funcional |
| GET | /rooms/{room_id} | Roto — bug path param |
| POST | /rooms/add/ | Funcional |
| PUT | /rooms/update/{room_id} | Roto — bug path param |
| DELETE | /rooms/delete/{room_id} | Roto — bug path param |

**Bugs conocidos activos:**

1. **Path params desvinculados** — En los 3 controllers, las rutas usan `{product_id}`, `{order_id}`, `{room_id}` pero los parámetros de función se llaman `id`. FastAPI no los vincula → 422 siempre en GET/PUT/DELETE by id.
   ```python
   # Ejemplo en product_controller.py
   @router.get("/products/{product_id}")
   def get_product_by_id(id: float, ...):  # ← debe ser product_id
   ```

2. **Dos sesiones mezcladas** — Cada controller crea su propio `session = Session()` global, Y también recibe `db` vía `Depends(connect)`. GET all y POST usan `session`; GET/PUT/DELETE by id usan `db`. Mezclar sesiones puede dar datos desactualizados o conflictos de transacción.

3. **`__tablename__ = "product-order"`** — guión en el nombre de tabla.

4. **`reservation_model.py`** — modelo sin campos útiles (solo `id`), sin controlador, sin registrar en `main.py`. Es un placeholder vacío.

5. **Imports muertos en todos los controllers** — `psycopg2`, `create_engine` (duplicado), `sessionmaker` (duplicado), `select`, `os` — no se usan.

---

## Frontend — minibar-front

**Stack:** Next.js 15, TypeScript, Tailwind CSS, ShadCN (tema Nova, base Radix)

**Correr:**
```bash
cd minibar-front
npm run dev
# http://localhost:3000
```

**Librerías instaladas:**
- `zustand` — estado global
- `axios` — peticiones HTTP al backend
- `react-hook-form` — manejo de formularios
- `zod` + `@hookform/resolvers` — validación de esquemas
- `shadcn/ui` — componentes UI (Button, Input, Table)

**Archivos clave:**
- `lib/api.ts` — instancia de Axios apuntando a `http://localhost:8000/api`
- `store/useProductStore.ts` — Zustand store con fetch, add y delete de productos
- `app/products/page.tsx` — página de productos con formulario y tabla

**Estado actual:** El store **ya está conectado al backend real** vía Axios. `NEXT_PUBLIC_API_URL` configura la URL base (ej. Vercel URL del backend).

**Archivos adicionales:**
- `app/orders/page.tsx` — plantilla de órdenes (fetch + tabla + formulario básico)
- `store/useOrderStore.ts` — Zustand store con fetch, add y delete de órdenes
- `app/products/page.module.css` — estilos extraídos a CSS module (estética hotel boutique)

**Bug activo en el frontend:**
- `deleteProduct` en `useProductStore.ts` usa URL literal errónea: `/products/delete/{product_id}?id=${id}` → debe ser `/products/delete/${id}` (y depende de que el backend corrija el path param bug)
- `addOrder` en `useOrderStore.ts` envía arrays vacíos (`products_id: [], amounts: []`) — es placeholder, no funcional aún

---

## Historial de sesiones

### Sesión 1
- Análisis completo del backend: bugs identificados en controllers, models y database
- Explicación de Zod, React Hook Form, Zustand, Axios y ShadCN
- Creación del proyecto Next.js con ShadCN (tema Nova)
- Implementación de página de productos con mock data usando todo el stack
- Integración del frontend al repositorio compartido con QuinteroEP
- Configuración de identidad git: ElAreaAl2 / juandiegoariasd@hotmail.com

### Sesión 2 (QuinteroEP)
- Migración completa a SQLAlchemy ORM (abandono de psycopg2 raw)
- Implementación de `order_controller.py` con lógica de costo total y ProductOrders
- Creación de `room_controller.py` con CRUD completo
- Eliminación de `category_controller.py` y `customer_controller.py`
- Nuevos modelos: `reservation_model.py` (placeholder), relación cascade en `Bar_Order`
- Configuración de DB por variables de entorno (preparado para deploy)
- Agregado `vercel.json` para deploy del backend

### Sesión 3 (QuinteroEP — v1 a v1.1.1, 20 abril 2026)
- **v1**: Base de datos finalizada, CRUDs terminados en todos los controllers
- **v1.0.1–v1.0.4**: Iteraciones de configuración `vercel.json` y reorganización de archivos para Vercel (`MiniBar/api/index.py`)
- **v1.1**: Creación de `app.py` como entry point FastAPI para Vercel; limpieza de `api/index.py` y `db/database.py`
- **v1.1.1**: CORS configurado en `app.py` con `allow_origins=["*"]` — desbloqueó peticiones desde el frontend

### Sesión 4 (ElAreaAl2 — 7ff58c3, 20 abril 2026)
- Conexión real del frontend al backend: `useProductStore.ts` reemplaza mock data por llamadas Axios
- `lib/api.ts`: URL base por variable de entorno `NEXT_PUBLIC_API_URL`
- Rediseño de `products/page.tsx` con estética hotel boutique y estilos extraídos a `page.module.css`
- Plantilla de órdenes: `app/orders/page.tsx` + `store/useOrderStore.ts`

### Sesión 5 (ElAreaAl2 — interfaz cliente)
- `app/page.tsx`: interfaz del cliente — menú de productos con carrito y envío de pedido
- `app/page.module.css`: estética hotel boutique (fondo crema `#F5F0E8`, header espresso, oro `#B8996A`, Cormorant Garamond serif)
- `store/useCartStore.ts`: Zustand store para el carrito (add, increment, decrement, submitOrder)
- `app/confirmation/page.tsx` + `page.module.css`: pantalla de confirmación con animación SVG del checkmark
- El QR debe apuntar a `/menu?room=<número>` — el room_id se lee via `useSearchParams()`
- `app/page.tsx` es ahora la landing de bienvenida (muestra productos destacados y pide número de habitación)
- `app/menu/page.tsx` es el menú de pedidos (antes estaba en `app/page.tsx`)
- `submitOrder` en useCartStore serializa arrays con `URLSearchParams` para compatibilidad con FastAPI

---

## Pendientes

### Backend
- [ ] Corregir bug de path params en los 3 controllers (renombrar `id` → `product_id`, `order_id`, `room_id`)
- [ ] Unificar las dos sesiones — eliminar `session` global y usar solo `db` de `Depends`
- [ ] Completar `reservation_model.py` (agregar campos) y crear su controller
- [ ] Cambiar POST endpoints para recibir body Pydantic en vez de query params

### Frontend
- [ ] Corregir URL en `deleteProduct` (`useProductStore.ts`): `/products/delete/{product_id}?id=${id}` → `/products/delete/${id}`
- [ ] Implementar `addOrder` real en `useOrderStore.ts` (actualmente envía arrays vacíos)
- [ ] Implementar página del encargado del minibar (`/orders`) — ver pedidos + botón despachar
- [ ] Implementar store y página para habitaciones (`/rooms`)

### Resuelto
- [x] Interfaz cliente completa: menú → carrito → confirmación (Sesión 5)
- [x] Mock data reemplazado por llamadas reales al backend (Sesión 4)
- [x] CORS configurado en el backend (QuinteroEP v1.1.1)
- [x] Backend deployado en Vercel (QuinteroEP v1.1)
- [x] URL base configurable por variable de entorno `NEXT_PUBLIC_API_URL`
