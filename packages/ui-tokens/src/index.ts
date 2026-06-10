export * from './colors';
export * from './typography';
export * from './layout';
export * from './effects';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, radius, zIndex, breakpoints, layout } from './layout';
import { shadow, gradient, motion } from './effects';

/** The complete ZENITH token tree — single import for RN / charts / theming. */
export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  zIndex,
  breakpoints,
  layout,
  shadow,
  gradient,
  motion,
} as const;

export type ZenithTokens = typeof tokens;
