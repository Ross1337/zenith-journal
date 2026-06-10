'use client';

import { useEffect } from 'react';
import { useProfile } from '@/lib/hooks';
import { applyTheme } from '@/lib/theme';

/** Keeps <html data-theme> in sync with the saved preference (incl. OS changes on 'auto'). */
export function ThemeSync() {
  const { data: profile } = useProfile();
  const theme = profile?.theme ?? 'dark';

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => applyTheme('auto');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  return null;
}
