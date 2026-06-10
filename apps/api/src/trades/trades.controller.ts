import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { TradesService } from './trades.service';
import { CreateTradeInput, ListTradesQuery, UpdateTradeInput } from './trades.dto';

@Controller('trades')
export class TradesController {
  constructor(private readonly trades: TradesService) {}

  @Get()
  list(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(ListTradesQuery)) query: ListTradesQuery,
  ) {
    return this.trades.list(userId, query);
  }

  @Get(':id')
  get(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.trades.get(userId, id);
  }

  @Post()
  create(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(CreateTradeInput)) input: CreateTradeInput,
  ) {
    return this.trades.create(userId, input);
  }

  @Patch(':id')
  update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTradeInput)) input: UpdateTradeInput,
  ) {
    return this.trades.update(userId, id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.trades.remove(userId, id);
  }
}
