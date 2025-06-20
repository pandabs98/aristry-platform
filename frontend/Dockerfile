# Stage 1: Dependency Installation and Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and lock file first
COPY package.json package-lock.json* ./

# Install all dependencies needed to build
RUN npm install

# Copy the rest of your application code
COPY . .

# Optional: pass backend URL at build time
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Build the Next.js app
RUN npm run build

# Stage 2: Slim Production Image
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV production

# Only copy what's needed to run the app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env.production ./.env.production

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "start"]
