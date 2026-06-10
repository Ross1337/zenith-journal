import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface AuthedRequest extends Request {
  userId: string;
}

/** Injects the Clerk user id resolved by ClerkAuthGuard. */
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  return ctx.switchToHttp().getRequest<AuthedRequest>().userId;
});
