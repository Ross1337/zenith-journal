import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ImportsService } from './imports.service';
import { CommitImportInput } from './imports.dto';

const MAX_BYTES = 4 * 1024 * 1024;

@Controller('imports')
export class ImportsController {
  constructor(private readonly imports: ImportsService) {}

  @Post('preview')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_BYTES } }))
  preview(
    @CurrentUser() userId: string,
    @Query('accountId') accountId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided (field name: "file")');
    if (!accountId) throw new BadRequestException('accountId query param is required');
    return this.imports.preview(userId, accountId, file.buffer.toString('utf8'));
  }

  @Post('commit')
  commit(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(CommitImportInput)) input: CommitImportInput,
  ) {
    return this.imports.commit(userId, input);
  }
}
