import { Sidebar } from '@/components/shell/sidebar';
import { TradeModal } from '@/components/trades/trade-modal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dawn">
      <Sidebar />
      <main className="ml-[232px] min-h-screen px-8 py-7">
        <div className="mx-auto max-w-[1240px]">{children}</div>
      </main>
      <TradeModal />
    </div>
  );
}
