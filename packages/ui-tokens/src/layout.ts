/** ZENITH spacing, radii, z-index, breakpoints. 4px base grid. */

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

/** Crisp, slightly sharp radii — premium instrument, not a toy. */
export const radius = {
  xs: '4px',
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '20px',
  full: '9999px',
} as const;

export const zIndex = {
  base: 0,
  sticky: 10,
  drawer: 30,
  overlay: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const layout = {
  /** Fixed sidebar width (web app shell). */
  sidebarWidth: '232px',
  sidebarCollapsed: '64px',
  topbarHeight: '56px',
  contentMaxWidth: '1440px',
} as const;
