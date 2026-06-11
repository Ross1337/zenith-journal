'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateJournalEntryInput,
  CreateTradeInput,
  UpdateProfileInput,
} from '@zenith/types';
import { useTokenGetter } from '@/components/providers';
import {
  createApiClient,
  type CreateAccountPayload,
  type JournalFilters,
  type MetricsFilters,
  type TradeFilters,
  type UpdateAccountPayload,
  type UpdateTradePayload,
} from './api-client';

export function useApi() {
  const getToken = useTokenGetter();
  return useMemo(() => createApiClient(getToken), [getToken]);
}

// ── Queries ──────────────────────────────────────────────────────────

export function useAccounts() {
  const api = useApi();
  return useQuery({ queryKey: ['accounts'], queryFn: () => api.accounts.list() });
}

export function useTrades(filters: TradeFilters = {}) {
  const api = useApi();
  return useQuery({
    queryKey: ['trades', filters],
    queryFn: () => api.trades.list(filters),
  });
}

/** Summary + equity curve + daily P&L in one hook — the dashboard's data. */
export function useDashboardMetrics(filters: MetricsFilters = {}) {
  const api = useApi();
  const summary = useQuery({
    queryKey: ['metrics', 'summary', filters],
    queryFn: () => api.metrics.summary(filters),
  });
  const equity = useQuery({
    queryKey: ['metrics', 'equity', filters],
    queryFn: () => api.metrics.equity(filters),
  });
  const daily = useQuery({
    queryKey: ['metrics', 'daily', filters],
    queryFn: () => api.metrics.daily(filters),
  });
  return {
    summary: summary.data,
    equity: equity.data,
    daily: daily.data,
    isLoading: summary.isLoading || equity.isLoading || daily.isLoading,
    isError: summary.isError || equity.isError || daily.isError,
  };
}

export function useJournal(filters: JournalFilters = {}) {
  const api = useApi();
  return useQuery({
    queryKey: ['journal', filters],
    queryFn: () => api.journal.list(filters),
  });
}

export function useRegenerateApiKey() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.me.regenerateApiKey(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useProfile() {
  const api = useApi();
  return useQuery({ queryKey: ['me'], queryFn: () => api.me.get() });
}

export function useSubscription() {
  const api = useApi();
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => api.billing.subscription(),
  });
}

// ── Mutations ────────────────────────────────────────────────────────

/** Trades shift P&L everywhere — invalidate the whole data layer. */
function useInvalidateTradeData() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ['trades'] });
    void qc.invalidateQueries({ queryKey: ['metrics'] });
    void qc.invalidateQueries({ queryKey: ['accounts'] });
  };
}

export function useCreateTrade() {
  const api = useApi();
  const invalidate = useInvalidateTradeData();
  return useMutation({
    mutationFn: (input: CreateTradeInput) => api.trades.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateTrade() {
  const api = useApi();
  const invalidate = useInvalidateTradeData();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateTradePayload & { id: string }) =>
      api.trades.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTrade() {
  const api = useApi();
  const invalidate = useInvalidateTradeData();
  return useMutation({
    mutationFn: (id: string) => api.trades.remove(id),
    onSuccess: invalidate,
  });
}

export function useCreateJournalEntry() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJournalEntryInput) => api.journal.create(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['journal'] }),
  });
}

export function useDeleteJournalEntry() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.journal.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['journal'] }),
  });
}

export function useUpdateProfile() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.me.update(input),
    onSuccess: (profile) => qc.setQueryData(['me'], profile),
  });
}

export function useCreateAccount() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccountPayload) => api.accounts.create(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useUpdateAccount() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateAccountPayload & { id: string }) =>
      api.accounts.update(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useDeleteAccount() {
  const api = useApi();
  const invalidate = useInvalidateTradeData();
  return useMutation({
    mutationFn: (id: string) => api.accounts.remove(id),
    onSuccess: invalidate,
  });
}
