import { Sidebar } from '@/components/shell/sidebar';
import { ThemeSync } from '@/components/shell/theme-sync';
import { TradeModal } from '@/components/trades/trade-modal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dawn">
      {/* Ambient orbs — large blurred glows that give the Arctic depth. */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 right-[10%] h-[480px] w-[480px] rounded-full bg-[#42e2b8]/[0.045] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-160px] left-[30%] h-[420px] w-[420px] rounded-full bg-[#5b8eff]/[0.04] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-[60%] top-[35%] h-[360px] w-[360px] rounded-full bg-[#42e2b8]/[0.03] blur-[120px]"
      />
      <Sidebar />
      <main className="ml-[232px] min-h-screen px-8 py-7">
        <div className="mx-auto max-w-[1240px]">{children}</div>
      </main>
      <TradeModal />
      <ThemeSync />
    </div>
  );
}
