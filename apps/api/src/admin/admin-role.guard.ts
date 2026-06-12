import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';

function verifyAdminJwt(
  token: string,
  secret: string,
): { sub: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts as [string, string, string];
    const expected = createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');
    const sigBuf = Buffer.from(sig, 'ascii');
    const expBuf = Buffer.from(expected, 'ascii');
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
    const raw = Buffer.from(body, 'base64url').toString('utf8');
    const pl = JSON.parse(raw) as Record<string, unknown>;
    if (typeof pl['exp'] === 'number' && pl['exp'] < Math.floor(Date.now() / 1000))
      return null;
    if (typeof pl['sub'] !== 'string') return null;
    return { sub: pl['sub'], role: String(pl['role'] ?? '') };
  } catch {
    return null;
  }
}

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      adminUserId?: string;
    }>();
    const secret = process.env['JWT_SECRET'] ?? process.env['LOCAL_JWT_SECRET'];
    if (!secret) throw new UnauthorizedException('Auth not configured');

    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      throw new UnauthorizedException('Missing bearer token');

    const payload = verifyAdminJwt(header.slice(7), secret);
    if (!payload) throw new UnauthorizedException('Invalid or expired token');
    if (payload.role !== 'ADMIN') throw new ForbiddenException('Admin access required');

    req.adminUserId = payload.sub;
    return true;
  }
}
