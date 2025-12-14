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
# Increase Node.js heap size for build to prevent out of memory errors
ENV NODE_OPTIONS=--max-old-space-size=4096
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
COPY --from=builder /app/src ./src
COPY --from=builder /app/config ./config
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/favicon.png ./

# Copy admin build to where Strapi expects it in production
RUN mkdir -p /app/node_modules/@strapi/admin/dist/server/server/build && \
    cp -r /app/dist/build/* /app/node_modules/@strapi/admin/dist/server/server/build/

EXPOSE 1337

CMD ["npm", "run", "start"]
