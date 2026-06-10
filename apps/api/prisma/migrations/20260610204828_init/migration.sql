-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('live', 'demo', 'prop', 'eval');

-- CreateEnum
CREATE TYPE "InstrumentType" AS ENUM ('stock', 'option', 'future', 'forex', 'crypto', 'cfd');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('long', 'short');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "ExecutionSide" AS ENUM ('buy', 'sell');

-- CreateEnum
CREATE TYPE "TradingSession" AS ENUM ('asia', 'london', 'newyork', 'overlap', 'other');

-- CreateEnum
CREATE TYPE "MarketCondition" AS ENUM ('trend', 'range', 'news', 'volatile', 'quiet');

-- CreateEnum
CREATE TYPE "JournalEntryType" AS ENUM ('daily_plan', 'daily_recap', 'trade_note', 'idea', 'lesson', 'weekly_review');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('free', 'pro', 'lifetime');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'incomplete');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "baseCurrency" CHAR(3) NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "broker" VARCHAR(80),
    "accountType" "AccountType" NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "initialBalance" DOUBLE PRECISION NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL,
    "color" TEXT,
    "propConfig" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tradeId" TEXT,
    "symbol" VARCHAR(32) NOT NULL,
    "instrumentType" "InstrumentType" NOT NULL,
    "side" "ExecutionSide" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "swap" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "executedAt" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "importBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" VARCHAR(32) NOT NULL,
    "instrumentType" "InstrumentType" NOT NULL,
    "direction" "Direction" NOT NULL,
    "status" "TradeStatus" NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "qty" DOUBLE PRECISION NOT NULL,
    "avgEntry" DOUBLE PRECISION NOT NULL,
    "avgExit" DOUBLE PRECISION,
    "initialStop" DOUBLE PRECISION,
    "target" DOUBLE PRECISION,
    "grossPnl" DOUBLE PRECISION,
    "netPnl" DOUBLE PRECISION,
    "commissionTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feesTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "swapTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pnlPct" DOUBLE PRECISION,
    "rRealized" DOUBLE PRECISION,
    "rPlanned" DOUBLE PRECISION,
    "mae" DOUBLE PRECISION,
    "mfe" DOUBLE PRECISION,
    "holdSeconds" INTEGER,
    "strategyId" TEXT,
    "setup" VARCHAR(80),
    "marketCondition" "MarketCondition",
    "session" "TradingSession",
    "timeframe" VARCHAR(16),
    "followedPlan" BOOLEAN,
    "mistakes" TEXT[],
    "emotionPre" INTEGER,
    "emotionDuring" INTEGER,
    "emotionPost" INTEGER,
    "grade" TEXT,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "instrumentFilter" TEXT[],
    "sessionFilter" TEXT[],
    "timeframe" VARCHAR(16),
    "rrTarget" DOUBLE PRECISION,
    "entryRules" TEXT[],
    "exitRules" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "JournalEntryType" NOT NULL,
    "title" VARCHAR(160),
    "content" TEXT NOT NULL,
    "mood" INTEGER,
    "tradingDay" VARCHAR(10),
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_media" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT,
    "tradeId" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'image',
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'free',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics_cache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT,
    "cacheKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE INDEX "executions_accountId_symbol_executedAt_idx" ON "executions"("accountId", "symbol", "executedAt");

-- CreateIndex
CREATE UNIQUE INDEX "executions_accountId_externalId_key" ON "executions"("accountId", "externalId");

-- CreateIndex
CREATE INDEX "trades_userId_openedAt_idx" ON "trades"("userId", "openedAt" DESC);

-- CreateIndex
CREATE INDEX "trades_accountId_openedAt_idx" ON "trades"("accountId", "openedAt" DESC);

-- CreateIndex
CREATE INDEX "trades_userId_symbol_idx" ON "trades"("userId", "symbol");

-- CreateIndex
CREATE INDEX "strategies_userId_idx" ON "strategies"("userId");

-- CreateIndex
CREATE INDEX "journal_entries_userId_tradingDay_idx" ON "journal_entries"("userId", "tradingDay");

-- CreateIndex
CREATE INDEX "journal_media_tradeId_idx" ON "journal_media"("tradeId");

-- CreateIndex
CREATE INDEX "journal_media_journalEntryId_idx" ON "journal_media"("journalEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_userId_name_key" ON "tags"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeCustomerId_key" ON "subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_cache_userId_cacheKey_key" ON "metrics_cache"("userId", "cacheKey");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executions" ADD CONSTRAINT "executions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executions" ADD CONSTRAINT "executions_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "trades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "strategies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_media" ADD CONSTRAINT "journal_media_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_media" ADD CONSTRAINT "journal_media_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics_cache" ADD CONSTRAINT "metrics_cache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
