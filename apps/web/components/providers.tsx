'use client';

import { createContext, useContext, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import type { TokenGetter } from '@/lib/api-client';

/**
 * App-wide providers. Clerk is optional: without a publishable key the app
 * runs in dev mode — no auth UI, API called token-less (paired with the API's
 * AUTH_DEV_USER escape hatch). Real keys flip everything on, no code changes.
 */

export const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const noToken: TokenGetter = async () => null;
const TokenContext = createContext<TokenGetter>(noToken);

/** Token getter for API calls — Clerk session JWT, or null in dev mode. */
export function useTokenGetter(): TokenGetter {
  return useContext(TokenContext);
}

function ClerkTokenBridge({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  return <TokenContext.Provider value={getToken}>{children}</TokenContext.Provider>;
}

/** Clerk components themed to the Observatory tokens. */
const clerkAppearance = {
  variables: {
    colorPrimary: '#f2b544',
    colorBackground: '#10121a',
    colorText: '#f2f4fa',
    colorTextSecondary: '#a8b0c4',
    colorInputBackground: '#161925',
    colorInputText: '#f2f4fa',
    colorDanger: '#f2555f',
    borderRadius: '10px',
    fontFamily: 'var(--font-ui), Inter, system-ui, sans-serif',
  },
  elements: {
    card: { boxShadow: '0 16px 64px rgba(3, 4, 8, 0.65)', border: '1px solid #252b3d' },
    formButtonPrimary: { color: '#16120a', fontWeight: 600 },
  },
} as const;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  const app = <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

  if (!clerkEnabled) return app;
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <ClerkTokenBridge>{app}</ClerkTokenBridge>
    </ClerkProvider>
  );
}
