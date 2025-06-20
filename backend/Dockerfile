# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy only Prisma schema to generate clients
COPY prisma/postgres/schema.prisma ./prisma/postgres/schema.prisma
COPY prisma/mongodb/schema.prisma ./prisma/mongodb/schema.prisma

# Generate Prisma clients (PostgreSQL and MongoDB)
RUN npx prisma generate --schema=./prisma/postgres/schema.prisma
RUN npx prisma generate --schema=./prisma/mongodb/schema.prisma

# Copy rest of app after generating clients
COPY . .

# Stage 2: Final image
FROM node:20-alpine

WORKDIR /app

# Copy essential files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma 
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env .env
COPY --from=builder /app/package.json ./package.json

# If you have generated mongo client into `generated/mongo-client`, copy it too
COPY --from=builder /app/generated ./generated            

# Copy entrypoint and give permission
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

RUN npm install --omit=dev

EXPOSE 5000
CMD ["./docker-entrypoint.sh"]
