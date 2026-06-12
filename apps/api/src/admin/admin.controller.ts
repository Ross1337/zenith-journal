import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { AdminRoleGuard } from './admin-role.guard';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { signLocalJwt } from '../auth/local-auth.controller';

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const { scrypt, timingSafeEqual } = await import('node:crypto');
  const { promisify } = await import('node:util');
  const scryptAsync = promisify(scrypt);
  const colonIdx = stored.indexOf(':');
  if (colonIdx < 0) return false;
  const salt = stored.slice(0, colonIdx);
  const hash = stored.slice(colonIdx + 1);
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, 'hex');
  if (derived.length !== storedBuf.length) return false;
  return timingSafeEqual(derived, storedBuf);
}

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly prisma: PrismaService,
  ) {}

  /** Public admin login — returns JWT with role=ADMIN */
  @Public()
  @Post('login')
  async login(@Body() body: { email?: string; password?: string }) {
    const { email, password } = body;
    if (!email || !password)
      throw new UnauthorizedException('email and password are required');

    const secret = process.env['JWT_SECRET'] ?? process.env['LOCAL_JWT_SECRET'];
    if (!secret) throw new UnauthorizedException('Auth not configured');

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');
    if (user.role !== 'ADMIN') throw new UnauthorizedException('Admin access required');

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = signLocalJwt({ sub: user.id, email: user.email, role: 'ADMIN' }, secret);
    return { token, userId: user.id, email: user.email };
  }

  @UseGuards(AdminRoleGuard)
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @UseGuards(AdminRoleGuard)
  @Get('users')
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('plan') plan?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      plan,
      search,
    );
  }

  @UseGuards(AdminRoleGuard)
  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @UseGuards(AdminRoleGuard)
  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateUser(id, body as Parameters<AdminService['updateUser']>[1]);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @UseGuards(AdminRoleGuard)
  @Get('affiliates')
  getAffiliates() {
    return this.adminService.getAffiliates();
  }

  @UseGuards(AdminRoleGuard)
  @Patch('affiliates/:id/validate')
  validateAffiliate(@Param('id') id: string) {
    return this.adminService.validateAffiliate(id);
  }

  @UseGuards(AdminRoleGuard)
  @Get('subscriptions')
  getSubscriptions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getSubscriptions(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

    @UseGuards(AdminRoleGuard)
  @Get('eas')
  getEas() {
    return this.adminService.getEas();
  }
}
