import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MtIngestService } from './mt-ingest.service';
import { MtIngestInput } from './mt-ingest.dto';

/** Receives closed-trade payloads from the ZenithEA Expert Advisor (MT4/MT5). */
@Controller('trades/ingest')
export class MtIngestController {
  constructor(private readonly service: MtIngestService) {}

  @Public()
  @Post('mt')
  ingestMt(@Body(new ZodValidationPipe(MtIngestInput)) input: MtIngestInput) {
    return this.service.ingest(input);
  }
}
