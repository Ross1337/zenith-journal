/**
 * ZENITH color system — "The Observatory".
 *
 * Identity: a deep violet-cast night sky ("void"), lit by a solar-gold accent —
 * the star at its zenith. Profit/loss use aurora mint & ember coral, never the
 * sector's stock green/red. 100% original — see DESIGN.md.
 */

/** Backgrounds & surfaces — elevation by lightness, violet-cast neutrals. */
export const surface = {
  /** App background — the void. */
  void: '#0A0B10',
  /** Raised panel (cards, sidebar). */
  raised: '#10121A',
  /** Second elevation (nested cards, table headers). */
  high: '#161925',
  /** Overlays: popovers, dropdowns, modals. */
  overlay: '#1D2130',
  /** Interactive surface hover. */
  hover: '#1A1E2B',
} as const;

export const border = {
  subtle: '#1E2330',
  default: '#252B3D',
  strong: '#323A52',
  /** Signature hairline — used in the "horizon" gradient. */
  luminous: 'rgba(242, 181, 68, 0.35)',
} as const;

export const text = {
  primary: '#F2F4FA',
  secondary: '#A8B0C4',
  muted: '#5F687E',
  faint: '#3D4357',
  /** Text on gold accent surfaces. */
  onAccent: '#16120A',
} as const;

/** Solar gold — the ZENITH brand accent. Action, focus, brand moments. */
export const gold = {
  default: '#F2B544',
  hover: '#FFCA66',
  active: '#D99C2B',
  subdued: '#8A6A2B',
  /** Translucent washes for backgrounds & glows. */
  glow: 'rgba(242, 181, 68, 0.16)',
  wash: 'rgba(242, 181, 68, 0.08)',
} as const;

/** Ion violet — secondary accent for informational data & selected states. */
export const ion = {
  default: '#8B7CF6',
  hover: '#A99DFF',
  subdued: '#4A4189',
  wash: 'rgba(139, 124, 246, 0.10)',
} as const;

/** P&L semantics — aurora mint / ember coral (+ colorblind-safe variant). */
export const pnl = {
  profit: '#41E0A3',
  profitDim: '#1F7A58',
  profitWash: 'rgba(65, 224, 163, 0.10)',
  loss: '#F2555F',
  lossDim: '#8C3038',
  lossWash: 'rgba(242, 85, 95, 0.10)',
  breakeven: '#8A93A8',
  /** Colorblind-safe alternative (blue / orange). */
  cbProfit: '#4DA3FF',
  cbLoss: '#FFA94D',
} as const;

export const status = {
  info: '#6CB7FF',
  warning: '#F2B544',
  danger: '#F2555F',
  success: '#41E0A3',
} as const;

/** Categorical palette for charts (setup × instrument, tags…). Gold first. */
export const chartSeries = [
  '#F2B544', // solar gold
  '#8B7CF6', // ion violet
  '#41E0A3', // aurora mint
  '#6CB7FF', // sky
  '#F2555F', // ember
  '#5EE0DC', // cyan
  '#E08BD4', // orchid
  '#C9D16B', // lichen
] as const;

/** Light theme ("Daylight") — warm paper, same accents recalibrated. */
export const light = {
  surface: {
    void: '#FAFAF7',
    raised: '#FFFFFF',
    high: '#F2F1EC',
    overlay: '#FFFFFF',
    hover: '#F5F4F0',
  },
  border: {
    subtle: '#EAE8E1',
    default: '#DEDBD2',
    strong: '#C5C1B4',
    luminous: 'rgba(176, 124, 24, 0.40)',
  },
  text: {
    primary: '#191A20',
    secondary: '#4D5263',
    muted: '#80869B',
    faint: '#B4B9C9',
    onAccent: '#16120A',
  },
  gold: {
    default: '#B07C18',
    hover: '#8F6410',
    active: '#75520D',
    subdued: '#D9B36A',
    glow: 'rgba(176, 124, 24, 0.14)',
    wash: 'rgba(176, 124, 24, 0.07)',
  },
  pnl: {
    profit: '#0E9F6E',
    loss: '#D6353F',
    breakeven: '#6B7280',
  },
} as const;

export const colors = {
  surface,
  border,
  text,
  gold,
  ion,
  pnl,
  status,
  chartSeries,
  light,
} as const;
