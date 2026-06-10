import { z } from 'zod';
import {
  AccountSchema,
  DailyPnlSchema,
  EquityPointSchema,
  MetricsSummarySchema,
  TradeSchema,
  type Account,
  type CreateTradeInput,
  type DailyPnl,
  type EquityPoint,
  type MetricsSummary,
  type Trade,
} from '@zenith/types';

/**
 * Typed fetch layer for the ZENITH API. Every response is parsed through the
 * shared zod contracts — dates are revived, drift between API and web fails
 * loudly here instead of deep inside a chart.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

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
