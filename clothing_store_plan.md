# Plan Técnico y PRD — Tienda Online de Ropa

## 1. Product Overview

Aplicación de comercio electrónico fullstack para tienda de ropa, enfocada en rendimiento, escalabilidad y mantenibilidad. Ofrece una experiencia de usuario fluida para explorar productos, gestionar carrito y completar compras mediante Mercado Pago. El panel administrativo de Strapi proporciona gestión completa de inventario, pedidos y configuraciones.

**Valor principal:** Solución completa, moderna y lista para producción que permite a tiendas de ropa gestionar su negocio online sin complejidad técnica, con arquitectura escalable y deployment automatizado.

---

## 2. Stack Tecnológico

### 2.1 Frontend
- **Framework:** Next.js 14+ (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS + shadcn/ui
- **Estado Global:** Zustand
- **Routing:** Next.js App Router con Server Components
- **Validación:** Zod
- **HTTP Client:** Fetch API / Axios
- **Deploy:** Docker (Node.js standalone)

### 2.2 Backend
- **Headless CMS:** Strapi v4
- **Lenguaje:** TypeScript (Node.js)
- **Base de Datos:** PostgreSQL 15+
- **ORM:** Built-in Strapi (basado en Knex.js)
- **Autenticación:** JWT (Strapi native)
- **Webhooks:** Mercado Pago (firmados)
- **Deploy:** Docker

### 2.3 Infraestructura
- **Containerización:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **SSL/TLS:** Let's Encrypt (Certbot)
- **Hosting:** VPS (DigitalOcean, AWS, etc.)
- **Database Backup:** Cron jobs automatizados

---

## 3. Arquitectura y Estructura del Proyecto

### 3.1 Estructura de Repositorios

```
tienda-ropa/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (shop)/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── productos/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── carrito/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── checkout/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── success/
│   │   │   │       ├── pending/
│   │   │   │       └── error/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── registro/
│   │   │   ├── cuenta/
│   │   │   │   ├── perfil/
│   │   │   │   ├── pedidos/
│   │   │   │   └── direcciones/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   └── checkout/
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   ├── utils/
│   │   │   └── validators/
│   │   ├── hooks/
│   │   ├── store/
│   │   │   ├── cartStore.ts
│   │   │   └── authStore.ts
│   │   └── types/
│   ├── public/
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── product/
│   │   │   ├── category/
│   │   │   ├── order/
│   │   │   └── webhook/
│   │   ├── extensions/
│   │   ├── middlewares/
│   │   └── plugins/
│   ├── config/
│   │   ├── database.ts
│   │   ├── server.ts
│   │   └── plugins.ts
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── tsconfig.json
│   └── package.json
│
└── nginx/
    └── nginx.conf
```

### 3.2 Arquitectura de Componentes

```
┌─────────────────────────────────────────┐
│           Nginx (Reverse Proxy)         │
│         SSL/TLS + Rate Limiting         │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼────────┐  ┌────────▼──────────┐
│   Frontend     │  │     Backend       │
│   Next.js      │  │     Strapi        │
│   Port 3000    │  │     Port 1337     │
└───────┬────────┘  └────────┬──────────┘
        │                    │
        │           ┌────────▼──────────┐
        │           │   PostgreSQL      │
        │           │   Port 5432       │
        │           └───────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│         Mercado Pago API              │
│   (Checkout + Webhooks + Payments)    │
└───────────────────────────────────────┘
```

---

## 4. Features Principales

### 4.1 Roles de Usuario

| Rol | Método de Registro | Permisos Core |
|-----|-------------------|---------------|
| **Cliente** | Email/Password o Checkout como invitado | - Explorar productos y categorías<br>- Gestionar carrito<br>- Realizar compras<br>- Ver historial de pedidos<br>- Gestionar perfil y direcciones |
| **Administrador** | Panel Strapi nativo | - CRUD productos y categorías<br>- Gestión de pedidos<br>- Control de inventario<br>- Reportes y analytics<br>- Configuración de envíos<br>- Gestión de usuarios |

### 4.2 Catálogo de Productos

**Entidad: Product**
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number; // Precio antes de descuento
  sku: string;
  stock: number;
  images: Media[];
  category: Category;
  sizes: Size[];
  colors: Color[];
  tags: string[];
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Filtros y búsqueda:**
- Por categoría
- Por rango de precio
- Por talla disponible
- Por color
- Por tags
- Búsqueda por texto (nombre, descripción)
- Ordenamiento (precio, fecha, popularidad)

### 4.3 Sistema de Carrito

**Store con Zustand:**
```typescript
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, variant: Variant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}
```

**Persistencia:**
- LocalStorage (pre-login)
- Base de datos (post-login)
- Sincronización automática

### 4.4 Proceso de Checkout

**Flujo completo:**

1. **Revisión del carrito**
   - Validación de stock en tiempo real
   - Cálculo de totales
   - Aplicación de cupones (opcional)

2. **Información de envío**
   - Dirección de entrega
   - Cálculo de costos de envío
   - Opciones de envío (estándar/express)

3. **Confirmación**
   - Resumen completo
   - Términos y condiciones

4. **Pago (Mercado Pago)**
   - Redirección a checkout de MP
   - Procesamiento del pago
   - Webhook notification
   - Confirmación y email

---

## 5. Integración Mercado Pago (Obligatoria)

### 5.1 SDK y Configuración

```typescript
// backend/src/plugins/mercadopago/index.ts
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 }
});

const preference = new Preference(client);
```

### 5.2 Flujo de Pago Detallado

```
┌─────────────┐
│   Usuario   │
│  confirma   │
│  checkout   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Backend crea orden                     │
│  status: 'pending_payment'              │
│  Genera ID único de orden               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Backend crea preferencia MP            │
│  - Items del carrito                    │
│  - Monto total                          │
│  - URLs de retorno                      │
│  - External reference (order_id)        │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend recibe init_point             │
│  Redirige a checkout de MP              │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Usuario completa pago en MP            │
│  (tarjeta, transferencia, etc)          │
└──────┬──────────────────────────────────┘
       │
       ├─────────────────┬──────────────────┐
       ▼                 ▼                  ▼
   [Success]        [Pending]          [Failure]
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────────────────────────────────────┐
│  MP envía webhook a backend                  │
│  POST /api/webhooks/mercadopago              │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Backend valida firma y procesa         │
│  - Verifica x-signature                 │
│  - Valida merchant_order_id             │
│  - Confirma monto                       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Actualiza estado de orden:             │
│  - paid                                 │
│  - rejected                             │
│  - cancelled                            │
│  - refunded                             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Envía email de confirmación            │
│  Actualiza stock                        │
│  Genera factura (opcional)              │
└─────────────────────────────────────────┘
```

### 5.3 Implementación del Webhook

```typescript
// backend/src/api/webhook/routes/mercadopago.ts
export default {
  routes: [
    {
      method: 'POST',
      path: '/webhooks/mercadopago',
      handler: 'webhook.handleMercadoPago',
      config: {
        auth: false,
        middlewares: ['plugin::webhook.verifyMPSignature']
      }
    }
  ]
};
```

```typescript
// backend/src/api/webhook/controllers/webhook.ts
import crypto from 'crypto';

export default {
  async handleMercadoPago(ctx) {
    try {
      const { type, data } = ctx.request.body;

      // Solo procesar notificaciones de payment
      if (type !== 'payment') {
        return ctx.send({ received: true });
      }

      const paymentId = data.id;
      
      // Obtener detalles del pago desde MP
      const payment = await mercadopago.payment.get(paymentId);
      
      // Buscar orden por external_reference
      const order = await strapi.entityService.findMany('api::order.order', {
        filters: { externalReference: payment.external_reference }
      });

      if (!order) {
        ctx.throw(404, 'Order not found');
      }

      // Actualizar estado según resultado
      const statusMap = {
        'approved': 'paid',
        'rejected': 'rejected',
        'cancelled': 'cancelled',
        'refunded': 'refunded'
      };

      await strapi.entityService.update('api::order.order', order.id, {
        data: {
          status: statusMap[payment.status] || 'pending',
          paymentId: payment.id,
          paymentData: payment
        }
      });

      // Enviar email de confirmación
      if (payment.status === 'approved') {
        await strapi.plugins['email'].services.email.send({
          to: order.email,
          subject: 'Confirmación de compra',
          template: 'order-confirmation',
          data: { order, payment }
        });

        // Actualizar stock
        for (const item of order.items) {
          await strapi.entityService.update('api::product.product', item.product.id, {
            data: { stock: item.product.stock - item.quantity }
          });
        }
      }

      ctx.send({ received: true });
    } catch (error) {
      strapi.log.error('MP Webhook error:', error);
      ctx.throw(500, 'Webhook processing failed');
    }
  }
};
```

### 5.4 Middleware de Verificación de Firma

```typescript
// backend/src/middlewares/verifyMPSignature.ts
export default (config, { strapi }) => {
  return async (ctx, next) => {
    const signature = ctx.request.headers['x-signature'];
    const requestId = ctx.request.headers['x-request-id'];

    if (!signature) {
      return ctx.unauthorized('Missing signature');
    }

    const parts = signature.split(',');
    const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
    const hash = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    const manifest = `id:${requestId};request-id:${requestId};ts:${ts};`;
    const hmac = crypto
      .createHmac('sha256', process.env.MP_WEBHOOK_SECRET!)
      .update(manifest)
      .digest('hex');

    if (hmac !== hash) {
      return ctx.unauthorized('Invalid signature');
    }

    await next();
  };
};
```

### 5.5 Variables de Entorno (Mercado Pago)

```bash
# backend/.env
MP_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxxx
MP_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxx
MP_WEBHOOK_SECRET=xxxxxxxxxxxxx
MP_SUCCESS_URL=https://tu-dominio.com/checkout/success
MP_FAILURE_URL=https://tu-dominio.com/checkout/error
MP_PENDING_URL=https://tu-dominio.com/checkout/pending
```

---

## 6. Docker & Deployment

### 6.1 Dockerfile — Frontend (Next.js Optimizado)

```dockerfile
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'tu-dominio.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};
```

### 6.2 Dockerfile — Backend (Strapi)

```dockerfile
FROM node:20-alpine AS deps
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache vips-dev
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.strapi ./.strapi

RUN addgroup --system --gid 1001 strapi
RUN adduser --system --uid 1001 strapi
RUN chown -R strapi:strapi /app

USER strapi

EXPOSE 1337

CMD ["npm", "start"]
```

### 6.3 docker-compose.yml (Producción)

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:15-alpine
    container_name: tienda_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DATABASE_NAME:-tienda}
      POSTGRES_USER: ${DATABASE_USERNAME:-tienda_user}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USERNAME:-tienda_user}"]
      interval: 10s
      timeout: 5s
      retries: 5

  strapi:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: tienda_strapi
    restart: unless-stopped
    env_file:
      - ./backend/.env
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "1337:1337"
    volumes:
      - strapi_uploads:/app/public/uploads
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:1337/_health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: tienda_frontend
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:1337}
    ports:
      - "3000:3000"
    depends_on:
      strapi:
        condition: service_healthy

  nginx:
    image: nginx:alpine
    container_name: tienda_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - certbot_data:/var/www/certbot
    depends_on:
      - frontend
      - strapi

