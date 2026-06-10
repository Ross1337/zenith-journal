export type Theme = 'dark' | 'light' | 'auto';

/** Apply a theme to <html data-theme> — 'auto' follows the OS preference. */
export function applyTheme(theme: Theme): void {
  const resolved =
    theme === 'auto'
      ? window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
      : theme;
  document.documentElement.dataset.theme = resolved;
}
