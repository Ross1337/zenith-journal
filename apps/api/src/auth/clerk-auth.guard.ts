import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';
import type { AuthedRequest } from './current-user.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Verifies the Clerk session JWT from the Authorization header and attaches
 * `userId` to the request. Registered globally (APP_GUARD); opt out with @Public().
 *
 * Dev escape hatch: set AUTH_DEV_USER to skip verification locally —
 * hard-disabled when NODE_ENV=production.
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();

    const devUser = process.env.AUTH_DEV_USER;
    if (devUser && process.env.NODE_ENV !== 'production') {
      req.userId = devUser;
      return true;
    }

    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      this.logger.error('CLERK_SECRET_KEY is not configured');
      throw new UnauthorizedException('Auth is not configured');
    }

    try {
      const payload = await verifyToken(header.slice('Bearer '.length), { secretKey });
      req.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
