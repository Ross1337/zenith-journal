import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'zenith:isPublic';

/** Opts a route out of the global Clerk guard (health checks, webhooks…). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
