import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { UsersService } from '../users/users.service';
import { MtIngestService } from './mt-ingest.service';
import { MtIngestInput } from './mt-ingest.dto';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

/**
 * Generic webhook endpoint — accepts the same MT payload but takes the API
 * key from the X-Zenith-Key header so callers like Zapier, Make.com, or
 * custom scripts don't need to embed it in the body.
 */
@Controller('trades/ingest')
export class WebhookIngestController {
  constructor(
    private readonly service: MtIngestService,
    private readonly users: UsersService,
  ) {}

  @Public()
  @Post('webhook')
  async ingestWebhook(
    @Headers('x-zenith-key') headerKey: string | undefined,
    @Body(new ZodValidationPipe(MtIngestInput.omit({ apiKey: true }).extend({ apiKey: MtIngestInput.shape.apiKey.optional() }))) input: Omit<typeof MtIngestInput._type, 'apiKey'> & { apiKey?: string },
  ) {
    const apiKey = headerKey ?? input.apiKey;
    if (!apiKey) throw new UnauthorizedException('Provide API key via X-Zenith-Key header or apiKey field');
    return this.service.ingest({ ...input, apiKey } as Parameters<MtIngestService['ingest']>[0]);
  }
}