volumes:
  postgres_data:
  strapi_uploads:
  certbot_data:
```

### 6.4 Configuración Nginx

```nginx
# nginx/nginx.conf
upstream frontend {
    server frontend:3000;
}

upstream backend {
    server strapi:1337;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=checkout_limit:10m rate=2r/s;

server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.tu-dominio.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Rate limiting en endpoints críticos
    location /api/orders {
        limit_req zone=checkout_limit burst=5 nodelay;
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/webhooks/mercadopago {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 7. Deployment en Servidor (DigitalOcean)

### 7.1 Preparación del Servidor (Ubuntu 22.04)

```bash
# Conectar al servidor
ssh root@TU_IP

# Crear usuario para deployment
adduser deployuser
usermod -aG sudo deployuser
su - deployuser

# Actualizar sistema
sudo apt update && sudo apt upgrade -y
```

### 7.2 Instalación de Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose
sudo apt install -y docker-compose-plugin

# Verificar instalación
docker --version
docker compose version
```

### 7.3 Configuración del Firewall

```bash
# Instalar UFW
sudo apt install -y ufw

# Permitir conexiones necesarias
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable
sudo ufw status
```

### 7.4 Clonar y Configurar Proyecto

```bash
# Crear directorio del proyecto
mkdir -p ~/apps/tienda
cd ~/apps/tienda

# Clonar repositorios (ajustar URLs)
git clone https://github.com/tu-usuario/tienda-frontend.git frontend
git clone https://github.com/tu-usuario/tienda-backend.git backend

# Crear archivo de variables de entorno
cd backend
cp .env.example .env
nano .env
```

**Variables de entorno críticas (backend/.env):**

```bash
# General
NODE_ENV=production
HOST=0.0.0.0
PORT=1337

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=tienda
DATABASE_USERNAME=tienda_user
DATABASE_PASSWORD=SECURE_PASSWORD_HERE

# JWT
APP_KEYS=KEY1,KEY2,KEY3,KEY4
API_TOKEN_SALT=RANDOM_SALT_HERE
ADMIN_JWT_SECRET=ADMIN_SECRET_HERE
TRANSFER_TOKEN_SALT=TRANSFER_SALT_HERE
JWT_SECRET=JWT_SECRET_HERE

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxxx
MP_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxx
MP_WEBHOOK_SECRET=xxxxxxxxxxxxx
MP_SUCCESS_URL=https://tu-dominio.com/checkout/success
MP_FAILURE_URL=https://tu-dominio.com/checkout/error
MP_PENDING_URL=https://tu-dominio.com/checkout/pending

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-password
SMTP_FROM=noreply@tu-dominio.com
```

**Variables de entorno frontend:**

```bash
cd ../frontend
cp .env.example .env.local
nano .env.local
```

```bash
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxx
```

### 7.5 Configurar DNS

Antes de levantar los servicios, configurar registros DNS:

```
Tipo A:    tu-dominio.com        →  IP_DEL_SERVIDOR
Tipo A:    www.tu-dominio.com    →  IP_DEL_SERVIDOR
Tipo A:    api.tu-dominio.com    →  IP_DEL_SERVIDOR
```

### 7.6 Obtener Certificados SSL

```bash
# Instalar Certbot
sudo apt install -y certbot

# Detener temporalmente cualquier servicio en puerto 80
sudo systemctl stop nginx 2>/dev/null || true

# Obtener certificados
sudo certbot certonly --standalone -d tu-dominio.com -d www.tu-dominio.com -d api.tu-dominio.com

# Los certificados estarán en:
# /etc/letsencrypt/live/tu-dominio.com/fullchain.pem
# /etc/letsencrypt/live/tu-dominio.com/privkey.pem

# Copiar a directorio del proyecto
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ~/apps/tienda/nginx/ssl/
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ~/apps/tienda/nginx/ssl/
sudo chown -R deployuser:deployuser ~/apps/tienda/nginx/ssl/
```

### 7.7 Levantar la Aplicación

```bash
cd ~/apps/tienda

# Build y levantar servicios
docker compose up -d --build

# Ver logs
docker compose logs -f

# Verificar estado
docker compose ps
```

### 7.8 Configurar Auto-renovación SSL

```bash
# Crear script de renovación
sudo nano /usr/local/bin/renew-ssl.sh
```

```bash
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem /home/deployuser/apps/tienda/nginx/ssl/
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem /home/deployuser/apps/tienda/nginx/ssl/
docker exec tienda_nginx nginx -s reload
```

```bash
# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/renew-ssl.sh

# Agregar a crontab
sudo crontab -e

# Agregar línea (renovación cada día a las 2 AM)
0 2 * * * /usr/local/bin/renew-ssl.sh
```

### 7.9 Configurar Backups Automáticos

```bash
# Crear directorio para backups
mkdir -p ~/backups

# Crear script de backup
nano ~/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/deployuser/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tienda_$TIMESTAMP.sql"

# Backup de PostgreSQL
docker exec tienda_postgres pg_dump -U tienda_user tienda > "$BACKUP_FILE"

# Comprimir backup
gzip "$BACKUP_FILE"

# Mantener solo últimos 7 días
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete

echo "Backup completado: ${BACKUP_FILE}.gz"
```

```bash
# Dar permisos de ejecución
chmod +x ~/backup-db.sh

# Agregar a crontab (backup diario a las 3 AM)
crontab -e

# Agregar línea:
0 3 * * * /home/deployuser/backup-db.sh >> /home/deployuser/backup.log 2>&1
```

### 7.10 Monitoreo y Logs

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f strapi
docker compose logs -f frontend

# Ver últimas 100 líneas
docker compose logs --tail=100

# Logs del sistema
journalctl -u docker -f
```

### 7.11 Mantenimiento y Updates

```bash
# Actualizar código
cd ~/apps/tienda
git pull origin main

# Rebuild y restart
docker compose up -d --build

# Limpiar recursos no utilizados
docker system prune -a

# Ver uso de recursos
docker stats
```

---

## 8. Seguridad en Producción

### 8.1 Checklist de Seguridad

- [x] HTTPS obligatorio en todos los endpoints
- [x] Validación de firma en webhooks de Mercado Pago
- [x] Rate limiting en endpoints críticos (`/api/orders`, `/api/auth`)
- [x] Variables sensibles en `.env` (nunca en código)
- [x] Backups automáticos de PostgreSQL
- [x] Headers de seguridad configurados en Nginx
- [x] Firewall UFW activo
- [x] Usuario no-root para deployment
- [x] SSL/TLS actualizado automáticamente
- [x] CORS configurado correctamente
- [x] Validación de input en frontend y backend
- [x] JWT con expiración corta
- [x] Sanitización de queries SQL (Strapi ORM)

### 8.2 Variables de Entorno Sensibles

**NUNCA commitear:**
```
.env
.env.local
.env.production
```

**Rotar periódicamente:**
- `JWT_SECRET`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `MP_WEBHOOK_SECRET`
- Contraseñas de base de datos

### 8.3 Monitoreo de Seguridad

```bash
# Revisar logs de Nginx para intentos de acceso
sudo tail -f /var/log/nginx/access.log | grep "POST /api"

# Revisar intentos fallidos de login
docker compose logs strapi | grep "authentication failed"

# Monitorear uso de CPU y memoria
docker stats --no-stream
```

---

## 9. Testing

### 9.1 Testing Frontend

```typescript
// frontend/src/__tests__/components/Cart.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Cart } from '@/components/cart/Cart';
import { useCartStore } from '@/store/cartStore';

describe('Cart Component', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('should render empty cart message', () => {
    render(<Cart />);
    expect(screen.getByText(/carrito vacío/i)).toBeInTheDocument();
  });

  it('should add item to cart', () => {
    const { addItem } = useCartStore.getState();
    const product = {
      id: '1',
      name: 'Remera Test',
      price: 5000,
      // ...
    };
    
    addItem(product, { size: 'M', color: 'Negro' });
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});
```

**Comandos:**
```bash
# Frontend
cd frontend
npm run test
npm run test:coverage
npm run test:e2e
```

### 9.2 Testing Backend

```typescript
// backend/tests/api/order.test.ts
import { setupStrapi, cleanupStrapi } from '../helpers/strapi';

describe('Order API', () => {
  beforeAll(async () => {
    await setupStrapi();
  });

  afterAll(async () => {
    await cleanupStrapi();
  });

  it('should create order with valid data', async () => {
    const orderData = {
      items: [{ product: 1, quantity: 2, size: 'M' }],
      shipping: { /* ... */ },
      total: 10000
    };

    const response = await request(strapi.server.httpServer)
      .post('/api/orders')
      .send(orderData)
      .expect(200);

    expect(response.body.data.status).toBe('pending_payment');
  });

  it('should reject order with invalid total', async () => {
    const orderData = {
      items: [{ product: 1, quantity: 2, size: 'M' }],
      total: -100
    };

    await request(strapi.server.httpServer)
      .post('/api/orders')
      .send(orderData)
      .expect(400);
  });
});
```

**Comandos:**
```bash
# Backend
cd backend
npm run test
npm run test:watch
```

### 9.3 Testing de Integración Mercado Pago

```bash
# Usar sandbox de Mercado Pago
MP_ACCESS_TOKEN=TEST-xxxxx
MP_PUBLIC_KEY=TEST-xxxxx

# Test cards de MP:
# Aprobada: 5031 7557 3453 0604
# Rechazada: 5031 4332 1540 6351
```

---

## 10. Performance y Optimización

### 10.1 Frontend Optimizations

**Next.js:**
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['api.tu-dominio.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
  },
};
```

**Lazy Loading de Componentes:**
```typescript
import dynamic from 'next/dynamic';

const ProductGallery = dynamic(() => import('@/components/ProductGallery'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

**Image Optimization:**
```typescript
import Image from 'next/image';

<Image
  src={product.image}
  alt={product.name}
  width={600}
  height={800}
  priority={isFeatured}
  placeholder="blur"
  blurDataURL={product.blurHash}
/>
```

### 10.2 Backend Optimizations

**Strapi Caching:**
```typescript
// config/plugins.ts
export default {
  'rest-cache': {
    enabled: true,
    config: {
      provider: {
        name: 'memory',
        options: {
          max: 32767,
          maxAge: 3600000, // 1 hora
        },
      },
      strategy: {
        enableEtagSupport: true,
        contentTypes: [
          {
            contentType: 'api::product.product',
            maxAge: 3600000,
          },
          {
            contentType: 'api::category.category',
            maxAge: 3600000,
          },
        ],
      },
    },
  },
};
```

**Database Indexing:**
```sql
-- Índices para mejorar consultas
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

### 10.3 Nginx Caching

```nginx
# Agregar a nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/products {
    proxy_cache api_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    add_header X-Cache-Status $upstream_cache_status;
    
    proxy_pass http://backend;
}
```

---

## 11. Monitoreo y Analytics

### 11.1 Health Checks

```typescript
// backend/src/api/health/routes/health.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/_health',
      handler: 'health.check',
      config: { auth: false }
    }
  ]
};

