# ZENITH web — standalone Next.js build. Context: repo root.
#   docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=… .
# NEXT_PUBLIC_* vars are inlined at build time — pass them as build args.

# ── Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/calc/package.json ./packages/calc/
COPY packages/ui-tokens/package.json ./packages/ui-tokens/
RUN npm ci

COPY packages ./packages
COPY apps/web ./apps/web

ARG NEXT_PUBLIC_API_URL=http://localhost:4000/v1
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    NEXT_TELEMETRY_DISABLED=1

RUN npx turbo run build --filter=@zenith/web

# ── Runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
WORKDIR /app

COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public

USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
