'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Global UI state — account scope, the Log Trade modal + the mobile sidebar drawer. */
interface UiState {
  /** null = all accounts aggregated. */
  accountId: string | null;
  setAccountId: (id: string | null) => void;
  tradeModalOpen: boolean;
  openTradeModal: () => void;
  closeTradeModal: () => void;
  /** Mobile-only drawer state — the sidebar is always visible on lg+. Not persisted. */
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      accountId: null,
      setAccountId: (accountId) => set({ accountId }),
      tradeModalOpen: false,
      openTradeModal: () => set({ tradeModalOpen: true }),
      closeTradeModal: () => set({ tradeModalOpen: false }),
      sidebarOpen: false,
      openSidebar: () => set({ sidebarOpen: true }),
      closeSidebar: () => set({ sidebarOpen: false }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'zenith-ui',
      partialize: (s) => ({ accountId: s.accountId }),
    },
  ),
);
