import { z } from 'zod';
import { AccountSchema } from '@zenith/types';

/** Create/update payloads derived from the shared Account schema. */
export const CreateAccountInput = AccountSchema.pick({
  name: true,
  broker: true,
  accountType: true,
  currency: true,
  initialBalance: true,
  color: true,
  propConfig: true,
}).partial({ broker: true, currency: true, color: true, propConfig: true });
export type CreateAccountInput = z.infer<typeof CreateAccountInput>;

export const UpdateAccountInput = CreateAccountInput.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateAccountInput = z.infer<typeof UpdateAccountInput>;
