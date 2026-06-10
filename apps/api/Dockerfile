# ZENITH API — multi-stage build. Context: repo root.
#   docker build -f apps/api/Dockerfile .

# ── Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/calc/package.json ./packages/calc/
COPY packages/ui-tokens/package.json ./packages/ui-tokens/
RUN npm ci

COPY packages ./packages
COPY apps/api ./apps/api
# Builds @zenith/types + @zenith/calc first, then prisma generate + tsc.
RUN npx turbo run build --filter=@zenith/api

# ── Production deps only ─────────────────────────────────────────────
FROM node:22-alpine AS prod-deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/calc/package.json ./packages/calc/
COPY packages/ui-tokens/package.json ./packages/ui-tokens/
RUN npm ci --omit=dev --workspace apps/api --include-workspace-root=false \
  || npm ci --omit=dev
# Some deps resolve nested under the workspace — make sure the dir exists to copy.
RUN mkdir -p apps/api/node_modules

# ── Runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /repo

COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=prod-deps /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=prod-deps /repo/package.json ./package.json
COPY --from=build /repo/packages/types/package.json ./packages/types/
COPY --from=build /repo/packages/types/dist ./packages/types/dist
COPY --from=build /repo/packages/calc/package.json ./packages/calc/
COPY --from=build /repo/packages/calc/dist ./packages/calc/dist
COPY --from=build /repo/apps/api/package.json ./apps/api/
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/apps/api/prisma.config.ts ./apps/api/

WORKDIR /repo/apps/api
RUN mkdir -p /repo/apps/api/uploads && chown -R node:node /repo/apps/api/uploads
USER node
EXPOSE 4000

# Apply pending migrations, then serve.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
