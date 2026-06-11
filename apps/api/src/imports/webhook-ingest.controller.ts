import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { MtIngestService } from './mt-ingest.service';
import { MtIngestInput } from './mt-ingest.dto';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

/**
 * Generic webhook endpoint — same payload as the MT ingest but accepts the API
 * key via X-Zenith-Key header (for Zapier, Make.com, custom scripts).
 */
@Controller('trades/ingest')
export class WebhookIngestController {
  constructor(private readonly service: MtIngestService) {}

  @Public()
  @Post('webhook')
  async ingestWebhook(
    @Headers('x-zenith-key') headerKey: string | undefined,
    @Body(new ZodValidationPipe(MtIngestInput.extend({ apiKey: MtIngestInput.shape.apiKey.optional() })))
    input: MtIngestInput & { apiKey?: string },
  ) {
    const apiKey = headerKey ?? input.apiKey;
    if (!apiKey) {
      throw new UnauthorizedException(
        'Provide API key via X-Zenith-Key header or apiKey body field',
      );
    }
    return this.service.ingest({ ...input, apiKey });
  }
}
