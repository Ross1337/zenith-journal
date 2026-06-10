import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { TradesModule } from './trades/trades.module';
import { MetricsModule } from './metrics/metrics.module';
import { UploadsModule } from './uploads/uploads.module';
import { JournalModule } from './journal/journal.module';
import { UsersModule } from './users/users.module';
import { ImportsModule } from './imports/imports.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AccountsModule,
    TradesModule,
    MetricsModule,
    UploadsModule,
    JournalModule,
    UsersModule,
    ImportsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