// backend/src/api/health/controllers/health.ts
export default {
  async check(ctx) {
    try {
      // Check database
      await strapi.db.connection.raw('SELECT 1');
      
      ctx.send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected'
      });
    } catch (error) {
      ctx.status = 503;
      ctx.send({
        status: 'unhealthy',
        error: error.message
      });
    }
  }
};
```

### 11.2 Logs Estructurados

```typescript
// backend/src/middlewares/logger.ts
export default (config, { strapi }) => {
  return async (ctx, next) => {
    const start = Date.now();
    
    await next();
    
    const ms = Date.now() - start;
    
    strapi.log.info({
      method: ctx.method,
      url: ctx.url,
      status: ctx.status,
      duration: `${ms}ms`,
      ip: ctx.ip,
      userAgent: ctx.headers['user-agent']
    });
  };
};
```

### 11.3 Métricas de Negocio

```typescript
// Dashboard de métricas en Strapi
interface BusinessMetrics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Product[];
  ordersPerDay: { date: string; count: number }[];
}

// backend/src/api/analytics/controllers/analytics.ts
export default {
  async getMetrics(ctx) {
    const { startDate, endDate } = ctx.query;
    
    const orders = await strapi.db.query('api::order.order').findMany({
      where: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        },
        status: 'paid'
      },
      populate: ['items', 'items.product']
    });
    
    const metrics: BusinessMetrics = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      averageOrderValue: orders.reduce((sum, o) => sum + o.total, 0) / orders.length,
      // ... más métricas
    };
    
    ctx.send(metrics);
  }
};
```

---

## 12. Roadmap y Features Futuras

### 12.1 Fase 2 (Post-MVP)

- [ ] Sistema de cupones y descuentos
- [ ] Programa de puntos/fidelización
- [ ] Wishlist de productos
- [ ] Comparador de productos
- [ ] Reseñas y ratings
- [ ] Notificaciones push
- [ ] Chat de soporte en vivo
- [ ] Integración con redes sociales

### 12.2 Fase 3 (Escalabilidad)

- [ ] App móvil (React Native)
- [ ] Panel de vendedores (marketplace)
- [ ] Sistema de afiliados
- [ ] Analytics avanzado con BI
- [ ] A/B testing
- [ ] Personalización con ML
- [ ] Multi-idioma
- [ ] Multi-moneda

### 12.3 Mejoras Técnicas

- [ ] Migrar a microservicios
- [ ] Implementar Redis para cache
- [ ] CDN para assets estáticos
- [ ] Search con Elasticsearch
- [ ] Queue system (Bull/BullMQ)
- [ ] CI/CD con GitHub Actions
- [ ] Monitoreo con Grafana/Prometheus
- [ ] Error tracking con Sentry

---

## 13. Troubleshooting Común

### 13.1 Problemas de Conexión Database

```bash
# Verificar que PostgreSQL esté corriendo
docker compose ps postgres

