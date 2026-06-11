/**
 * Color themes — the three brand identities defined in @zenith/ui-tokens.
 * Independent of the dark/light axis (all three are dark). The chosen theme
 * is a `theme-*` class on <body>, persisted to localStorage.
 */

export type ColorTheme = 'cosmos' | 'ember' | 'arctic';

export const COLOR_THEMES: {
  id: ColorTheme;
  label: string;
  /** Two-stop gradient for the switcher dot. */
  dot: string;
}[] = [
  { id: 'cosmos', label: 'Gold Cosmos', dot: 'linear-gradient(135deg, #F2B544, #00D4FF)' },
  { id: 'ember', label: 'Neon Ember', dot: 'linear-gradient(135deg, #FF5F1F, #FF2D78)' },
  { id: 'arctic', label: 'Arctic Precision', dot: 'linear-gradient(135deg, #42E2B8, #5B8EFF)' },
];

export const DEFAULT_COLOR_THEME: ColorTheme = 'cosmos';
export const COLOR_THEME_KEY = 'zenith-theme';

const CLASSES = ['theme-cosmos', 'theme-ember', 'theme-arctic'];

/** Swap the active `theme-*` class on <body> (preserves font classes). */
export function applyColorTheme(theme: ColorTheme): void {
  const body = document.body;
  body.classList.remove(...CLASSES);
  body.classList.add(`theme-${theme}`);
}

/** Read the persisted theme, falling back to the default. */
export function readColorTheme(): ColorTheme {
  try {
    const v = localStorage.getItem(COLOR_THEME_KEY) as ColorTheme | null;
    if (v && CLASSES.includes(`theme-${v}`)) return v;
  } catch {
    /* SSR / blocked storage */
  }
  return DEFAULT_COLOR_THEME;
}

/**
 * Inline, render-blocking script that applies the saved theme before first
 * paint — prevents a flash of the default Cosmos palette. Injected in <body>.
 */
export const COLOR_THEME_NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem('${COLOR_THEME_KEY}');var ok=['cosmos','ember','arctic'].indexOf(t)>=0?t:'${DEFAULT_COLOR_THEME}';var b=document.body;b.classList.remove('theme-cosmos','theme-ember','theme-arctic');b.classList.add('theme-'+ok);}catch(e){document.body.classList.add('theme-${DEFAULT_COLOR_THEME}');}})();`;
