# Proyecto Control de Inventarios

Sistema web de control de inventarios desarrollado como proyecto full stack con React, Express y PostgreSQL. La aplicacion permite administrar productos, registrar movimientos de stock, procesar ventas y visualizar metricas operativas en un dashboard.

## Objetivo del proyecto

Este proyecto fue construido para resolver un flujo comun en pequenos negocios o almacenes:

- centralizar el catalogo de productos
- controlar stock minimo y stock actual
- registrar entradas, salidas y ajustes de inventario
- generar ventas descontando stock automaticamente
- ofrecer un dashboard con indicadores utiles para la toma de decisiones

## Stack tecnologico

### Frontend

- React 18
- Vite
- React Router DOM
- CSS puro

### Backend

- Node.js
- Express
- JWT para autenticacion
- bcryptjs para manejo de contrasenas
- PostgreSQL con `pg`

### Base de datos

- PostgreSQL 15+
- Script inicial en `database/schema.sql`
- Migracion adicional para ventas en `database/migrations/001_add_sales.sql`

## Funcionalidades principales

- Inicio de sesion con autenticacion basada en JWT
- Control de acceso por roles: `admin`, `almacen`, `ventas`
- Registro de usuarios por parte de un administrador
- CRUD base de categorias
- Registro y consulta de productos
- Alertas de stock bajo
- Registro de movimientos de inventario: entrada, salida y ajuste
- Registro de ventas con multiples productos
- Descuento automatico de stock al vender
- Historial reciente de movimientos
- Dashboard con metricas e indicadores de inventario

## Arquitectura del proyecto

```text
Proyecto-React/
|- backend/
|  |- src/
|  |  |- controllers/
|  |  |- middleware/
|  |  |- routes/
|  |  |- utils/
|  |  |- app.js
|  |  |- config.js
|  |  |- db.js
|  |  `- server.js
|  |- .env.example
|  `- package.json
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- pages/
|  |  |- App.jsx
|  |  |- api.js
|  |  `- main.jsx
|  `- package.json
|- database/
|  |- migrations/
|  `- schema.sql
|- .gitignore
`- README.md
```

## Modulos destacados

### Dashboard

Resume el estado general del inventario mostrando:

- total de productos
- productos con stock bajo
- productos agotados
- movimientos del dia
- valor estimado del inventario
- distribucion por categoria
- tendencia de entradas y salidas

### Inventario

Permite consultar productos, detectar stock critico y registrar movimientos manuales de entrada, salida o ajuste.

### Ventas

Permite registrar ventas con multiples items. Cada venta:

- valida existencia de stock
- calcula subtotales y total
- genera un numero de venta
- descuenta stock automaticamente
- registra el movimiento de salida asociado

## Endpoints principales

Algunos endpoints expuestos por la API:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/dashboard`
- `GET /api/products`
- `GET /api/products/low-stock`
- `POST /api/products`
- `GET /api/movements`
- `POST /api/movements`
- `GET /api/sales`
- `POST /api/sales`

## Requisitos

- Node.js 20 o superior
- PostgreSQL 15 o superior
- npm

## Instalacion y ejecucion local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tato312-ux/Proyecto-Control-inventarios.git
cd Proyecto-Control-inventarios
```

### 2. Configurar la base de datos

Crear una base de datos en PostgreSQL y ejecutar:

```bash
database/schema.sql
```

Si quieres habilitar el modulo de ventas sobre una base ya existente, ejecutar tambien:

```bash
database/migrations/001_add_sales.sql
```

### 3. Configurar variables de entorno

Crear el archivo `backend/.env` a partir de `backend/.env.example`.

Ejemplo:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventario_db
JWT_SECRET=cambia-esto-por-un-secreto-seguro
```

### 4. Instalar dependencias

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 5. Ejecutar backend

```bash
cd backend
npm run dev
```

### 6. Ejecutar frontend

```bash
cd frontend
npm run dev
```

Frontend por defecto:

```text
http://localhost:5173
```

Backend por defecto:

```text
http://localhost:4000
```

## Credenciales iniciales

Usuario disponible despues de cargar el esquema:

- Email: `admin@inventario.local`
- Password: `Admin123*`

Se recomienda cambiar la clave en un entorno real.

## Aspectos tecnicos que vale la pena destacar

- Uso de transacciones SQL para movimientos y ventas
- Validaciones de negocio en backend para evitar stock negativo
- Separacion clara entre rutas, controladores, middleware y utilidades
- Estructura modular full stack
- Control de acceso por roles
- Manejo de errores basico en API

## Posibles mejoras futuras

- editar y eliminar productos
- filtros avanzados y paginacion
- reportes exportables
- pruebas automatizadas
- despliegue en la nube
- contenedorizacion con Docker

## Autor

Desarrollado por **tato312-ux** como proyecto de practica y portafolio.

Si quieres revisar el codigo o proponer mejoras, puedes abrir un issue o clonar el repositorio.