# Ver logs de PostgreSQL
docker compose logs postgres

# Conectar manualmente para debug
docker exec -it tienda_postgres psql -U tienda_user -d tienda

# Verificar conexiones activas
SELECT * FROM pg_stat_activity;
```

### 13.2 Webhook de Mercado Pago no Funciona

```bash
# Verificar logs del webhook
docker compose logs strapi | grep webhook

# Testear firma manualmente
curl -X POST http://localhost:1337/api/webhooks/mercadopago \
  -H "x-signature: ts=123456,v1=abcdef" \
  -H "x-request-id: test-id" \
  -d '{"type":"payment","data":{"id":"123"}}'

# Verificar URL configurada en MP
# Panel de Mercado Pago > Tu aplicación > Webhooks
```

### 13.3 Frontend no Carga Imágenes

```bash
# Verificar permisos en uploads
docker exec tienda_strapi ls -la /app/public/uploads

# Verificar configuración de CORS en Strapi
# backend/config/middlewares.ts

# Verificar Next.js image config
# frontend/next.config.js > images.domains
```

### 13.4 Error 502 Bad Gateway

```bash
# Verificar que todos los servicios estén up
docker compose ps

# Reiniciar servicios
docker compose restart

# Verificar logs de Nginx
docker compose logs nginx

