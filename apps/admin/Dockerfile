# ZENITH admin panel — standalone Next.js build. Context: repo root.
FROM node:22-alpine AS build
WORKDIR /repo

COPY apps/admin/package.json ./apps/admin/package.json
RUN cd apps/admin && npm install

COPY apps/admin ./apps/admin

ARG NEXT_PUBLIC_API_URL=/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1

RUN cd apps/admin && npm run build

# Runtime
FROM node:22-alpine
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3001
WORKDIR /app

COPY --from=build /repo/apps/admin/.next/standalone ./
COPY --from=build /repo/apps/admin/.next/static ./.next/static

USER node
EXPOSE 3001
CMD ["node", "server.js"]
