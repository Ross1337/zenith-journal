import { z } from 'zod';

/** Shared filter for all /v1/metrics endpoints. */
export const MetricsQuery = z.object({
  accountId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type MetricsQuery = z.infer<typeof MetricsQuery>;
