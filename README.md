ERP MVP — Sistema de Gestión Empresarial

ERP moderno diseñado para pequeñas empresas que permite gestionar clientes, productos, inventario y ventas desde un panel centralizado.

Este proyecto está construido con una arquitectura escalable y tecnologías modernas, pensado como base para un ERP real.

🚀 Características actuales
✅ Autenticación

Sistema de login seguro

Rutas protegidas

Preparado para proveedores externos (Google, etc.)

✅ Clientes

Crear, editar y eliminar clientes

Búsqueda por nombre y email

Validación de datos

✅ Productos

Gestión completa de productos

SKU único

Precio y coste

✅ Inventario

Movimientos de stock (IN, OUT, ADJUSTMENT)

Cálculo automático del stock actual

Ajuste manual de inventario

✅ Ventas (Sales Orders)

Creación de pedidos con múltiples líneas

Cálculo automático de totales e impuestos

Confirmación de pedidos

Descompte automático de stock

Prevención de ventas sin stock

🧱 Stack Tecnológico

Frontend & Backend

Next.js (App Router)

TypeScript

UI

Tailwind CSS

Base de datos

PostgreSQL

ORM

Prisma

Autenticación

Auth.js (NextAuth)

Infraestructura

Docker Compose

📦 Instalación y ejecución local
1️⃣ Clonar repositorio
git clone https://github.com/TU_USUARIO/erp-mvp.git
cd erp-mvp
2️⃣ Instalar dependencias
npm install
3️⃣ Configurar variables de entorno

Copiar el archivo de ejemplo:

cp .env.example .env

Editar si es necesario.

4️⃣ Levantar base de datos
docker compose up -d
5️⃣ Ejecutar migraciones
npx prisma migrate dev
6️⃣ (Opcional) cargar datos demo
npx prisma db seed
7️⃣ Iniciar el servidor
npm run dev

Abrir en el navegador:

http://localhost:3000
🔑 Credenciales de prueba

(si usas seed)

email: admin@example.com
password: admin123
📁 Estructura del proyecto
app/                → rutas y páginas
components/         → componentes UI
lib/                → utilidades, auth y db
modules/            → lógica modular del ERP
prisma/             → esquema y seeds
types/              → tipos globales
🧠 Flujo de inventario

El stock no se edita manualmente.

Se calcula mediante movimientos:

IN → entrada de stock

OUT → salida por ventas

ADJUSTMENT → ajuste manual

Stock actual = IN − OUT ± ADJUSTMENTS

🛣 Roadmap

Próximas funcionalidades:

Facturación PDF

Compras y proveedores

Panel financiero

Multiempresa (multi-tenant)

Roles y permisos avanzados

Dashboard analítico

API pública

Deploy cloud
