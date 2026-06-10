/**
 * ZENITH typography.
 * - Display: Space Grotesk — geometric, slightly technical, memorable.
 * - UI/body: Inter — neutral workhorse.
 * - Data: JetBrains Mono, tabular numerals — every number in the product.
 */

export const fontFamily = {
  display: "'Space Grotesk', 'Inter', system-ui, sans-serif",
  ui: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace",
} as const;

/** Type scale — perfect-fourth-ish, tuned for dense data UIs. */
export const fontSize = {
  /** Hero numerals / marketing display. */
  display: { size: '3.5rem', lineHeight: '1.05', letterSpacing: '-0.02em' },
  h1: { size: '1.75rem', lineHeight: '1.2', letterSpacing: '-0.015em' },
  h2: { size: '1.375rem', lineHeight: '1.25', letterSpacing: '-0.01em' },
  h3: { size: '1.125rem', lineHeight: '1.3', letterSpacing: '-0.005em' },
  body: { size: '0.9375rem', lineHeight: '1.5', letterSpacing: '0' },
  small: { size: '0.8125rem', lineHeight: '1.45', letterSpacing: '0' },
  /** Table cells, dense data. */
  data: { size: '0.8125rem', lineHeight: '1.4', letterSpacing: '0.01em' },
  /** Overlines, column headers — uppercase tracked. */
  label: { size: '0.6875rem', lineHeight: '1.3', letterSpacing: '0.08em' },
  /** KPI card numerals. */
  kpi: { size: '1.625rem', lineHeight: '1.1', letterSpacing: '-0.01em' },
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Always set on numeric data: keeps columns aligned. */
export const numericFeatures = "'tnum' 1, 'lnum' 1" as const;

export const typography = { fontFamily, fontSize, fontWeight, numericFeatures } as const;