# Verificar conectividad interna
docker exec tienda_nginx ping strapi
docker exec tienda_nginx ping frontend
```

---

## 14. Comandos Útiles de Referencia

### 14.1 Docker

```bash
# Ver todos los contenedores
docker ps -a

# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes
docker compose down -v

# Ver logs en tiempo real
docker compose logs -f

# Ejecutar comando en contenedor
docker exec -it tienda_strapi sh

# Ver uso de recursos
docker stats

# Limpiar sistema
docker system prune -a

# Rebuild sin cache
docker compose build --no-cache
```

### 14.2 Database

```bash
# Backup manual
docker exec tienda_postgres pg_dump -U tienda_user tienda > backup.sql

# Restaurar backup
docker exec -i tienda_postgres psql -U tienda_user tienda < backup.sql

# Conectar a PostgreSQL
docker exec -it tienda_postgres psql -U tienda_user -d tienda

# Ver tablas
\dt

# Ver esquema de tabla
\d+ products
```

### 14.3 Git (Convencional)

```bash
# Commits siguiendo conventional commits
git commit -m "feat(products): add filter by price range"
git commit -m "fix(checkout): resolve payment validation issue"
git commit -m "docs(readme): update deployment instructions"
git commit -m "refactor(cart): extract cart logic to custom hook"
git commit -m "perf(images): implement lazy loading for product gallery"
git commit -m "test(orders): add unit tests for order validation"
git commit -m "chore(deps): update dependencies to latest versions"

