# Sistema de Control de Inventarios

Proyecto base de control de inventarios con React en el frontend, Express en el backend y PostgreSQL como base de datos.

## Estructura

- `frontend`: aplicacion React con Vite
- `backend`: API REST con Express
- `database`: esquema SQL inicial

## Requisitos

- Node.js 20+
- PostgreSQL 15+

## Puesta en marcha

1. Crear una base de datos en PostgreSQL.
2. Ejecutar el script [`database/schema.sql`](./database/schema.sql).
3. Copiar `backend/.env.example` a `backend/.env` y completar valores.
4. Instalar dependencias:

```bash
cd backend && npm install
cd ../frontend && npm install
```

5. Levantar backend:

```bash
cd backend
npm run dev
```

6. Levantar frontend:

```bash
cd frontend
npm run dev
```

## Si ya tenias la base creada

Para agregar el modulo de ventas a una base existente, ejecuta tambien:

[`database/migrations/001_add_sales.sql`](./database/migrations/001_add_sales.sql)

## Funcionalidades incluidas

- Login con JWT
- Roles basicos (`admin`, `almacen`, `ventas`)
- CRUD de categorias
- CRUD de productos
- Registro de ventas con multiples productos
- Registro de movimientos de inventario
- Dashboard con metricas
- Alertas de stock bajo

## Usuario inicial

- Email: `admin@inventario.local`
- Password temporal: `Admin123*`

Conviene cambiar esa clave apenas ingreses al sistema.
