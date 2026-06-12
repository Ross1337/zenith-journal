import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AuthedRequest } from "./current-user.decorator";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { verifyLocalJwt } from "./local-auth.controller";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const secret = process.env["JWT_SECRET"] ?? process.env["LOCAL_JWT_SECRET"];

    if (!secret) throw new UnauthorizedException("Auth not configured (missing JWT_SECRET)");

    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const payload = verifyLocalJwt(header.slice(7), secret);
    if (!payload) throw new UnauthorizedException("Invalid or expired token");

    req.userId = payload.sub;
    return true;
  }
}
