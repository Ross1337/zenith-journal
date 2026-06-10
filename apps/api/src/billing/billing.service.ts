import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import type { Subscription } from '../generated/prisma/client';

export type Plan = 'pro' | 'lifetime';

const FREE_TRADES_PER_MONTH = 50;
const FREE_ACCOUNTS = 1;

/**
 * Stripe billing. Plans: free (default), pro ($14.99/mo subscription),
 * lifetime ($199 one-time). Stripe state is mirrored into the
 * subscriptions table by the webhook — the app only ever reads local state.
 * Without STRIPE_SECRET_KEY the API runs fully unlocked (demo mode).
 */
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe | null;
  private readonly webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';

  constructor(private readonly prisma: PrismaService) {
    const key = process.env.STRIPE_SECRET_KEY;
    this.stripe = key ? new Stripe(key) : null;
    if (!this.stripe) {
      this.logger.warn('STRIPE_SECRET_KEY not set — billing disabled, all features unlocked.');
    }
  }

  get enabled(): boolean {
    return this.stripe !== null;
  }

  async getSubscription(userId: string): Promise<{
    plan: 'free' | Plan;
    status: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    billingEnabled: boolean;
  }> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    return {
      plan: (sub?.plan as 'free' | Plan) ?? 'free',
      status: sub?.status ?? 'active',
      currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
      billingEnabled: this.enabled,
    };
  }

  // ── Checkout & portal ──────────────────────────────────────────────

  async createCheckout(userId: string, plan: Plan): Promise<{ url: string }> {
    const stripe = this.requireStripe();
    const priceId =
      plan === 'pro' ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_LIFETIME;
    if (!priceId) {
      throw new ServiceUnavailableException(`Price id for plan "${plan}" is not configured`);
    }

    const customerId = await this.ensureCustomer(userId);
    const session = await stripe.checkout.sessions.create({
      mode: plan === 'pro' ? 'subscription' : 'payment',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${this.webOrigin}/billing?checkout=success`,
      cancel_url: `${this.webOrigin}/billing?checkout=canceled`,
      metadata: { userId, plan },
      ...(plan === 'pro' && { subscription_data: { metadata: { userId } } }),
    });
    if (!session.url) throw new BadRequestException('Stripe did not return a checkout URL');
    return { url: session.url };
  }

  async createPortal(userId: string): Promise<{ url: string }> {
    const stripe = this.requireStripe();
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeCustomerId) {
      throw new BadRequestException('No billing profile yet — subscribe first');
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${this.webOrigin}/billing`,
    });
    return { url: session.url };
  }

  // ── Webhook ────────────────────────────────────────────────────────

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    const stripe = this.requireStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new ServiceUnavailableException('STRIPE_WEBHOOK_SECRET is not configured');
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }

  async handleEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as Plan | undefined;
        if (!userId || !plan) {
          this.logger.warn(`checkout.session.completed without metadata (${session.id})`);
          return;
        }
        await this.upsertSubscription(userId, {
          plan,
          status: 'active',
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
          stripeSubscriptionId:
            typeof session.subscription === 'string' ? session.subscription : null,
        });
        this.logger.log(`User ${userId} → ${plan}`);
        return;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const status = mapStatus(sub.status);
        const item = sub.items.data[0];
        await this.prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : undefined,
            // Losing the subscription entirely demotes pro → free; lifetime never demotes.
            ...(status === 'canceled' && { plan: 'free' as const }),
          },
        });
        return;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await this.prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id, plan: 'pro' },
          data: { plan: 'free', status: 'canceled', stripeSubscriptionId: null },
        });
        return;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customer = typeof invoice.customer === 'string' ? invoice.customer : null;
        if (customer) {
          await this.prisma.subscription.updateMany({
            where: { stripeCustomerId: customer, plan: 'pro' },
            data: { status: 'past_due' },
          });
        }
        return;
      }

      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }

  // ── Entitlements ───────────────────────────────────────────────────

  /** Free-plan gate: trades per calendar month. No-op when billing is off or plan is paid. */
  async assertCanAddTrades(userId: string, count: number): Promise<void> {
    if (!this.enabled) return;
    const { plan } = await this.getSubscription(userId);
    if (plan !== 'free') return;

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const used = await this.prisma.trade.count({
      where: { userId, createdAt: { gte: monthStart } },
    });
    if (used + count > FREE_TRADES_PER_MONTH) {
      throw new ForbiddenException(
        `Free plan is limited to ${FREE_TRADES_PER_MONTH} trades per month (${used} used). Upgrade to Pro for unlimited trades.`,
      );
    }
  }

  /** Free-plan gate: single account. */
  async assertCanAddAccount(userId: string): Promise<void> {
    if (!this.enabled) return;
    const { plan } = await this.getSubscription(userId);
    if (plan !== 'free') return;

    const count = await this.prisma.account.count({ where: { userId } });
    if (count >= FREE_ACCOUNTS) {
      throw new ForbiddenException(
        'Free plan is limited to 1 account. Upgrade to Pro for unlimited accounts.',
      );
    }
  }

  // ── Internals ──────────────────────────────────────────────────────

  private requireStripe(): Stripe {
    if (!this.stripe) {
      throw new ServiceUnavailableException('Billing is not configured on this deployment');
    }
    return this.stripe;
  }

  private async ensureCustomer(userId: string): Promise<string> {
    const stripe = this.requireStripe();
    const existing = await this.prisma.subscription.findUnique({ where: { userId } });
    if (existing?.stripeCustomerId) return existing.stripeCustomerId;

    const user = await this.prisma.user.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {},
    });
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { userId },
    });
    await this.upsertSubscription(userId, { stripeCustomerId: customer.id });
    return customer.id;
  }

  private async upsertSubscription(
    userId: string,
    data: Partial<
      Pick<Subscription, 'plan' | 'status' | 'stripeCustomerId' | 'stripeSubscriptionId'>
    >,
  ): Promise<void> {
    await this.prisma.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
    await this.prisma.subscription.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}

function mapStatus(
  s: Stripe.Subscription.Status,
): 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' {
  switch (s) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'incomplete';
  }
}
