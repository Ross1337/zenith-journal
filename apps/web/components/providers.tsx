"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/lib/i18n-context";
import type { TokenGetter } from "@/lib/api-client";

const noToken: TokenGetter = async () => null;
const TokenContext = createContext<TokenGetter>(noToken);

export function useTokenGetter(): TokenGetter {
  return useContext(TokenContext);
}

function LocalTokenProvider({ children }: { children: React.ReactNode }) {
  const getToken = useCallback<TokenGetter>(async () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("zenith_token");
  }, []);
  return <TokenContext.Provider value={getToken}>{children}</TokenContext.Provider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <LocalTokenProvider>{children}</LocalTokenProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}
