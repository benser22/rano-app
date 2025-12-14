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

# Aseguramos modo producción
ENV NODE_ENV=production

# Copiamos solo lo que el runtime necesita
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/favicon.png ./

EXPOSE 1337

# Usar el script "start" del package.json; asegúrate que arranque desde dist
CMD ["npm", "run", "start"]
