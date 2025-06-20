#!/bin/sh

echo "📦 Waiting for PostgreSQL to be ready..."
until nc -z postgres 5432; do
  sleep 1
done

echo "🚀 Running Prisma migration..."
npx prisma db push --schema=./prisma/postgres/schema.prisma

echo "✅ Starting backend server..."
exec npm start
