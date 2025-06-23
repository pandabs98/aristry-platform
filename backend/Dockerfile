# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy Prisma schema only
COPY prisma ./prisma

# Generate Prisma clients inside the Docker environment
# RUN npx prisma generate --schema=./prisma/postgres/schema.prisma
# RUN npx prisma generate --schema=./prisma/mongodb/schema.prisma

# Generate Prisma clients
RUN echo "📦 Generating Prisma Client for PostgreSQL..." \
  && npx prisma generate --schema=./prisma/postgres/schema.prisma

RUN echo "📦 Generating Prisma Client for MongoDB..." \
  && npx prisma generate --schema=./prisma/mongodb/schema.prisma



# Now copy the full app
COPY . .

# Stage 2: Final image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env .env
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 5000
CMD ["./docker-entrypoint.sh"]
