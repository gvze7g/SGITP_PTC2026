# Sistema de Gestión de Inventario y Tienda - Peques

## Integrantes del equipo

- Eduardo José Gálvez Benítez
- Leonel Adrián Ramos López
- Diego Alejandro López Granados
- Paul Melquisedec Cañas Palacios
- Brandon Alejandro Orellana Cerón

---

# Descripción del proyecto

Sistema desarrollado para el emprendimiento **Peques**, enfocado en la gestión integral de inventario y comercialización de productos para bebés mediante una plataforma digital.

El proyecto busca optimizar los procesos administrativos de la empresa y mejorar la experiencia de compra de los clientes a través de soluciones tecnológicas modernas, escalables y adaptables a diferentes dispositivos.

La solución está compuesta por cuatro módulos principales:

- Frontend Público (Tienda en línea)
- Frontend Administrativo
- Backend (API REST)
- Aplicación Móvil

---

# Objetivos

## Objetivo general

Desarrollar una solución digital que permita al emprendimiento **Peques** administrar eficientemente su inventario y ofrecer una experiencia de compra moderna, accesible y escalable.

## Objetivos específicos

- Gestionar productos, categorías, usuarios y pedidos.
- Facilitar el control y seguimiento del inventario.
- Mejorar la experiencia de compra de los clientes.
- Centralizar la administración de la información del negocio.
- Implementar una arquitectura escalable y mantenible.

---

# Tecnologías utilizadas

## Frontend Público

- React
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React
- Sonner
- React Hook Form
- Framer Motion

## Frontend Administrativo

- React
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React
- Sonner
- React Hook Form
- Framer Motion
- Recharts

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- Cloudinary
- Nodemailer
- Cookie Parser
- Dotenv

## Aplicación Móvil

Pendiente de definición tecnológica.

---

# Arquitectura del proyecto

```txt
SGITP_PTC2026/
│
├── SGITP_WEB/
│
├── SGITP_PRIV/
│
├── SGITP_BACKEND/
│
├── SGITP_MOBILE/
│
└── README.md
```

---

# Estructura interna de los proyectos

```txt
src/
│
├── assets/
├── components/
├── pages/
├── routes/
├── services/
├── hooks/
├── context/
├── utils/
├── layouts/
└── data/
```

---

# Funcionalidades del sistema

## Frontend Público

- Catálogo de productos
- Vista detallada de productos
- Carrito de compras
- Gestión de favoritos
- Registro de usuarios
- Inicio de sesión
- Recuperación de contraseña
- Perfil de usuario
- Historial de pedidos
- Diseño responsive

## Frontend Administrativo

- Dashboard administrativo
- Gestión de productos
- Gestión de categorías
- Gestión de usuarios
- Gestión de pedidos
- Gestión de inventario
- Estadísticas y gráficas
- Control de acceso mediante autenticación
- Diseño responsive

## Backend

- API REST
- Registro de usuarios
- Inicio de sesión
- Recuperación de contraseña
- Validaciones de datos
- Manejo de cookies JWT
- Encriptación de contraseñas
- CRUD de productos
- CRUD de categorías
- CRUD de usuarios
- CRUD de pedidos
- Integración con Cloudinary
- Envío de correos electrónicos

## Aplicación Móvil

Pendiente de implementación.

---

# Dependencias instaladas

## Frontend

```bash
npm install react
npm install react-dom
npm install react-router-dom
npm install tailwindcss
npm install @tailwindcss/vite
npm install lucide-react
npm install sonner
npm install react-hook-form
npm install framer-motion
npm install recharts
```

## Backend

```bash
npm install express
npm install mongoose
npm install dotenv
npm install bcryptjs
npm install jsonwebtoken
npm install cookie-parser
npm install cors
npm install multer
npm install cloudinary
npm install nodemailer
```

---

# Instalación del proyecto

## Clonar repositorio

```bash
git clone https://github.com/gvze7g/SGITP_PTC2026.git
```

---

# Ejecución de los módulos

## Frontend Público

```bash
cd SGITP_WEB
npm install
npm run dev
```

## Frontend Administrativo

```bash
cd SGITP_PRIV
npm install
npm run dev
```

## Backend

```bash
cd SGITP_BACKEND
npm install
npm run dev
```

## Aplicación Móvil

Pendiente de implementación.

---

# Variables de entorno

## Backend

Crear un archivo `.env` dentro del proyecto Backend.

```env
SERVER_PORT=

MONGODB_URI=

JWT_SECRET=
JWT_EXPIRES_IN=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_USER=
EMAIL_PASSWORD=
```

---

# Seguridad implementada

- Contraseñas almacenadas mediante encriptación con Bcrypt.
- Autenticación basada en JWT.
- Almacenamiento del token en cookies seguras.
- Validaciones en cliente y servidor.
- Protección de rutas privadas.
- Manejo seguro de variables de entorno.

---

# Convenciones de nomenclatura

## Carpetas principales del repositorio

UPPER_CASE

Ejemplos:

```txt
SGITP_PRIV
SGITP_WEB
SGITP_BACKEND
SGITP_MOBILE
```

## Carpetas internas

camelCase

Ejemplos:

```txt
components
pages
hooks
context
services
routes
assets
utils
layouts
```

## Componentes React

PascalCase

Ejemplos:

```txt
Navbar.jsx
ProductCard.jsx
Sidebar.jsx
LoginForm.jsx
```

## Páginas

PascalCase

Ejemplos:

```txt
HomePage.jsx
ProductsPage.jsx
LoginPage.jsx
ProfilePage.jsx
```

## Variables y funciones

camelCase

Ejemplos:

```javascript
const userData = {};

const getProducts = () => {};

const createOrder = () => {};
```

## Constantes

UPPER_CASE

Ejemplos:

```javascript
const API_URL = "";
const TOKEN_EXPIRATION = "";
```

---

# Validaciones implementadas

Las validaciones se realizan tanto en el frontend como en el backend.

Entre ellas:

- Campos obligatorios.
- Formatos de correo electrónico.
- Contraseñas seguras.
- Longitudes mínimas y máximas.
- Validación de datos numéricos.
- Validación de fechas.
- Validación de autenticación y autorización.

---

# Notificaciones al usuario

La aplicación utiliza notificaciones visuales mediante Sonner para informar:

- Operaciones exitosas.
- Errores del sistema.
- Advertencias.
- Confirmaciones de acciones.
- Eventos importantes.

---

# Estado actual del proyecto

Actualmente el proyecto se encuentra en fase de desarrollo como parte del Proyecto Técnico Científico (PTC).

Se continúa trabajando en:

- Implementación de funcionalidades pendientes.
- Integración completa entre frontend y backend.
- Desarrollo de la aplicación móvil.
- Pruebas funcionales y optimización.

---

# Repositorio

Repositorio oficial del proyecto:

```txt
https://github.com/gvze7g/SGITP_PTC2026
```
