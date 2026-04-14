# Sistema de Control de Inventarios

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-F7DF1E?style=for-the-badge&logo=jsonwebtokens&logoColor=black)

Aplicación full stack para gestionar inventario, movimientos de stock y ventas en pequeños negocios o almacenes.

Este proyecto fue desarrollado como una solución práctica para centralizar operaciones clave de inventario: registro de productos, control de existencias, movimientos manuales, ventas con descuento automático de stock y visualización de métricas en un dashboard.

## Demo del proyecto

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Login inicial: `admin@inventario.local`

Si quieres publicar este repositorio, puedes agregar en esta sección:

- capturas de pantalla del dashboard
- GIF corto del flujo de ventas
- enlace a una demo desplegada

## Resumen

- Gestión de productos con stock actual, stock mínimo, precio y unidad de medida
- Registro de movimientos de inventario: `entrada`, `salida` y `ajuste`
- Módulo de ventas con múltiples ítems y actualización automática de stock
- Dashboard con indicadores operativos y alertas de stock bajo
- Autenticación con JWT y control de acceso por roles
- Backend con reglas de negocio transaccionales en PostgreSQL

## Feature Highlights

| Módulo | Qué resuelve |
| --- | --- |
| Autenticación | Protege rutas con JWT y restringe acciones por rol |
| Productos | Permite registrar inventario con stock inicial, mínimo y precio |
| Movimientos | Controla entradas, salidas y ajustes de stock |
| Ventas | Registra ventas con múltiples ítems y descuenta stock automáticamente |
| Dashboard | Resume el estado operativo con métricas y alertas |
| Base de datos | Garantiza consistencia con transacciones y bloqueos en operaciones críticas |

## Valor del proyecto

Más que un CRUD simple, este sistema incorpora reglas reales de negocio:

- evita stock negativo
- bloquea filas en operaciones críticas con `FOR UPDATE`
- registra ventas y movimientos dentro de transacciones
- separa autenticación, autorización y lógica de inventario
- expone una API modular y un frontend desacoplado

Eso lo convierte en un proyecto sólido para mostrar habilidades de desarrollo full stack, modelado de datos y consistencia transaccional.

## Por qué destaca

- Resuelve un caso de negocio concreto y fácil de explicar en entrevista
- Combina frontend, backend y base de datos en un flujo completo
- Incluye lógica transaccional real, más allá de formularios y listados
- Es demostrable localmente en pocos minutos
- Tiene una estructura clara para crecer hacia reportes, despliegue y testing avanzado

## Stack Tecnológico

### Frontend

- React 18
- Vite
- React Router DOM
- CSS puro

### Backend

- Node.js
- Express
- JWT
- bcryptjs
- PostgreSQL con `pg`

### Base de datos

- PostgreSQL 15+
- Script base completo en `database/schema.sql`
- Migración histórica para ventas en `database/migrations/001_add_sales.sql`

## Funcionalidades principales

### Autenticación y seguridad

- inicio de sesión con JWT
- control de acceso por roles: `admin`, `almacen`, `ventas`
- registro de usuarios restringido a administradores
- cierre de sesión automático en frontend cuando el token expira o la API responde `401`

### Inventario

- registro de productos
- consulta de catálogo con stock actual
- alerta de stock bajo
- movimientos manuales de inventario
- validaciones para evitar estados inconsistentes

### Ventas

- ventas con múltiples productos
- cálculo automático de subtotales y total
- descuento automático del stock disponible
- creación del movimiento de salida asociado
- historial reciente de ventas

### Dashboard

- total de productos
- productos con stock bajo
- productos agotados
- movimientos del día
- valor estimado del inventario
- distribución por categoría
- tendencia reciente de entradas y salidas

## Aspectos técnicos destacados

- Uso de transacciones SQL para asegurar consistencia en movimientos y ventas
- Bloqueo pesimista con `SELECT ... FOR UPDATE` en operaciones críticas
- Validaciones de negocio en backend para evitar stock negativo
- Separación clara entre `controllers`, `routes`, `middleware`, `services` y `utils`
- Configuración por entorno para frontend y backend
- Pruebas automáticas básicas para reglas críticas de inventario y ventas

