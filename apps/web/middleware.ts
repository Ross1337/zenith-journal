import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Auth gate for the app surface. Public: landing, auth pages, static.
 * Without a Clerk key (local/dev/demo) the middleware is a no-op and the API
 * uses its AUTH_DEV_USER escape hatch.
 */

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/trades(.*)',
  '/journal(.*)',
  '/analytics(.*)',
  '/accounts(.*)',
  '/settings(.*)',
  '/billing(.*)',
]);

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default clerkEnabled
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) await auth.protect();
    })
  : function middleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    // Everything except static assets and Next internals.
    '/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|webp|css|js|woff2?)).*)',
    '/(api|trpc)(.*)',
  ],
};