# Ver historial formateado
git log --oneline --graph --decorate
```

---

## 15. Documentación de API

### 15.1 Endpoints Principales

#### Productos

```http
GET /api/products
Query params:
  - page: number
  - pageSize: number
  - filters[category][slug]: string
  - filters[price][$gte]: number
  - filters[price][$lte]: number
  - sort: string (e.g., "price:asc", "createdAt:desc")
  - populate: string (e.g., "category,images")

Response 200:
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Remera Básica",
        "slug": "remera-basica",
        "price": 5000,
        "stock": 25,
        "category": {...},
        "images": {...}
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 4,
      "total": 100
    }
  }
}
```

```http
GET /api/products/:id
Response 200:
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "Remera Básica",
      "description": "...",
      "price": 5000,
      ...
    }
  }
}
```

#### Órdenes

```http
POST /api/orders
Authorization: Bearer <token>
Body:
{
  "items": [
    {
      "product": 1,
      "quantity": 2,
      "size": "M",
      "color": "Negro"
    }
  ],
  "shipping": {
    "name": "Juan Pérez",
    "address": "Calle 123",
    "city": "Buenos Aires",
    "phone": "+5491123456789"
  },
  "total": 10000
}

Response 201:
{
  "data": {
    "id": 1,
    "status": "pending_payment",
    "externalReference": "order_123abc",
    "mercadoPagoInitPoint": "https://mpago.com/checkout/..."
  }
}
```

```http
GET /api/orders/me
Authorization: Bearer <token>
Response 200:
{
  "data": [
    {
      "id": 1,
      "status": "paid",
      "total": 10000,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "items": [...]
    }
  ]
}
```

#### Autenticación

```http
POST /api/auth/local/register
Body:
{
  "username": "usuario",
  "email": "usuario@ejemplo.com",
  "password": "Password123!"
}

