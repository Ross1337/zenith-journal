import type { Metadata } from 'next';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { ZenithMark } from '@/components/shell/zenith-mark';

export const metadata: Metadata = { title: 'Create account' };

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-dawn px-4">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <ZenithMark size={30} />
        <span className="font-display text-[17px] font-semibold tracking-[0.18em] text-ink">
          ZENITH
        </span>
      </Link>
      {clerkEnabled ? (
        <SignUp />
      ) : (
        <div className="max-w-sm rounded-lg border border-edge bg-raised p-6 text-center">
          <p className="text-[14px] font-medium text-ink">Auth is not configured</p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            Running in dev mode — set <code className="z-numeric text-gold">CLERK</code> keys to
            enable sign-up. The app is open at{' '}
            <Link href="/dashboard" className="text-gold hover:text-gold-hover">
              /dashboard
            </Link>
            .
          </p>
        </div>
      )}
      <p className="mt-8 text-[12px] text-ink-faint">See your edge clearly.</p>
    </main>
  );
}
