# Production API image (Express + Prisma + MySQL)
FROM node:20-bookworm-slim AS base
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 4000

# Migrations then start (DATABASE_URL required at runtime)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