Response 200:
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "usuario",
    "email": "usuario@ejemplo.com"
  }
}
```

```http
POST /api/auth/local
Body:
{
  "identifier": "usuario@ejemplo.com",
  "password": "Password123!"
}

Response 200:
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

---

## 16. Checklist de Lanzamiento

### 16.1 Pre-Lanzamiento

- [ ] Testing completo en staging
- [ ] Load testing (Apache Bench, k6)
- [ ] Security audit (OWASP checklist)
- [ ] Configurar monitoreo y alertas
- [ ] Documentar procesos de deployment
- [ ] Configurar backups automáticos
- [ ] Preparar rollback plan
- [ ] Configurar SSL certificates
- [ ] Revisar todos los `.env`
- [ ] Testear webhooks de MP en producción

### 16.2 Lanzamiento

- [ ] Deploy en producción
- [ ] Verificar health checks
- [ ] Testear flujo completo de compra
- [ ] Verificar emails de confirmación
- [ ] Monitorear logs en tiempo real
- [ ] Revisar métricas de performance
- [ ] Verificar backups funcionando

### 16.3 Post-Lanzamiento

- [ ] Monitorear primeras 24h activamente
- [ ] Recopilar feedback de usuarios
- [ ] Documentar issues encontrados
- [ ] Preparar hotfixes si es necesario
- [ ] Revisar analytics y métricas
- [ ] Planificar próximas iteraciones

