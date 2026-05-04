FROM oven/bun:1 AS base
WORKDIR /app

# ─── Stage 1: Prune ───────────────────────────────────────────────
FROM base AS pruner
COPY . .
RUN bunx turbo prune backend --docker

# ─── Stage 2: Install & Build ─────────────────────────────────────
FROM base AS builder

# 1. Copy lockfile and package.json's to cache the install layer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock

# 2. Install dependencies (This layer caches perfectly!)
RUN bun install --frozen-lockfile

# 3. Copy the actual source code
COPY --from=pruner /app/out/full/ .

# 4. Generate Prisma and Build via Turbo
RUN bunx prisma generate --schema=./packages/db/prisma/schema.prisma
RUN bunx turbo run build --filter=backend...

# ─── Stage 3: Runner ──────────────────────────────────────────────
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Setup non-root user for security
RUN groupadd --system --gid 1001 bunjs && \
    useradd --system --uid 1001 --gid bunjs bunjs

# Copy the ENTIRE pruned workspace from the builder stage
# This guarantees all monorepo symlinks and relative paths stay perfectly intact
COPY --from=builder --chown=bunjs:bunjs /app .

EXPOSE 8000

# Run the start script (Ensure it uses relative paths, e.g., cd apps/backend && ...)
CMD ["sh", "./apps/backend/start.sh"]