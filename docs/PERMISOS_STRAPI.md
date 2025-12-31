# 🔐 Configuración de Permisos en Strapi

Esta guía te ayudará a configurar correctamente los permisos para que tu tienda funcione sin problemas.

## 📍 Dónde configurar los permisos

1. Ingresa al panel de Strapi: `http://localhost:4001/admin`
2. En el menú lateral, ve a: **Settings** → **Users & Permissions Plugin** → **Roles**
3. Verás dos roles principales: **Public** y **Authenticated**

---

## 👥 Rol: **Public** (Visitantes sin cuenta)

Este es para cualquier persona que navega tu tienda sin estar logueada.

### ✅ Permisos a habilitar:

#### **Product** (Productos)

- ☑️ `find` - Ver listado de productos
- ☑️ `findOne` - Ver detalles de un producto
- ☑️ `getFilters` - Usar filtros de búsqueda (talles, colores, etc.)

#### **Category** (Categorías)

- ☑️ `find` - Ver todas las categorías
- ☑️ `findOne` - Ver detalles de una categoría

#### **Store-config** (Configuración de la tienda)

- ☑️ `find` - Leer configuración (horarios, envíos, redes sociales, etc.)

#### **Order** (Pedidos)

- ☑️ `checkout` - Crear una orden y procesar el pago (ruta custom)

#### **Contact** (Contacto)

- ☑️ `send` - Enviar formulario de contacto

#### **Webhook** (Webhooks de Mercado Pago)

- ☑️ `handleMercadoPago` - Recibir notificaciones de pagos

#### **Auth** (Autenticación Google)

- ☑️ `googleCallback` - Callback de Google OAuth

---

## 🔑 Rol: **Authenticated** (Usuarios logueados)

Este es para usuarios que ya crearon una cuenta o se loguearon con Google.

### ✅ Permisos a habilitar:

#### **Product** (Productos)

- ☑️ `find` - Ver listado de productos
- ☑️ `findOne` - Ver detalles de un producto
- ☑️ `getFilters` - Usar filtros de búsqueda

#### **Category** (Categorías)

- ☑️ `find` - Ver todas las categorías
- ☑️ `findOne` - Ver detalles de una categoría

#### **Store-config** (Configuración)

- ☑️ `find` - Leer configuración de la tienda

#### **Order** (Pedidos)

- ☑️ `checkout` - Crear una orden (ruta custom)
- ☑️ `myOrders` - Ver historial de pedidos propios (ruta custom)

#### **Contact** (Contacto)

- ☑️ `send` - Enviar formulario de contacto

#### **Users-permissions** → **User**

- ☑️ `me` - Ver datos de mi propio perfil
- ☑️ `update` - Actualizar mi propio perfil

---

## 🚫 Permisos que NO debes habilitar

**Nunca habilites estos permisos para Public o Authenticated:**

- ❌ `create`, `update`, `delete` en **Product** o **Category**
- ❌ `update`, `delete` en **Order**
- ❌ `update` en **Store-config**
- ❌ Cualquier cosa en **Admin & Settings**

Esos permisos son solo para administradores.

---

## ✅ Verificación rápida

Después de configurar, prueba lo siguiente desde el frontend:

1. **Sin loguearte:**

   - ✅ Deberías poder ver productos
   - ✅ Deberías poder ver categorías
   - ✅ Deberías poder hacer checkout (comprar)

2. **Después de loguearte:**
   - ✅ Deberías poder ver tus pedidos anteriores
   - ✅ Deberías poder editar tu perfil

---

## 🆘 Problemas comunes

**"Forbidden" al cargar productos:**

- Verifica que habilitaste `find` y `findOne` en Product para Public y Authenticated.

**"Unauthorized" al intentar comprar:**

- Verifica que habilitaste `checkout` en Order para Public (si permites compras sin cuenta) o Authenticated.

**No se muestran los pedidos históricos:**

- Verifica que habilitaste `myOrders` en Order para Authenticated.

---

**¡Listo!** Con esto tu tienda debería funcionar correctamente. 🎉
