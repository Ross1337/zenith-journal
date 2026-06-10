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
import { JournalService } from './journal.service';
import {
  CreateJournalEntryInput,
  ListJournalQuery,
  UpdateJournalEntryInput,
} from './journal.dto';

@Controller('journal')
export class JournalController {
  constructor(private readonly journal: JournalService) {}

  @Get()
  list(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(ListJournalQuery)) query: ListJournalQuery,
  ) {
    return this.journal.list(userId, query);
  }

  @Get(':id')
  get(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.journal.get(userId, id);
  }

  @Post()
  create(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(CreateJournalEntryInput)) input: CreateJournalEntryInput,
  ) {
    return this.journal.create(userId, input);
  }

  @Patch(':id')
  update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateJournalEntryInput)) input: UpdateJournalEntryInput,
  ) {
    return this.journal.update(userId, id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.journal.remove(userId, id);
  }
}
