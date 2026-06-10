/**
 * ZENITH effects — in a dark UI, depth comes from borders and light, not
 * drop shadows. Signature: the "horizon" hairline and the "dawn" glow.
 */

export const shadow = {
  /** Overlays only — soft ambient. */
  overlay: '0 8px 32px rgba(3, 4, 8, 0.55), 0 2px 8px rgba(3, 4, 8, 0.35)',
  /** Modal layer. */
  modal: '0 16px 64px rgba(3, 4, 8, 0.65), 0 4px 16px rgba(3, 4, 8, 0.4)',
  /** Gold focus ring — keyboard navigation, inputs. */
  focusRing: '0 0 0 2px rgba(242, 181, 68, 0.55)',
  /** Subtle inner top-light on raised surfaces. */
  innerLight: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
} as const;

export const gradient = {
  /** Signature hairline: a sunrise over the horizon. Use as 1px section divider. */
  horizon:
    'linear-gradient(90deg, transparent 0%, rgba(242,181,68,0.55) 50%, transparent 100%)',
  /** Radial dawn glow — page headers, hero sections. */
  dawn: 'radial-gradient(ellipse 60% 45% at 50% 0%, rgba(242,181,68,0.10) 0%, transparent 70%)',
  /** Brand gradient for marketing moments. */
  solar: 'linear-gradient(135deg, #F2B544 0%, #E08BD4 60%, #8B7CF6 100%)',
  /** Profit / loss area fills under curves. */
  profitArea: 'linear-gradient(180deg, rgba(65,224,163,0.22) 0%, rgba(65,224,163,0) 100%)',
  lossArea: 'linear-gradient(180deg, rgba(242,85,95,0.22) 0%, rgba(242,85,95,0) 100%)',
} as const;

export const motion = {
  duration: {
    fast: '120ms',
    base: '200ms',
    slow: '320ms',
  },
  /** "zenith-out" — decisive start, gentle landing. */
  easing: {
    out: 'cubic-bezier(0.22, 1, 0.36, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  },
} as const;
