import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { CurrentUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { BillingService } from './billing.service';

const CheckoutInput = z.object({ plan: z.enum(['pro', 'lifetime']) });
type CheckoutInput = z.infer<typeof CheckoutInput>;

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('subscription')
  subscription(@CurrentUser() userId: string) {
    return this.billing.getSubscription(userId);
  }

  @Post('checkout')
  checkout(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(CheckoutInput)) input: CheckoutInput,
  ) {
    return this.billing.createCheckout(userId, input.plan);
  }

  @Post('portal')
  portal(@CurrentUser() userId: string) {
    return this.billing.createPortal(userId);
  }

  /** Stripe → us. Signature-verified over the raw body; never authenticated. */
  @Post('webhook')
  @Public()
  @HttpCode(200)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!signature || !req.rawBody) {
      throw new BadRequestException('Missing stripe-signature or raw body');
    }
    let event;
    try {
      event = this.billing.constructEvent(req.rawBody, signature);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }
    await this.billing.handleEvent(event);
    return { received: true };
  }
}
