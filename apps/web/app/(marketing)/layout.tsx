import { SiteNav, SiteFooter } from '@/components/marketing/site-nav';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void">
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