## Arquitectura

```text
Proyecto-React/
|- backend/
|  |- src/
|  |  |- controllers/
|  |  |- middleware/
|  |  |- routes/
|  |  |- services/
|  |  |- utils/
|  |  |- app.js
|  |  |- config.js
|  |  |- db.js
|  |  `- server.js
|  |- test/
|  |- .env.example
|  `- package.json
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- pages/
|  |  |- App.jsx
|  |  |- api.js
|  |  `- main.jsx
|  |- .env.example
|  `- package.json
|- database/
|  |- migrations/
|  `- schema.sql
|- .gitignore
`- README.md
```

## Flujo funcional

1. Un usuario autenticado inicia sesión según su rol.
2. El sistema permite registrar productos y definir su stock inicial.
3. Los movimientos de inventario modifican el stock de forma controlada.
4. Las ventas validan disponibilidad, crean la venta, registran sus ítems y descuentan stock.
5. El dashboard resume el estado operativo del inventario en tiempo real.

## Endpoints principales

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/dashboard`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/products`
- `GET /api/products/low-stock`
- `POST /api/products`
- `GET /api/movements`
- `POST /api/movements`
- `GET /api/sales`
- `POST /api/sales`

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tato312-ux/Proyecto-Control-inventarios.git
cd Proyecto-Control-inventarios
```

### 2. Crear la base de datos

Crea una base de datos en PostgreSQL, por ejemplo:

```sql
CREATE DATABASE inventario_db;
```

### 3. Cargar el esquema

Ejecuta el contenido de:

```text
database/schema.sql
```

Nota:

- Si la base es nueva, `schema.sql` es suficiente.
- `database/migrations/001_add_sales.sql` está pensado para una base antigua que no tenía el módulo de ventas.

### 4. Configurar variables de entorno

Archivo `backend/.env`

```env
PORT=4000
DATABASE_URL=postgresql://postgres:TU_PASSWORD_REAL@localhost:5432/inventario_db
JWT_SECRET=un-secreto-seguro
CORS_ORIGIN=http://localhost:5173
```

Archivo `frontend/.env`

```env
VITE_API_URL=http://localhost:4000/api
```

### 5. Instalar dependencias

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 6. Ejecutar backend

```bash
cd backend
npm run dev
```

Backend disponible en:

```text
http://localhost:4000
```

### 7. Ejecutar frontend

```bash
cd frontend
npm run dev
```

Frontend disponible en:

```text
http://localhost:5173
```

### 8. Ejecutar pruebas backend

```bash
cd backend
npm test
```

## Credenciales iniciales

Después de ejecutar `database/schema.sql`, se crea un usuario administrador inicial:

- Email: `admin@inventario.local`
- Password: `Admin123*`

Se recomienda cambiar estas credenciales en un entorno real.

## Qué demuestra este proyecto

Este repositorio refleja experiencia en:

- desarrollo full stack con React y Node.js
- diseño relacional con PostgreSQL
- validación de reglas de negocio en backend
- autenticación y autorización basada en roles
- manejo de estado de sesión en cliente
- organización modular de código y separación de responsabilidades

## Enfoque de ingeniería

Durante el desarrollo se priorizaron decisiones que suelen evaluarse positivamente en contextos de pasantía y primeras experiencias profesionales:

- claridad en la arquitectura del proyecto
- validación de reglas de negocio desde el backend
- consistencia de datos por encima de la conveniencia del cliente
- documentación suficiente para levantar el sistema sin depender del autor
- separación entre funcionalidades de inventario, autenticación y ventas

## Mejoras futuras

- edición y eliminación de productos
- filtros avanzados y paginación
- reportes exportables
- despliegue en la nube
- contenedorización con Docker
- suite de pruebas más amplia con integración end-to-end

## Autor

Desarrollado por **tato312-ux** como proyecto de práctica, aprendizaje y portafolio.

Si este proyecto te interesa para una oportunidad de pasantía o colaboración, estaré encantado de compartir mejoras, decisiones técnicas y próximos pasos de evolución.
