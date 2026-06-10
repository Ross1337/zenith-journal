import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MetricsService } from './metrics.service';
import { MetricsQuery } from './metrics.dto';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get('summary')
  summary(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(MetricsQuery)) query: MetricsQuery,
  ) {
    return this.metrics.summary(userId, query);
  }

  @Get('equity')
  equity(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(MetricsQuery)) query: MetricsQuery,
  ) {
    return this.metrics.equity(userId, query);
  }

  @Get('daily')
  daily(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(MetricsQuery)) query: MetricsQuery,
  ) {
    return this.metrics.daily(userId, query);
  }
}
