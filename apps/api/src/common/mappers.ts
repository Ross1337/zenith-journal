import type { Account, Trade } from '@zenith/types';
import type {
  Account as DbAccount,
  Trade as DbTrade,
} from '../generated/prisma/client';

/**
 * Prisma rows → @zenith/types contracts.
 * Loose string columns (grade, mistakes, propConfig JSON) are zod-validated
 * on the way IN at the API edge, so the casts on the way OUT are safe.
 */

export function toTrade(row: DbTrade): Trade {
  return {
    ...row,
    mistakes: row.mistakes as Trade['mistakes'],
    grade: row.grade as Trade['grade'],
  };
}

export function toAccount(row: DbAccount): Account {
  return {
    ...row,
    propConfig: row.propConfig as Account['propConfig'],
  };
}
