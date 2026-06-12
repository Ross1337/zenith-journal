import { MobileTopbar } from '@/components/shell/mobile-topbar';
import { Sidebar } from '@/components/shell/sidebar';
import { ThemeSync } from '@/components/shell/theme-sync';
import { TradeModal } from '@/components/trades/trade-modal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dawn">
      {/* Ambient orbs — large blurred glows that give the void its depth.
          Colors follow the active theme. */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 right-[10%] h-[480px] w-[480px] rounded-full blur-[120px]"
        style={{ background: 'var(--primary-glow)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-160px] left-[30%] h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{ background: 'var(--accent-glow)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-[60%] top-[35%] h-[360px] w-[360px] rounded-full blur-[120px]"
        style={{ background: 'var(--z-violet-wash)' }}
      />
      <Sidebar />
      <MobileTopbar />
      <main className="ml-0 min-h-screen px-4 py-5 lg:ml-[232px] lg:px-8 lg:py-7">
        <div className="mx-auto max-w-[1240px]">{children}</div>
      </main>
      <TradeModal />
      <ThemeSync />
    </div>
  );
}
