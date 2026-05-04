#!/bin/sh
set -e

echo "Running migrations..."
bunx prisma migrate deploy --schema=/app/packages/db/prisma/schema.prisma

echo "Starting server..."
bun run index.ts
