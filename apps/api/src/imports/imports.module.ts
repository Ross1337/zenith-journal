import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { UsersModule } from '../users/users.module';
import { BillingModule } from '../billing/billing.module';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { MtIngestController } from './mt-ingest.controller';
import { MtIngestService } from './mt-ingest.service';
import { WebhookIngestController } from './webhook-ingest.controller';

@Module({
  imports: [AccountsModule, UsersModule, BillingModule],
  controllers: [ImportsController, MtIngestController, WebhookIngestController],
  providers: [ImportsService, MtIngestService],
  exports: [MtIngestService],
})
export class ImportsModule {}
