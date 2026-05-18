# Ilar QR MiniBar

Sistema de gestión de minibar para el Hotel Ilar. Los huéspedes escanean un código QR en su habitación, acceden al menú desde el navegador, seleccionan productos y envían su pedido. El personal del hotel ve los pedidos en tiempo real en un panel administrativo y los marca como despachados.

---

## Tabla de contenidos

1. [Descripción general](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Flujo de uso](#flujo-de-uso)
4. [Stack tecnológico](#stack-tecnológico)
5. [Estructura del repositorio](#estructura-del-repositorio)
6. [Backend — MiniBar](#backend--minibar)
   - [Requisitos](#requisitos-backend)
   - [Variables de entorno](#variables-de-entorno)
   - [Instalación y ejecución local](#instalación-y-ejecución-local)
   - [Base de datos y modelos](#base-de-datos-y-modelos)
   - [Endpoints de la API](#endpoints-de-la-api)
   - [Formato de respuesta](#formato-de-respuesta)
   - [WebSocket](#websocket)
   - [Deploy en Fly.io](#deploy-en-flyio--backend)
7. [Frontend — minibar-front](#frontend--minibar-front)
   - [Requisitos](#requisitos-frontend)
   - [Variables de entorno](#variables-de-entorno-frontend)
   - [Instalación y ejecución local](#instalación-y-ejecución-local-frontend)
   - [Páginas y rutas](#páginas-y-rutas)
   - [Stores de estado (Zustand)](#stores-de-estado-zustand)
   - [Proxy interno de Next.js](#proxy-interno-de-nextjs)
   - [Deploy en Fly.io](#deploy-en-flyio--frontend)
8. [Bugs conocidos](#bugs-conocidos)
9. [Funcionalidades pendientes](#funcionalidades-pendientes)
10. [Créditos](#créditos)

---

## Descripción general

El sistema tiene dos roles:

| Rol | Acceso | Descripción |
|-----|--------|-------------|
| **Huésped** | QR en la habitación → `/` o `/menu?room=<N>` | Ve el menú, agrega productos al carrito y envía su pedido |
| **Encargado del minibar** | `/orders` | Ve todos los pedidos pendientes con detalle de productos y los marca como despachados |
| **Administrador** | `/products` | Gestiona el catálogo de productos (agregar, ver inventario, eliminar) |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                  minibar-front (Next.js)             │
│                                                     │
│  /           → Landing + modal de habitación        │
│  /menu?room= → Menú del huésped + carrito           │
│  /confirmation → Confirmación de pedido             │
│  /orders     → Panel del encargado (polling 15s)    │
│  /products   → Gestión de inventario                │
│                                                     │
│  app/api/[...path]/route.ts  ← proxy HTTP interno   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (todas las peticiones pasan
                       │ por el proxy de Next.js)
┌──────────────────────▼──────────────────────────────┐
│                  MiniBar (FastAPI)                   │
│                                                     │
│  /api/products   → CRUD de productos                │
│  /api/orders     → CRUD de pedidos                  │
│  /api/rooms      → CRUD de habitaciones             │
│  /ws             → WebSocket (broadcast de pedidos) │
└──────────────────────┬──────────────────────────────┘
                       │ SQLAlchemy ORM
┌──────────────────────▼──────────────────────────────┐
│              PostgreSQL                             │
│  product · room · bar_order · product-order         │
└─────────────────────────────────────────────────────┘
```

El frontend **no llama al backend directamente**. Todas las peticiones van a `/api/<ruta>`, que es interceptada por el proxy `app/api/[...path]/route.ts` de Next.js y reenviada al backend real (configurado con `NEXT_PUBLIC_API_URL`). Esto evita problemas de CORS en producción y centraliza la URL del backend en una sola variable de entorno.

---

## Flujo de uso

### Flujo del huésped

1. Escanea el QR de su habitación → abre `https://<dominio>/?room=205`
2. La app detecta el parámetro `room` y redirige automáticamente a `/menu?room=205`
3. El menú carga los productos disponibles desde el backend
4. El huésped agrega productos al carrito con `+` / `−`
5. Toca "Ver pedido" → modal de confirmación con resumen y total
6. Toca "Confirmar pedido" → el store verifica que la habitación existe, luego envía cada ítem del carrito como `POST /api/orders`
7. Se redirige a `/confirmation` con animación de éxito

### Flujo del encargado

1. Abre `/orders` en su dispositivo
2. Ve tarjetas de pedidos pendientes con: número de habitación, lista de productos, cantidades, precios y total
3. La página se refresca automáticamente cada 15 segundos (polling)
4. Toca "Despachar" → elimina el pedido del backend (`DELETE /api/orders/?id=<N>`) y de la vista

---

## Stack tecnológico

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Python | 3.x | Lenguaje base |
| FastAPI | latest | Framework web y API REST |
| Uvicorn | latest | Servidor ASGI |
| SQLAlchemy | latest | ORM para PostgreSQL |
| PostgreSQL | latest | Base de datos relacional |
| Pydantic | latest | Validación de esquemas |
| python-dotenv | latest | Variables de entorno |
| psycopg2-binary | latest | Driver PostgreSQL |
| websockets | latest | Soporte WebSocket |

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Next.js | 16.2.3 | Framework React con SSR/SSG |
| React | 19.2.4 | Librería UI |
| TypeScript | ^5 | Tipado estático |
| Tailwind CSS | ^4 | Estilos utilitarios |
| shadcn/ui | ^4.2.0 | Componentes UI (Radix UI base) |
| Zustand | ^5.0.12 | Estado global |
| Axios | ^1.15.0 | Cliente HTTP |
| React Hook Form | ^7.72.1 | Manejo de formularios |
| Zod | ^4.3.6 | Validación de esquemas en cliente |
| Lucide React | ^1.8.0 | Iconos |

---

## Estructura del repositorio

```
Ilar-QRMiniBar/
│
├── MiniBar/                        ← Backend (FastAPI)
│   ├── app.py                      ← Entry point FastAPI: routers, CORS, startup, WebSocket
│   ├── main.py                     ← Arranca uvicorn en localhost:8000
│   ├── requirements.txt
│   ├── fly.toml                    ← Config deploy Fly.io (app: minibar-backend)
│   │
│   ├── api/
│   │   └── index.py                ← Handler para Vercel (legacy, no se usa en Fly.io)
│   │
│   ├── controllers/
│   │   ├── product_controller.py   ← CRUD /api/products
│   │   ├── order_controller.py     ← CRUD /api/orders + lógica de costos
│   │   └── room_controller.py      ← CRUD /api/rooms
│   │
│   ├── models/
│   │   ├── all_models.py           ← Importa todos los modelos (necesario para ORM.py)
│   │   ├── ORM.py                  ← Crea todas las tablas con Base.metadata.create_all()
│   │   ├── product_model.py        ← Tabla: product
│   │   ├── room_model.py           ← Tabla: room
│   │   ├── bar_order_model.py      ← Tabla: bar_order (relación cascade a product-order)
│   │   ├── product_order_model.py  ← Tabla: product-order
│   │   └── reservation_model.py    ← Placeholder sin campos útiles (pendiente)
│   │
│   ├── schemas/
│   │   ├── product_schema.py       ← ProductSchema: name, price, inventory
│   │   ├── product_update_schema.py← ProductUpdateSchema: campos opcionales
│   │   ├── product_order_schema.py ← ProductOrderSchema: roomId, productId, quantity
│   │   ├── product_order_update_schema.py
│   │   └── room_schema.py          ← RoomSchema: number
│   │
│   ├── db/
│   │   └── database.py             ← Conexión SQLAlchemy via DATABASE_URL
│   │
│   └── utils/
│       ├── response_wrapper.py     ← api_response(): envuelve todas las respuestas
│       ├── serializer.py           ← Serializa modelos para broadcast WebSocket
│       └── websocket_manager.py    ← ConnectionManager: connect/disconnect/broadcast
│
├── minibar-front/                  ← Frontend (Next.js)
│   ├── app/
│   │   ├── layout.tsx              ← Layout raíz
│   │   ├── page.tsx                ← Landing: bienvenida + productos destacados + modal de habitación
│   │   ├── page.module.css
│   │   ├── menu/
│   │   │   ├── page.tsx            ← Menú del huésped: lista de productos + carrito
│   │   │   └── page.module.css
│   │   ├── confirmation/
│   │   │   ├── page.tsx            ← Pantalla de éxito con animación SVG
│   │   │   └── page.module.css
│   │   ├── orders/
│   │   │   ├── page.tsx            ← Panel del encargado: pedidos pendientes + despachar
│   │   │   └── page.module.css
│   │   ├── products/
│   │   │   ├── page.tsx            ← Gestión de inventario: tabla + formulario
│   │   │   └── page.module.css
│   │   └── api/
│   │       └── [...path]/
│   │           └── route.ts        ← Proxy: reenvía /api/* al backend real
│   │
│   ├── store/
│   │   ├── useProductStore.ts      ← Estado de productos: fetch, add, delete
│   │   ├── useOrderStore.ts        ← Estado de pedidos: fetch, dispatch
│   │   └── useCartStore.ts         ← Estado del carrito: add, increment, decrement, submitOrder
│   │
│   ├── lib/
│   │   └── api.ts                  ← Instancia Axios con baseURL: "/api"
│   │
│   ├── components/ui/              ← Componentes shadcn/ui (Table, Button, Input, etc.)
│   ├── fly.toml                    ← Config deploy Fly.io (app: minibar-frontend)
│   ├── next.config.ts              ← output: standalone (requerido para Docker/Fly.io)
│   └── package.json
│
├── config.py                       ← Config Python (nivel raíz, actualmente sin uso activo)
└── README.md
```

---

## Backend — MiniBar

### Requisitos backend

- Python 3.10+
- PostgreSQL corriendo (local o remoto)
- pip

### Variables de entorno

El backend construye la URL de conexión a partir de variables individuales. Crear un archivo `.env` dentro de `MiniBar/`:

```env
DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/ilar
```

O bien, si se prefiere construirla desde partes separadas (ver `config.py` en la raíz del repo):

```env
DB_USER=postgres
ILAR_PASS=tu_contraseña
DB_ADDR=localhost
DB_PORT=5432
DB_NAME=ilar
```

> **Nota:** `db/database.py` lee directamente `DATABASE_URL`. Si se usan las variables separadas hay que concatenarlas antes o ajustar el archivo.

### Instalación y ejecución local

```bash
cd MiniBar

# 1. Crear y activar entorno virtual
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar .env con DATABASE_URL (ver sección anterior)

# 4. Ejecutar
uvicorn app:app --reload --port 8000
```

La API queda disponible en `http://localhost:8000`.  
La documentación interactiva (Swagger) en `http://localhost:8000/docs`.

> **Las tablas se crean automáticamente** al iniciar. `app.py` llama `ORM.orm()` en el evento `startup`, que ejecuta `Base.metadata.create_all(engine)`. No hace falta correr migraciones manualmente.

### Base de datos y modelos

```
product
├── id          INTEGER PK
├── name        TEXT
├── inventory   INTEGER
└── price       FLOAT

room
├── id          INTEGER PK
└── number      INTEGER

bar_order
├── id          INTEGER PK
├── room_id     INTEGER FK → room.id
├── cost        FLOAT          ← costo total acumulado del pedido
└── productOrders              ← relación cascade a product-order

product-order                  ← nota: nombre de tabla con guión
├── id              INTEGER PK
├── id_product      FLOAT      ← referencia al product (sin FK formal)
├── product_name    TEXT       ← snapshot del nombre al momento del pedido
├── product_price   FLOAT      ← snapshot del precio al momento del pedido
├── product_quantity INTEGER
└── id_order        INTEGER FK → bar_order.id

reservation                    ← placeholder vacío, pendiente de implementar
└── id              INTEGER PK
```

**Relaciones importantes:**
- Un `BarOrder` pertenece a un `Room` y tiene muchos `ProductOrder` con `cascade="all, delete-orphan"`. Si se elimina un `BarOrder`, se eliminan todos sus `ProductOrder` automáticamente.
- `product-order` guarda un snapshot del nombre y precio del producto al momento de hacer el pedido. Esto preserva el historial aunque el producto cambie de precio después.

### Endpoints de la API

Todos los endpoints tienen el prefijo `/api`.

#### Productos — `/api/products`

| Método | Ruta | Descripción | Body / Params |
|--------|------|-------------|---------------|
| GET | `/products` | Lista todos los productos | — |
| GET | `/products/` | Obtiene producto por ID | Query param: `id=<float>` |
| POST | `/products` | Crea un producto | JSON body: `ProductSchema` |
| PUT | `/products/` | Actualiza un producto | Query param: `id=<float>` + JSON body: `ProductUpdateSchema` |
| DELETE | `/products/` | Elimina un producto | Query param: `id=<float>` |

**ProductSchema** (POST body):
```json
{
  "name": "Coca Cola",
  "price": 4500,
  "inventory": 10
}
```

**ProductUpdateSchema** (PUT body, todos los campos opcionales):
```json
{
  "name": "Coca Cola Zero",
  "price": 5000,
  "inventory": 8
}
```

#### Pedidos — `/api/orders`

| Método | Ruta | Descripción | Body / Params |
|--------|------|-------------|---------------|
| GET | `/orders` | Lista todos los pedidos (con sus `productOrders`) | Query param opcional: `id=<float>` filtra por room_id |
| GET | `/orders/` | Obtiene pedido por ID | Query param: `id=<float>` |
| POST | `/orders` | Crea o actualiza un pedido | JSON body: array de `ProductOrderSchema` |
| PUT | `/orders/` | Modifica un ítem dentro de un pedido | Query param: `id=<float>` + JSON body: `ProductOrderUpdateSchema` |
| DELETE | `/orders/` | Elimina un pedido completo (cascade a sus ítems) | Query param: `id=<float>` |

**ProductOrderSchema** (POST body — array):
```json
[
  {
    "roomId": 1,
    "productId": 3,
    "quantity": 2
  },
  {
    "roomId": 1,
    "productId": 7,
    "quantity": 1
  }
]
```

**Lógica del POST `/orders`:**
1. Por cada ítem del array, busca si ya existe un `BarOrder` para esa habitación.
2. Si no existe, crea uno nuevo con `cost = 0`.
3. Verifica que haya suficiente inventario del producto.
4. Crea un `ProductOrder` con snapshot de nombre, precio y cantidad.
5. Acumula el costo total en `BarOrder.cost`.
6. Descuenta del inventario del producto.
7. Hace broadcast por WebSocket a todos los clientes conectados.

**ProductOrderUpdateSchema** (PUT body):
```json
{
  "productId": 3,
  "quantity": 4
}
```

#### Habitaciones — `/api/rooms`

| Método | Ruta | Descripción | Body / Params |
|--------|------|-------------|---------------|
| GET | `/rooms` | Lista todas las habitaciones | — |
| GET | `/rooms/` | Obtiene habitación por ID | Query param: `id=<float>` |
| POST | `/rooms` | Crea una habitación | JSON body: `RoomSchema` |
| PUT | `/rooms/` | Actualiza número de habitación | Query param: `id=<float>` + JSON body: `RoomSchema` |
| DELETE | `/rooms/` | Elimina una habitación | Query param: `id=<float>` |

**RoomSchema** (POST/PUT body):
```json
{
  "number": 205
}
```

### Formato de respuesta

Todos los endpoints devuelven la misma estructura:

```json
{
  "data": { ... },
  "message": "Descripción de la operación",
  "error": null
}
```

En caso de error:
```json
{
  "data": null,
  "message": "Descripción del error",
  "error": 404
}
```

### WebSocket

El backend expone un WebSocket en `ws://localhost:8000/ws`.

Cuando se crea un nuevo pedido (`POST /orders`), el backend hace broadcast a todos los clientes conectados con el siguiente payload JSON:

```json
{
  "type": "new_order",
  "item_order": {
    "id": 1,
    "id_product": 3,
    "product_name": "Coca Cola",
    "product_price": 4500,
    "product_quantity": 2,
    "id_order": 5
  },
  "bar_order": {
    "id": 5,
    "room_id": 1,
    "cost": 9000
  }
}
```

> **Pendiente:** El frontend aún no consume el WebSocket. La página `/orders` usa polling cada 15 segundos como alternativa. Integrar el WebSocket eliminaría la latencia del polling.

### Deploy en Fly.io — Backend

Configuración en `MiniBar/fly.toml`:

```toml
app = 'minibar-backend'
primary_region = 'dfw'   # Dallas — cambiar a región más cercana si es necesario

[env]
  PORT = '8000'

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 1
```

Pasos para deploy:

```bash
cd MiniBar

# Instalar Fly CLI si no está instalado:
# https://fly.io/docs/hands-on/install-flyctl/

fly auth login
fly launch          # solo la primera vez
fly deploy          # deploys subsiguientes

# Configurar DATABASE_URL como secret:
fly secrets set DATABASE_URL="postgresql://usuario:clave@host:5432/dbname"
```

---

## Frontend — minibar-front

### Requisitos frontend

- Node.js 18+
- npm

### Variables de entorno frontend

Crear `minibar-front/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

En producción apuntar a la URL del backend en Fly.io:

```env
NEXT_PUBLIC_API_URL=https://minibar-backend.fly.dev/api
```

> Esta variable la usa el proxy `app/api/[...path]/route.ts`. El cliente siempre llama a `/api/*` (relativo), y el proxy reenvía al backend real.

### Instalación y ejecución local frontend

```bash
cd minibar-front
npm install
npm run dev
```

La app queda en `http://localhost:3000`.

### Páginas y rutas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.tsx` | Landing del huésped. Muestra hasta 4 productos destacados y un botón para hacer un pedido. Si la URL incluye `?room=<N>`, redirige automáticamente a `/menu?room=<N>`. |
| `/menu?room=<N>` | `app/menu/page.tsx` | Menú completo. El huésped agrega/quita productos del carrito, ve el total y confirma el pedido. El parámetro `room` es el ID de la habitación en la base de datos. |
| `/confirmation` | `app/confirmation/page.tsx` | Pantalla de confirmación con animación SVG de checkmark. Se muestra al enviar el pedido exitosamente. |
| `/orders` | `app/orders/page.tsx` | Panel del encargado. Lista todos los `BarOrder` activos con sus productos. Se refresca automáticamente cada 15 segundos. Botón "Despachar" elimina el pedido. |
| `/products` | `app/products/page.tsx` | Panel de administración. Tabla de inventario con indicador de stock (verde/amarillo/rojo) y formulario para agregar productos. |

#### Flujo del QR

El QR que se imprime en cada habitación debe apuntar a:

```
https://<dominio-del-frontend>/?room=<ID_de_habitacion_en_BD>
```

Por ejemplo: `https://minibar-frontend.fly.dev/?room=3`

El ID de habitación es el `id` del registro en la tabla `room`, **no** el número de habitación (`number`). Si se quiere usar el número legible (ej. "205"), hay que ajustar la lógica del store para buscar por `number` en vez de `id`.

### Stores de estado (Zustand)

#### `useProductStore`

Gestiona el catálogo de productos.

| Acción | Descripción |
|--------|-------------|
| `fetchProducts()` | GET `/api/products` → actualiza `products[]` |
| `addProduct(data)` | POST `/api/products` con body JSON |
| `deleteProduct(id)` | DELETE `/api/products/?id=<N>` y remueve del estado local |

#### `useCartStore`

Gestiona el carrito del huésped durante la sesión.

| Acción | Descripción |
|--------|-------------|
| `add(product)` | Agrega un producto al carrito (cantidad inicial: 1) |
| `increment(id)` | Incrementa en 1 la cantidad de ese producto |
| `decrement(id)` | Decrementa en 1; si llega a 0 lo elimina del carrito |
| `clear()` | Vacía el carrito |
| `count()` | Retorna el total de unidades en el carrito |
| `total()` | Retorna el precio total del carrito |
| `submitOrder(roomId)` | Verifica que la habitación exista, luego hace POST `/api/orders` por cada ítem, y limpia el carrito |

#### `useOrderStore`

Gestiona los pedidos visibles en el panel del encargado.

| Acción | Descripción |
|--------|-------------|
| `fetchOrders()` | GET `/api/orders` → actualiza `orders[]` |
| `dispatchOrder(id)` | DELETE `/api/orders/?id=<N>` y remueve del estado local |

### Proxy interno de Next.js

`minibar-front/app/api/[...path]/route.ts` actúa como proxy reverso. Captura cualquier petición a `/api/*` desde el cliente y la reenvía al backend real:

```
Cliente → /api/products
         ↓ proxy
         → https://minibar-backend.fly.dev/api/products
```

Esto permite:
- Cambiar la URL del backend con una sola variable de entorno.
- Evitar problemas de CORS (el cliente solo habla con el mismo origen).
- En desarrollo local, el proxy apunta a `http://localhost:8000/api`.

### Deploy en Fly.io — Frontend

Configuración en `minibar-front/fly.toml`:

```toml
app = 'minibar-frontend'
primary_region = 'dfw'

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0   # puede apagarse si no hay tráfico
```

`next.config.ts` tiene `output: 'standalone'`, requerido para el Dockerfile de Fly.io.

Pasos para deploy:

```bash
cd minibar-front
fly auth login
fly launch          # solo la primera vez
fly deploy          # deploys subsiguientes

# Configurar URL del backend:
fly secrets set NEXT_PUBLIC_API_URL="https://minibar-backend.fly.dev/api"
```

---

## Bugs conocidos

Los siguientes bugs están presentes en el código actual y deben corregirse:

### Backend

#### 1. `deleteProduct` en el frontend apunta a una URL incorrecta
En `useProductStore.ts`, la función `deleteProduct` construye la URL erróneamente:

```ts
// Bug actual:
await api.delete(`/products/delete/{product_id}?id=${id}`)

// Corrección:
await api.delete(`/products/?id=${id}`)
```

#### 2. Doble sesión SQLAlchemy en `room_controller.py`
`room_controller.py` crea una sesión global `session = Session()` y además recibe `db` por `Depends(connect)`. El endpoint `GET /rooms` usa `session` (global) mientras que el resto usan `db` (inyectada). Esto puede causar datos desactualizados o conflictos de transacción.

**Corrección:** eliminar `session = Session()` y `engine = create_engine(...)` de los controllers; usar únicamente `db: Session = Depends(connect)` en todos los endpoints.

#### 3. Importaciones no utilizadas en los controllers
Los tres controllers importan `psycopg2`, `create_engine`, `sessionmaker`, `select` y `os` que no se usan. No rompen la app pero ensucian el código.

#### 4. `__tablename__ = "product-order"` con guión
El guión en el nombre de tabla puede causar problemas en algunos motores SQL o herramientas ORM. Lo ideal es renombrarlo a `product_order`.

#### 5. `reservation_model.py` sin campos ni controlador
El modelo `Reservation` solo tiene `id`. No tiene controlador, no aparece en ninguna ruta y no tiene utilidad actual. Es un placeholder de una funcionalidad futura.

---

## Funcionalidades pendientes

### Backend
- [ ] **Unificar sesiones** en `room_controller.py` y `order_controller.py`: eliminar `session` global y usar solo `Depends(connect)`
- [ ] **Limpiar importaciones** muertas en los tres controllers
- [ ] **Renombrar tabla** `product-order` → `product_order`
- [ ] **Completar `reservation_model.py`**: agregar campos (fechas, estado, guest_name, etc.) y crear su controller y rutas

### Frontend
- [ ] **Corregir URL de `deleteProduct`** (ver Bugs conocidos #1)
- [ ] **Integrar WebSocket** en `/orders` para recibir pedidos en tiempo real en lugar de polling cada 15s
- [ ] **Página de habitaciones** (`/rooms`): crear store `useRoomStore` y página CRUD para que el administrador gestione las habitaciones
- [ ] **Historial de pedidos**: actualmente "Despachar" elimina el pedido; considerar agregar un campo `status` (`pending` / `dispatched`) para conservar el historial
- [ ] **Autenticación**: las páginas `/orders` y `/products` son públicas; cualquiera puede acceder con la URL directa

### Resuelto
- [x] Interfaz completa del huésped: landing → menú → carrito → confirmación
- [x] Conexión real frontend ↔ backend via Axios
- [x] CORS configurado en el backend (`allow_origins=["*"]`)
- [x] Proxy interno de Next.js para evitar problemas de CORS en producción
- [x] Deploy en Fly.io (backend y frontend)
- [x] Panel del encargado con polling automático y botón Despachar

---

## Créditos

- **Pablo Enrique Quintero** — Backend (FastAPI, PostgreSQL, SQLAlchemy, deploy Fly.io)
- **Juan Diego Arias** — Frontend (Next.js, Zustand, diseño de interfaz, integración)
