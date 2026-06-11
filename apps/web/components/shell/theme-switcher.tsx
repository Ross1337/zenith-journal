'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  COLOR_THEMES,
  applyColorTheme,
  readColorTheme,
  COLOR_THEME_KEY,
  type ColorTheme,
} from '@/lib/color-theme';

/**
 * Three round swatches that switch the brand theme (Cosmos / Ember / Arctic).
 * Persists to localStorage and repaints the whole product instantly.
 *
 * `variant="dots"` (default) — compact swatches for the navbar/topbar.
 * `variant="full"` — labelled pills, for settings.
 */
export function ThemeSwitcher({ variant = 'dots' }: { variant?: 'dots' | 'full' }) {
  const [theme, setTheme] = useState<ColorTheme>('cosmos');

  // Sync local state with whatever the no-flash script already applied.
  useEffect(() => {
    setTheme(readColorTheme());
  }, []);

  function choose(next: ColorTheme) {
    setTheme(next);
    applyColorTheme(next);
    try {
      localStorage.setItem(COLOR_THEME_KEY, next);
    } catch {
      /* ignore */
    }
  }

  if (variant === 'full') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {COLOR_THEMES.map((t) => {
          const active = theme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => choose(t.id)}
              aria-pressed={active}
              className={clsx(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-fast',
                active
                  ? 'border-gold bg-gold-wash text-gold'
                  : 'border-edge-strong text-ink-secondary hover:border-gold/60 hover:text-ink',
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: t.dot }}
                aria-hidden
              />
              {t.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Theme">
      {COLOR_THEMES.map((t) => {
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => choose(t.id)}
            title={t.label}
            aria-label={t.label}
            aria-pressed={active}
            className={clsx(
              'h-5 w-5 rounded-full ring-offset-2 ring-offset-void transition-all duration-fast',
              active
                ? 'ring-2 ring-gold scale-110'
                : 'opacity-60 ring-1 ring-edge-strong hover:opacity-100',
            )}
            style={{ background: t.dot }}
          />
        );
      })}
    </div>
  );
}
