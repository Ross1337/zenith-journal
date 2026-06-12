import { SiteNav, SiteFooter } from "@/components/marketing/site-nav";
import { ArcticThemeForcer } from "@/components/marketing/arctic-theme-forcer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void">
      <ArcticThemeForcer />
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
