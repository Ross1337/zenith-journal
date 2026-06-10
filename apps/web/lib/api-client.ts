import { z } from 'zod';
import {
  AccountSchema,
  DailyPnlSchema,
  EquityPointSchema,
  JournalEntrySchema,
  MetricsSummarySchema,
  TradeSchema,
  UserProfileSchema,
  type Account,
  type CreateJournalEntryInput,
  type CreateTradeInput,
  type DailyPnl,
  type EquityPoint,
  type JournalEntry,
  type MetricsSummary,
  type Trade,
  type UpdateProfileInput,
  type UserProfile,
} from '@zenith/types';

/**
 * Typed fetch layer for the ZENITH API. Every response is parsed through the
 * shared zod contracts — dates are revived, drift between API and web fails
 * loudly here instead of deep inside a chart.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

/** API media paths (`/v1/uploads/…`) → absolute URLs for <img>. */
export function mediaUrl(path: string): string {
  return path.startsWith('http') ? path : `${BASE.replace(/\/v1$/, '')}${path}`;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type TokenGetter = () => Promise<string | null>;

export interface TradeFilters {
  accountId?: string;
  symbol?: string;
  direction?: 'long' | 'short';
  status?: 'open' | 'closed';
  outcome?: 'win' | 'loss' | 'breakeven';
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface MetricsFilters {
  accountId?: string;
  from?: string;
  to?: string;
}

const TradeListSchema = z.object({ items: z.array(TradeSchema), total: z.number().int() });
export type TradeList = z.infer<typeof TradeListSchema>;

const JournalListSchema = z.object({
  items: z.array(JournalEntrySchema),
  total: z.number().int(),
});
export type JournalList = z.infer<typeof JournalListSchema>;

export interface JournalFilters {
  type?: JournalEntry['type'];
  tradingDay?: string;
  limit?: number;
  offset?: number;
}

// ── CSV import ──────────────────────────────────────────────────────

export interface ImportFill {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  commission: number;
  fees: number;
  executedAt: string;
  externalId: string;
}

export interface ImportPreviewTrade {
  symbol: string;
  direction: 'long' | 'short';
  status: 'open' | 'closed';
  openedAt: string;
  closedAt: string | null;
  qty: number;
  avgEntry: number;
  avgExit: number | null;
  netPnl: number | null;
  fillCount: number;
}

export interface ImportPreview {
  fills: ImportFill[];
  trades: ImportPreviewTrade[];
  totalNetPnl: number;
  duplicates: number;
  errors: string[];
}

export interface ImportResult {
  batchId: string;
  importedExecutions: number;
  importedTrades: number;
  skippedDuplicates: number;
}

export type UpdateTradePayload = Partial<CreateTradeInput> & { reviewed?: boolean };
export type CreateAccountPayload = Pick<
  Account,
  'name' | 'accountType' | 'initialBalance'
> &
  Partial<Pick<Account, 'broker' | 'currency' | 'color' | 'propConfig'>>;
export type UpdateAccountPayload = Partial<CreateAccountPayload> & { isActive?: boolean };

function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function createApiClient(getToken: TokenGetter) {
  async function request<T>(
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any — zod Input ≠ Output when defaults exist
    opts: { method?: string; body?: unknown; schema?: z.ZodType<T, z.ZodTypeDef, any> } = {},
  ): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${BASE}${path}`, {
      method: opts.method ?? 'GET',
      headers: {
        ...(opts.body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });

    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      const message =
        (detail && typeof detail.message === 'string' && detail.message) ||
        `Request failed (${res.status})`;
      throw new ApiError(res.status, message);
    }
    if (res.status === 204) return undefined as T;

    const json: unknown = await res.json();
    return opts.schema ? opts.schema.parse(json) : (json as T);
  }

  return {
    accounts: {
      list: (): Promise<Account[]> => request('/accounts', { schema: z.array(AccountSchema) }),
      create: (body: CreateAccountPayload): Promise<Account> =>
        request('/accounts', { method: 'POST', body, schema: AccountSchema }),
      update: (id: string, body: UpdateAccountPayload): Promise<Account> =>
        request(`/accounts/${id}`, { method: 'PATCH', body, schema: AccountSchema }),
      remove: (id: string): Promise<void> => request(`/accounts/${id}`, { method: 'DELETE' }),
    },
    trades: {
      list: (filters: TradeFilters = {}): Promise<TradeList> =>
        request(`/trades${buildQuery({ ...filters })}`, { schema: TradeListSchema }),
      get: (id: string): Promise<Trade> => request(`/trades/${id}`, { schema: TradeSchema }),
      create: (body: CreateTradeInput): Promise<Trade> =>
        request('/trades', { method: 'POST', body, schema: TradeSchema }),
      update: (id: string, body: UpdateTradePayload): Promise<Trade> =>
        request(`/trades/${id}`, { method: 'PATCH', body, schema: TradeSchema }),
      remove: (id: string): Promise<void> => request(`/trades/${id}`, { method: 'DELETE' }),
      addMedia: (id: string, body: { url: string }): Promise<{ id: string; url: string }> =>
        request(`/trades/${id}/media`, { method: 'POST', body }),
      listMedia: (id: string): Promise<Array<{ id: string; url: string }>> =>
        request(`/trades/${id}/media`),
    },
    journal: {
      list: (filters: JournalFilters = {}): Promise<JournalList> =>
        request(`/journal${buildQuery({ ...filters })}`, { schema: JournalListSchema }),
      create: (body: CreateJournalEntryInput): Promise<JournalEntry> =>
        request('/journal', { method: 'POST', body, schema: JournalEntrySchema }),
      update: (id: string, body: Partial<CreateJournalEntryInput>): Promise<JournalEntry> =>
        request(`/journal/${id}`, { method: 'PATCH', body, schema: JournalEntrySchema }),
      remove: (id: string): Promise<void> => request(`/journal/${id}`, { method: 'DELETE' }),
    },
    me: {
      get: (): Promise<UserProfile> => request('/me', { schema: UserProfileSchema }),
      update: (body: UpdateProfileInput): Promise<UserProfile> =>
        request('/me', { method: 'PATCH', body, schema: UserProfileSchema }),
    },
    imports: {
      preview: async (accountId: string, file: File): Promise<ImportPreview> => {
        const token = await getToken();
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${BASE}/imports/preview?accountId=${accountId}`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: form,
        });
        if (!res.ok) {
          const detail = await res.json().catch(() => null);
          throw new ApiError(res.status, detail?.message ?? `Preview failed (${res.status})`);
        }
        return (await res.json()) as ImportPreview;
      },
      commit: (body: {
        accountId: string;
        instrumentType: Trade['instrumentType'];
        fills: ImportFill[];
      }): Promise<ImportResult> => request('/imports/commit', { method: 'POST', body }),
    },
    uploads: {
      image: async (file: File): Promise<{ url: string }> => {
        const token = await getToken();
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${BASE}/uploads`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: form,
        });
        if (!res.ok) throw new ApiError(res.status, `Upload failed (${res.status})`);
        return (await res.json()) as { url: string };
      },
    },
    metrics: {
      summary: (f: MetricsFilters = {}): Promise<MetricsSummary> =>
        request(`/metrics/summary${buildQuery({ ...f })}`, { schema: MetricsSummarySchema }),
      equity: (f: MetricsFilters = {}): Promise<EquityPoint[]> =>
        request(`/metrics/equity${buildQuery({ ...f })}`, { schema: z.array(EquityPointSchema) }),
      daily: (f: MetricsFilters = {}): Promise<DailyPnl[]> =>
        request(`/metrics/daily${buildQuery({ ...f })}`, { schema: z.array(DailyPnlSchema) }),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
