'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { clearToken, getToken } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/users', label: 'Users', icon: '◎' },
  { href: '/subscriptions', label: 'Subscriptions', icon: '◇' },
  { href: '/affiliates', label: 'Affiliates', icon: '⬡' },
  { href: '/eas', label: 'EAs / Bridges', icon: '⟁' },
  { href: '/stars', label: 'Stars & Badges', icon: '★' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace('/'); return; }
    const e = localStorage.getItem('admin_email') ?? '';
    setEmail(e);
  }, [router]);

  function logout() {
    clearToken();
    router.replace('/');
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080910' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col border-r transition-all duration-200"
        style={{
          width: collapsed ? 56 : 220,
          background: '#0e1018',
          borderColor: '#1e2338',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b" style={{ borderColor: '#1e2338' }}>
          <button onClick={() => setCollapsed(c => !c)} className="text-lg" style={{ color: '#42E2B8' }}>⬡</button>
          {!collapsed && (
            <span className="font-display font-bold text-sm tracking-widest arctic-gradient">
              ZENITH ADMIN
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors"
                style={{
                  color: active ? '#42E2B8' : '#9ba5be',
                  background: active ? 'rgba(66,226,184,0.08)' : 'transparent',
                  borderLeft: active ? '2px solid #42E2B8' : '2px solid transparent',
                }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t" style={{ borderColor: '#1e2338' }}>
          {!collapsed && (
            <p className="text-xs mb-2 truncate" style={{ color: '#6e7790' }}>{email}</p>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm px-2 py-1 rounded transition-colors w-full"
            style={{ color: '#6e7790' }}
            onMouseOver={e => (e.currentTarget.style.color = '#eef1fa')}
            onMouseOut={e => (e.currentTarget.style.color = '#6e7790')}
          >
            <span>↩</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b" style={{ background: '#0e1018', borderColor: '#1e2338' }}>
          <h1 className="font-display text-sm font-semibold" style={{ color: '#eef1fa' }}>
            {NAV_ITEMS.find(n => pathname.startsWith(n.href))?.label ?? 'Admin'}
          </h1>
          <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(66,226,184,0.1)', color: '#42E2B8' }}>
            ADMIN
          </span>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
