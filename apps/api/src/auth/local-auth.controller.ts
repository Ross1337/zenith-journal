import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { randomUUID, createHmac, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { PrismaService } from "../prisma/prisma.service";
import { Public } from "./public.decorator";
import { CurrentUser } from "./current-user.decorator";

const scryptAsync = promisify(scrypt);

// ── JWT helpers (HS256 via node:crypto) ─────────────────────────────

export function signLocalJwt(payload: Record<string, unknown>, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  const body = Buffer.from(
    JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifyLocalJwt(token: string, secret: string): { sub: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const header = parts[0] as string;
    const body = parts[1] as string;
    const sig = parts[2] as string;
    const expected = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
    const sigBuf = Buffer.from(sig, "ascii");
    const expBuf = Buffer.from(expected, "ascii");
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
    const raw = Buffer.from(body, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const pl = parsed as Record<string, unknown>;
    if (typeof pl["exp"] === "number" && pl["exp"] < Math.floor(Date.now() / 1000)) return null;
    if (typeof pl["sub"] !== "string") return null;
    return { sub: pl["sub"] };
  } catch {
    return null;
  }
}

// ── Password helpers (scrypt via node:crypto) ────────────────────────

async function hashPassword(password: string): Promise<string> {
  const salt = randomUUID().replace(/-/g, "");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const colonIdx = stored.indexOf(":");
  if (colonIdx < 0) return false;
  const salt = stored.slice(0, colonIdx);
  const hash = stored.slice(colonIdx + 1);
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, "hex");
  if (derived.length !== storedBuf.length) return false;
  return timingSafeEqual(derived, storedBuf);
}

function getSecret(): string {
  const secret = process.env["JWT_SECRET"] ?? process.env["LOCAL_JWT_SECRET"];
  if (!secret) throw new BadRequestException("Auth not configured (missing JWT_SECRET)");
  return secret;
}

// ── Controller ────────────────────────────────────────────────────────

@Controller("auth")
export class LocalAuthController {
  private readonly logger = new Logger(LocalAuthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Post("register")
  async register(
    @Body() body: { email?: string; password?: string; name?: string },
  ): Promise<{ token: string; userId: string; email: string }> {
    const { email, password, name } = body;
    if (!email || !password) throw new BadRequestException("email and password are required");
    if (password.length < 6) throw new BadRequestException("password must be at least 6 characters");

    const secret = getSecret();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException("An account with this email already exists");

    const id = `local_${randomUUID().replace(/-/g, "")}`;
    const passwordHash = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: { id, email, displayName: name ?? email.split("@")[0], passwordHash, apiKey: randomUUID() },
    });

    const token = signLocalJwt({ sub: user.id, email: user.email }, secret);
    this.logger.log(`Registered user ${user.email} (${user.id})`);
    return { token, userId: user.id, email: user.email! };
  }

  @Public()
  @Post("login")
  async login(
    @Body() body: { email?: string; password?: string },
  ): Promise<{ token: string; userId: string; email: string }> {
    const { email, password } = body;
    if (!email || !password) throw new UnauthorizedException("email and password are required");

    const secret = getSecret();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) throw new UnauthorizedException("Invalid credentials");

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Invalid credentials");

    const token = signLocalJwt({ sub: user.id, email: user.email }, secret);
    return { token, userId: user.id, email: user.email! };
  }

  @Get("me")
  async me(@CurrentUser() userId: string): Promise<{ id: string; email: string | null; displayName: string | null }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true },
    });
    if (!user) throw new UnauthorizedException("User not found");
    return user;
  }
}
