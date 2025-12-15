# ---------- deps ----------
FROM node:20-alpine AS deps
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- builder ----------
FROM node:20-alpine AS builder
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Aumentar heap para evitar OOM en build
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

# ---------- runner (producción) ----------
FROM node:20-alpine AS runner
RUN apk add --no-cache vips-dev
WORKDIR /app

# Copiar dependencias
COPY --from=builder /app/node_modules ./node_modules


# Copiar todo el directorio dist (contiene build/, config/, src/)
COPY --from=builder /app/dist ./

# Copiar public y package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Copiar favicon a la raíz (koa-favicon lo busca ahí)
COPY --from=builder /app/public/favicon.ico ./favicon.ico

# Copiar scripts para seeding (npm run seed)
COPY --from=builder /app/scripts ./scripts

ENV NODE_ENV=production
EXPOSE 1337

# Usar el script "start" del package.json
CMD ["npm", "run", "start"]
