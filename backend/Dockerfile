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
# Strapi build output is usually in dist per v4/v5 changes or build
# Checking recent strapi versions, assumes 'dist' or 'build'
# For v4/v5 it might default to different, but 'npm run build' standard creates 'dist' in v5?
# Let's assume standard structure or copy everything needed.
# Strapi start command uses built files.

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/favicon.png ./

# Create app directory permission
RUN addgroup --system --gid 1001 strapi
RUN adduser --system --uid 1001 strapi
RUN chown -R strapi:strapi /app

USER strapi

EXPOSE 1337

CMD ["npm", "run", "start"]