---

## 17. Contactos y Recursos

### 17.1 Documentación Oficial

- **Next.js:** https://nextjs.org/docs
- **Strapi:** https://docs.strapi.io
- **Mercado Pago:** https://www.mercadopago.com.ar/developers
- **Docker:** https://docs.docker.com
- **PostgreSQL:** https://www.postgresql.org/docs

### 17.2 Soporte Mercado Pago

- Panel de desarrolladores: https://www.mercadopago.com.ar/developers/panel
- Foro de la comunidad: https://www.mercadopago.com.ar/developers/es/support/forum
- Soporte técnico: developers@mercadopago.com

### 17.3 Herramientas Útiles

- **Postman Collections:** Para testing de API
- **pgAdmin:** Para gestión de PostgreSQL
- **Redis Insight:** Si se agrega Redis
- **Sentry:** Para error tracking
- **Grafana:** Para dashboards de métricas

---

## 18. Conclusión

Este plan técnico proporciona una base sólida para desarrollar y desplegar una tienda online de ropa completa, escalable y mantenible. La arquitectura propuesta utiliza tecnologías modernas y probadas, con énfasis en:

✅ **TypeScript en todo el stack** para type-safety  
✅ **Docker** para deployment reproducible  
✅ **Mercado Pago** como solución de pagos confiable  
✅ **Seguridad** con HTTPS, rate limiting y validaciones  
✅ **Monitoreo** y logs estructurados  
✅ **Backups automáticos** para data integrity  
✅ **Documentación completa** para mantenimiento  

La aplicación está lista para escalar según las necesidades del negocio, con un roadmap claro para features futuras y mejoras técnicas.

---

**Última actualización:** Diciembre 2025  
**Versión:** 2.0  
**Autor:** Plan técnico mejorado y reorganizado

---