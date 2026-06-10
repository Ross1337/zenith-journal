# ZENITH — Trading Journal

*See your edge clearly.*

A premium trading journal: log trades in seconds, see your edge in KPIs,
equity curves and behavioral analytics.

## Stack

Turborepo monorepo · **Web** Next.js 14 (App Router, Tailwind, TanStack
Query, Recharts) · **API** NestJS + Prisma 7 + PostgreSQL + Redis ·
**Auth** Clerk · **Billing** Stripe · shared `@zenith/types` (zod contracts),
`@zenith/calc` (P&L/R/KPI math, unit-tested), `@zenith/ui-tokens` (design
system).

```
apps/
  web/        Next.js app — dashboard, trade log, analytics, journal, billing
  api/        NestJS REST API (/v1) — Prisma persistence, CSV import, Stripe
packages/
  types/      zod schemas shared by web/api/mobile
  calc/       isomorphic trading math (pnl, R, drawdown, matching…)
  ui-tokens/  design tokens (Observatory/Daylight themes) + tailwind preset
```

## Quick start (dev)

```bash
npm install
docker run -d --name zenith-pg -e POSTGRES_USER=zenith -e POSTGRES_PASSWORD=zenith \
  -e POSTGRES_DB=zenith -p 5433:5432 postgres:16-alpine

cd apps/api
npx prisma migrate dev      # uses apps/api/.env
npm run db:seed             # demo user, 2 accounts, 50 trades
cd ../..
npm run dev                 # web :3000 + api :4000
```

No Clerk keys? The stack runs in **demo mode**: the web skips auth and the
API attributes requests to `AUTH_DEV_USER`.

## Deploy

```bash
cp .env.example .env        # fill in Clerk/Stripe for production
./deploy.sh --seed          # build + compose up + migrate + demo data
```

Ships as four containers: `web` (standalone Next), `api` (migrates on boot),
`postgres`, `redis`. See `.env.example` for every knob.

## Tests & checks

```bash
npm run test        # @zenith/calc unit tests (vitest)
npm run typecheck   # all workspaces
npm run build       # all workspaces
```

## Design

The visual identity ("Observatory") is documented in [DESIGN.md](DESIGN.md) —
original tokens in `packages/ui-tokens`, no part of it is borrowed from
competitor screenshots.
